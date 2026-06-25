import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { ConfigValidationError, loadConfigFromFile } from "../src/config"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true })
  }
  tempDirs.length = 0
})

describe("loadConfigFromFile", () => {
  it("parses a fixture config when the file contains valid JSON", async () => {
    // Given
    const dir = await mkdtemp(join(tmpdir(), "wonder-collect-config-"))
    tempDirs.push(dir)
    const configPath = join(dir, "config.json")
    await writeFile(
      configPath,
      JSON.stringify({
        intervalSeconds: 120,
        source: {
          type: "fixture",
          items: [
            {
              topic: "ai",
              id: "post-1",
              text: "A useful AI post",
              media_type: "TEXT",
              permalink: "https://threads.net/@alice/post/1",
              timestamp: "2026-06-25T00:00:00.000Z",
              username: "alice",
              has_replies: false,
              is_quote_post: false,
              is_reply: false
            }
          ]
        },
        topics: [{ name: "ai", query: "artificial intelligence", maxItems: 5 }],
        destinations: [{ type: "generic", url: "http://127.0.0.1:9999/hook" }]
      }),
      "utf8",
    )

    // When
    const config = await loadConfigFromFile(configPath)

    // Then
    expect(config.intervalSeconds).toBe(120)
    expect(config.topics[0]?.searchType).toBe("TOP")
    expect(config.topics[0]?.searchMode).toBe("KEYWORD")
    expect(config.destinations[0]?.type).toBe("generic")
  })

  it("rejects invalid config at the boundary", async () => {
    // Given
    const dir = await mkdtemp(join(tmpdir(), "wonder-collect-config-"))
    tempDirs.push(dir)
    const configPath = join(dir, "config.json")
    await writeFile(
      configPath,
      JSON.stringify({
        intervalSeconds: 0,
        source: { type: "fixture", items: [] },
        topics: [],
        destinations: []
      }),
      "utf8",
    )

    // When
    const rejected = loadConfigFromFile(configPath)

    // Then
    await expect(rejected).rejects.toBeInstanceOf(ConfigValidationError)
  })
})
