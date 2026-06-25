import { runOnce as runOnceService } from "./service"
import type { AppConfig, RunOnceResult } from "./types"

export type SchedulerOptions = {
  readonly runOnce?: (config: AppConfig) => Promise<RunOnceResult>
  readonly onError?: (error: unknown) => void
  readonly wait?: (milliseconds: number, signal: AbortSignal) => Promise<void>
}

export async function runForever(
  config: AppConfig,
  signal: AbortSignal,
  options: SchedulerOptions = {},
): Promise<void> {
  const runOnce = options.runOnce ?? runOnceService
  const waitForNextRun = options.wait ?? wait
  while (!signal.aborted) {
    try {
      await runOnce(config)
    } catch (error) {
      if (error instanceof Error) {
        options.onError?.(error)
      } else {
        options.onError?.(new Error("Unknown scheduled run failure"))
      }
    }
    if (!signal.aborted) {
      await waitForNextRun(config.intervalSeconds * 1000, signal)
    }
  }
}

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, milliseconds)
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true },
    )
  })
}
