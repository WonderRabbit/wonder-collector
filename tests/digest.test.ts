import { describe, expect, it } from "bun:test"
import { buildDigest } from "../src/digest"
import type { TopicDigestInput } from "../src/types"

describe("buildDigest", () => {
  it("dedupes by item id and filters replies from topic sections", () => {
    // Given
    const input: readonly TopicDigestInput[] = [
      {
        topicName: "ai",
        items: [
          {
            id: "post-1",
            text: "Primary post",
            media_type: "TEXT",
            permalink: "https://threads.net/@alice/post/1",
            timestamp: "2026-06-25T01:00:00.000Z",
            username: "alice",
            has_replies: false,
            is_quote_post: false,
            is_reply: false
          },
          {
            id: "post-1",
            text: "Duplicate post",
            media_type: "TEXT",
            permalink: "https://threads.net/@alice/post/1",
            timestamp: "2026-06-25T01:01:00.000Z",
            username: "alice",
            has_replies: false,
            is_quote_post: false,
            is_reply: false
          },
          {
            id: "reply-1",
            text: "Reply should be filtered",
            media_type: "TEXT",
            permalink: "https://threads.net/@bob/post/2",
            timestamp: "2026-06-25T01:02:00.000Z",
            username: "bob",
            has_replies: false,
            is_quote_post: false,
            is_reply: true
          }
        ]
      }
    ]

    // When
    const digest = buildDigest(input)

    // Then
    expect(digest.items).toHaveLength(1)
    expect(digest.text).toContain("Primary post")
    expect(digest.text).not.toContain("Duplicate post")
    expect(digest.text).not.toContain("Reply should be filtered")
  })
})
