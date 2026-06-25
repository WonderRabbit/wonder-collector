import ky from "ky"
import type { DestinationConfig, Digest } from "./types"

export type SlackPayload = {
  readonly text: string
  readonly blocks: readonly SlackBlock[]
}

type SlackBlock =
  | {
      readonly type: "header"
      readonly text: {
        readonly type: "plain_text"
        readonly text: string
      }
    }
  | {
      readonly type: "section"
      readonly text: {
        readonly type: "mrkdwn"
        readonly text: string
      }
    }

export type GenericWebhookPayload = {
  readonly event: "threads.digest"
  readonly title: string
  readonly text: string
  readonly items: Digest["items"]
}

export function createSlackPayload(digest: Digest): SlackPayload {
  return {
    text: digest.text,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: digest.title,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: digest.text,
        },
      },
    ],
  }
}

export function createGenericWebhookPayload(digest: Digest): GenericWebhookPayload {
  return {
    event: "threads.digest",
    title: digest.title,
    text: digest.text,
    items: digest.items,
  }
}

export async function sendDigest(destination: DestinationConfig, digest: Digest): Promise<void> {
  switch (destination.type) {
    case "generic":
      await postJson(destination.url, createGenericWebhookPayload(digest))
      return
    case "slack":
      await postJson(destination.url, createSlackPayload(digest))
      return
    default:
      return assertNever(destination)
  }
}

async function postJson(url: string, payload: GenericWebhookPayload | SlackPayload): Promise<void> {
  await ky.post(url, {
    json: payload,
    timeout: 15_000,
    retry: {
      limit: 2,
      methods: ["post"],
      statusCodes: [408, 429, 500, 502, 503, 504],
    },
  })
}

function assertNever(value: never): never {
  throw new Error(`Unhandled destination type: ${JSON.stringify(value)}`)
}
