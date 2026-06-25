import { readFile } from "node:fs/promises"
import { z } from "zod"
import { threadMediaTypes, threadSearchModes, threadSearchTypes } from "./types"
import type { AppConfig } from "./types"

const threadItemSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  media_type: z.string().min(1),
  permalink: z.string().url(),
  timestamp: z.string().min(1),
  username: z.string().min(1),
  has_replies: z.boolean(),
  is_quote_post: z.boolean(),
  is_reply: z.boolean(),
})

const fixtureItemSchema = threadItemSchema.extend({
  topic: z.string().min(1),
})

const topicSchema = z.object({
  name: z.string().min(1),
  query: z.string().min(1),
  maxItems: z.number().int().positive().default(10),
  searchType: z.enum(threadSearchTypes).default("TOP"),
  searchMode: z.enum(threadSearchModes).default("KEYWORD"),
  mediaType: z.enum(threadMediaTypes).optional(),
})

const sourceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("fixture"),
    items: z.array(fixtureItemSchema),
  }),
  z.object({
    type: z.literal("threads"),
    accessToken: z.string().min(1),
    baseUrl: z.string().url().default("https://graph.threads.net/v1.0"),
  }),
])

const destinationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("generic"),
    url: z.string().url(),
  }),
  z.object({
    type: z.literal("slack"),
    url: z.string().url(),
  }),
])

const appConfigSchema = z.object({
  intervalSeconds: z.number().int().min(30),
  source: sourceSchema,
  topics: z.array(topicSchema).min(1),
  destinations: z.array(destinationSchema).min(1),
})

export class ConfigValidationError extends Error {
  readonly issues: readonly string[]

  constructor(issues: readonly string[]) {
    super(`Invalid config: ${issues.join("; ")}`)
    this.name = "ConfigValidationError"
    this.issues = issues
  }
}

export async function loadConfigFromFile(path: string): Promise<AppConfig> {
  const text = await readFile(path, "utf8")
  const parsedJson = JSON.parse(text)
  const parsed = appConfigSchema.safeParse(parsedJson)
  if (parsed.success) {
    return parsed.data
  }

  const issues = parsed.error.issues.map((issue) => {
    const field = issue.path.join(".")
    return field.length > 0 ? `${field}: ${issue.message}` : issue.message
  })
  throw new ConfigValidationError(issues)
}
