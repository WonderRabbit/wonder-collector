import { describe, expect, it } from "bun:test"
import { createGenericWebhookPayload, createSlackPayload } from "../src/destinations"
import type { Digest } from "../src/types"

describe("destination payload builders", () => {
  it("creates Slack and generic webhook payloads from the same digest", () => {
    // Given
    const digest: Digest = {
      title: "Threads topic digest",
      text: "Threads topic digest\n\n## ai\n- @alice: Useful post\n  https://threads.net/p/1",
      items: [
        {
          topicName: "ai",
          id: "post-1",
          text: "Useful post",
          media_type: "TEXT",
          permalink: "https://threads.net/p/1",
          timestamp: "2026-06-25T01:00:00.000Z",
          username: "alice",
          has_replies: false,
          is_quote_post: false,
          is_reply: false
        }
      ]
    }

    // When
    const slack = createSlackPayload(digest)
    const generic = createGenericWebhookPayload(digest)

    // Then
    expect(slack.text).toContain("Threads topic digest")
    expect(slack.blocks[0]?.type).toBe("header")
    expect(generic.event).toBe("threads.digest")
    expect(generic.items[0]?.topicName).toBe("ai")
  })
})
