import { collectTopic } from "./collectors"
import { buildDigest } from "./digest"
import { sendDigest } from "./destinations"
import type { AppConfig, RunOnceResult, TopicDigestInput } from "./types"

export async function runOnce(config: AppConfig): Promise<RunOnceResult> {
  const topicInputs: TopicDigestInput[] = []
  for (const topic of config.topics) {
    const items = await collectTopic(config.source, topic)
    topicInputs.push({ topicName: topic.name, items })
  }

  const digest = buildDigest(topicInputs)
  if (digest.items.length === 0) {
    return { sentCount: 0, itemCount: 0 }
  }

  for (const destination of config.destinations) {
    await sendDigest(destination, digest)
  }

  return {
    sentCount: config.destinations.length,
    itemCount: digest.items.length,
  }
}
