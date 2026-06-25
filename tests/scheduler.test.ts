import { describe, expect, it } from "bun:test"
import { runForever } from "../src/scheduler"
import type { AppConfig, RunOnceResult } from "../src/types"

describe("runForever", () => {
  it("continues scheduling after a transient run failure", async () => {
    // Given
    const config: AppConfig = {
      intervalSeconds: 30,
      source: { type: "fixture", items: [] },
      topics: [{ name: "ai", query: "ai", maxItems: 1, searchType: "TOP", searchMode: "KEYWORD" }],
      destinations: [{ type: "generic", url: "http://127.0.0.1:9999/hook" }],
    }
    const controller = new AbortController()
    const errors: unknown[] = []
    let runs = 0
    const runOnce = async (): Promise<RunOnceResult> => {
      runs += 1
      if (runs === 1) {
        throw new Error("temporary delivery failure")
      }
      controller.abort()
      return { sentCount: 0, itemCount: 0 }
    }

    // When
    await runForever(config, controller.signal, {
      runOnce,
      onError: (error) => errors.push(error),
      wait: async () => undefined,
    })

    // Then
    expect(runs).toBe(2)
    expect(errors).toHaveLength(1)
  })
})
