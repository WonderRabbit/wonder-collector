import { ConfigValidationError, loadConfigFromFile } from "./config"
import { runForever } from "./scheduler"
import { runOnce } from "./service"

type CliOptions = {
  readonly configPath: string
  readonly once: boolean
}

export function parseArgs(args: readonly string[]): CliOptions {
  const configIndex = args.indexOf("--config")
  const configPath = configIndex >= 0 ? args[configIndex + 1] : undefined
  if (configPath === undefined || configPath.length === 0) {
    throw new ConfigValidationError(["--config: Required"])
  }

  return {
    configPath,
    once: args.includes("--once"),
  }
}

export function formatCliError(error: unknown): string {
  if (error instanceof ConfigValidationError) {
    return error.message
  }
  if (error instanceof Error) {
    return redactSecrets(error.message)
  }
  return "Unknown failure"
}

export function createSchedulerErrorReporter(writeLine: (line: string) => void): (error: unknown) => void {
  return (error) => {
    writeLine(`scheduled run failed: ${formatCliError(error)}`)
  }
}

export async function runCli(args: readonly string[]): Promise<void> {
  const options = parseArgs(args)
  const config = await loadConfigFromFile(options.configPath)

  if (options.once) {
    const result = await runOnce(config)
    console.log(`sent=${result.sentCount} items=${result.itemCount}`)
    return
  }

  const controller = new AbortController()
  process.on("SIGINT", () => controller.abort())
  process.on("SIGTERM", () => controller.abort())
  await runForever(config, controller.signal, {
    onError: createSchedulerErrorReporter((line) => console.error(line)),
  })
}

function redactSecrets(message: string): string {
  return message
    .replace(/https?:\/\/[^\s"')]+/g, (value) => redactUrl(value))
    .replace(/(access_token=)[^&\s"']+/g, "$1[redacted]")
}

function redactUrl(value: string): string {
  try {
    const url = new URL(value)
    return `${url.origin}/[redacted-url]`
  } catch (error) {
    if (error instanceof TypeError) {
      return "[redacted-url]"
    }
    throw error
  }
}
