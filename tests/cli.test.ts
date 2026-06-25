import { describe, expect, it } from "bun:test"
import { createSchedulerErrorReporter, formatCliError } from "../src/cli"

describe("formatCliError", () => {
  it("redacts Threads access tokens from URL-shaped errors", () => {
    // Given
    const error = new Error(
      "Request failed for https://graph.threads.net/v1.0/keyword_search?q=ai&access_token=secret-token-123&search_type=RECENT",
    )

    // When
    const message = formatCliError(error)

    // Then
    expect(message).toContain("https://graph.threads.net/[redacted-url]")
    expect(message).not.toContain("secret-token-123")
  })

  it("reports scheduled cycle failures without exposing Threads tokens", () => {
    // Given
    const lines: string[] = []
    const reporter = createSchedulerErrorReporter((line) => lines.push(line))
    const error = new Error("failed https://graph.threads.net/v1.0/keyword_search?access_token=secret-token")

    // When
    reporter(error)

    // Then
    expect(lines[0]).toContain("scheduled run failed:")
    expect(lines[0]).toContain("https://graph.threads.net/[redacted-url]")
    expect(lines[0]).not.toContain("secret-token")
  })

  it("redacts Slack and generic webhook URLs from delivery failures", () => {
    // Given
    const error = new Error(
      "Request failed for https://hooks.slack.com/services/T000/B000/secret and https://example.com/webhook/customer-secret?token=abc123",
    )

    // When
    const message = formatCliError(error)

    // Then
    expect(message).toContain("https://hooks.slack.com/[redacted-url]")
    expect(message).toContain("https://example.com/[redacted-url]")
    expect(message).not.toContain("secret")
    expect(message).not.toContain("abc123")
  })
})
