import { formatCliError, runCli } from "./cli"

// no-excuse-ok: catch top-level CLI boundary
runCli(process.argv.slice(2)).catch((error: unknown) => {
  console.error(formatCliError(error))
  process.exit(1)
})
