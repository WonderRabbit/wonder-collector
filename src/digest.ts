import type { Digest, DigestItem, ThreadItem, TopicDigestInput } from "./types"

function formatLine(item: DigestItem): string {
  return `- @${item.username}: ${item.text}\n  ${item.permalink}`
}

export function buildDigest(inputs: readonly TopicDigestInput[]): Digest {
  const seen = new Set<string>()
  const items: DigestItem[] = []

  for (const input of inputs) {
    for (const item of input.items) {
      if (seen.has(item.id) || item.is_reply) {
        continue
      }
      seen.add(item.id)
      items.push({ ...item, topicName: input.topicName })
    }
  }

  const sections = buildSections(items)
  const text = ["Threads topic digest", ...sections].join("\n\n")
  return {
    title: "Threads topic digest",
    text,
    items,
  }
}

function buildSections(items: readonly DigestItem[]): readonly string[] {
  const byTopic = new Map<string, ThreadItem[]>()
  for (const item of items) {
    const existing = byTopic.get(item.topicName) ?? []
    byTopic.set(item.topicName, [...existing, item])
  }

  return Array.from(byTopic.entries()).map(([topic, topicItems]) => {
    const lines = topicItems.map((item) => formatLine({ ...item, topicName: topic }))
    return [`## ${topic}`, ...lines].join("\n")
  })
}
