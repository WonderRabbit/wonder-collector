import ky from "ky"
import { z } from "zod"
import type { FixtureThreadItem, SourceConfig, ThreadItem, TopicConfig } from "./types"

const threadsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      text: z.string().default(""),
      media_type: z.string(),
      permalink: z.string().url(),
      timestamp: z.string(),
      username: z.string(),
      has_replies: z.boolean().default(false),
      is_quote_post: z.boolean().default(false),
      is_reply: z.boolean().default(false),
    }),
  ),
})

export async function collectTopic(source: SourceConfig, topic: TopicConfig): Promise<readonly ThreadItem[]> {
  switch (source.type) {
    case "fixture":
      return source.items.filter((item) => item.topic === topic.name).slice(0, topic.maxItems).map(toThreadItem)
    case "threads":
      return collectThreadsTopic(source.baseUrl, source.accessToken, topic)
    default:
      return assertNever(source)
  }
}

function toThreadItem(item: FixtureThreadItem): ThreadItem {
  return {
    id: item.id,
    text: item.text,
    media_type: item.media_type,
    permalink: item.permalink,
    timestamp: item.timestamp,
    username: item.username,
    has_replies: item.has_replies,
    is_quote_post: item.is_quote_post,
    is_reply: item.is_reply,
  }
}

async function collectThreadsTopic(
  baseUrl: string,
  accessToken: string,
  topic: TopicConfig,
): Promise<readonly ThreadItem[]> {
  const searchParams: Record<string, string> = {
    q: topic.query,
    search_type: topic.searchType,
    search_mode: topic.searchMode,
    fields: "id,text,media_type,permalink,timestamp,username,has_replies,is_quote_post,is_reply",
    access_token: accessToken,
  }
  if (topic.mediaType !== undefined) {
    searchParams["media_type"] = topic.mediaType
  }

  const json = await ky
    .get("keyword_search", {
      prefixUrl: baseUrl,
      searchParams,
      timeout: 15_000,
      retry: {
        limit: 2,
        methods: ["get"],
        statusCodes: [408, 429, 500, 502, 503, 504],
      },
    })
    .json()

  return threadsResponseSchema.parse(json).data.slice(0, topic.maxItems)
}

function assertNever(value: never): never {
  throw new Error(`Unhandled source type: ${JSON.stringify(value)}`)
}
