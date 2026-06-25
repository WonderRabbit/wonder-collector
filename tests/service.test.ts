import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { createServer } from "node:net"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { loadConfigFromFile } from "../src/config"
import { runOnce } from "../src/service"

const servers: { stop(force?: boolean): void }[] = []
const tempDirs: string[] = []

afterEach(async () => {
  for (const server of servers) {
    server.stop(true)
  }
  servers.length = 0
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true })
  }
  tempDirs.length = 0
})

describe("runOnce", () => {
  it("sends a fixture Threads digest to a generic webhook", async () => {
    // Given
    const received: unknown[] = []
    const port = await findFreePort()
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port,
      async fetch(request) {
        received.push(await request.json())
        return new Response("ok")
      }
    })
    servers.push(server)

    const dir = await mkdtemp(join(tmpdir(), "wonder-collect-once-"))
    tempDirs.push(dir)
    const configPath = join(dir, "config.json")
    await writeFile(
      configPath,
      JSON.stringify({
        intervalSeconds: 60,
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
        topics: [{ name: "ai", query: "artificial intelligence" }],
        destinations: [{ type: "generic", url: `http://127.0.0.1:${server.port}/hook` }]
      }),
      "utf8",
    )
    const config = await loadConfigFromFile(configPath)

    // When
    const result = await runOnce(config)

    // Then
    expect(result.sentCount).toBe(1)
    expect(received).toHaveLength(1)
    expect(JSON.stringify(received[0])).toContain("A useful AI post")
  })
})

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      server.close()
      if (address !== null && typeof address === "object") {
        resolve(address.port)
        return
      }
      reject(new Error("Could not allocate a local TCP port"))
    })
    server.on("error", reject)
  })
}
