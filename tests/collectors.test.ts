import { afterEach, describe, expect, it } from "bun:test"
import { collectTopic } from "../src/collectors"
import type { ThreadsSourceConfig, TopicConfig } from "../src/types"

const servers: { stop(force?: boolean): void }[] = []

afterEach(() => {
  for (const server of servers) {
    server.stop(true)
  }
  servers.length = 0
})

describe("collectTopic", () => {
  it("calls the official Threads keyword search path with configured query parameters", async () => {
    // Given
    const requests: string[] = []
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 18791,
      fetch(request) {
        requests.push(request.url)
        return Response.json({
          data: [
            {
              id: "post-1",
              text: "Threads API result",
              media_type: "TEXT",
              permalink: "https://threads.net/@alice/post/1",
              timestamp: "2026-06-25T00:00:00.000Z",
              username: "alice",
              has_replies: false,
              is_quote_post: false,
              is_reply: false,
            },
          ],
        })
      },
    })
    servers.push(server)
    const source: ThreadsSourceConfig = {
      type: "threads",
      accessToken: "secret-token",
      baseUrl: `http://127.0.0.1:${server.port}`,
    }
    const topic: TopicConfig = {
      name: "ai",
      query: "artificial intelligence",
      maxItems: 3,
      searchType: "RECENT",
      searchMode: "TAG",
      mediaType: "TEXT",
    }

    // When
    const items = await collectTopic(source, topic)

    // Then
    expect(items[0]?.text).toBe("Threads API result")
    const requestUrl = requests[0] ?? ""
    expect(requestUrl).toContain("/keyword_search")
    expect(requestUrl).toContain("q=artificial+intelligence")
    expect(requestUrl).toContain("search_type=RECENT")
    expect(requestUrl).toContain("search_mode=TAG")
    expect(requestUrl).toContain("media_type=TEXT")
    expect(requestUrl).toContain("access_token=secret-token")
  })
})
