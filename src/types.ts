export const threadSearchTypes = ["TOP", "RECENT"] as const
export const threadSearchModes = ["KEYWORD", "TAG"] as const
export const threadMediaTypes = ["TEXT", "IMAGE", "VIDEO", "CAROUSEL_ALBUM"] as const

export type ThreadSearchType = (typeof threadSearchTypes)[number]
export type ThreadSearchMode = (typeof threadSearchModes)[number]
export type ThreadMediaType = (typeof threadMediaTypes)[number]

export type ThreadItem = {
  readonly id: string
  readonly text: string
  readonly media_type: ThreadMediaType | string
  readonly permalink: string
  readonly timestamp: string
  readonly username: string
  readonly has_replies: boolean
  readonly is_quote_post: boolean
  readonly is_reply: boolean
}

export type FixtureThreadItem = ThreadItem & {
  readonly topic: string
}

export type TopicConfig = {
  readonly name: string
  readonly query: string
  readonly maxItems: number
  readonly searchType: ThreadSearchType
  readonly searchMode: ThreadSearchMode
  readonly mediaType?: ThreadMediaType | undefined
}

export type FixtureSourceConfig = {
  readonly type: "fixture"
  readonly items: readonly FixtureThreadItem[]
}

export type ThreadsSourceConfig = {
  readonly type: "threads"
  readonly accessToken: string
  readonly baseUrl: string
}

export type SourceConfig = FixtureSourceConfig | ThreadsSourceConfig

export type GenericDestinationConfig = {
  readonly type: "generic"
  readonly url: string
}

export type SlackDestinationConfig = {
  readonly type: "slack"
  readonly url: string
}

export type DestinationConfig = GenericDestinationConfig | SlackDestinationConfig

export type AppConfig = {
  readonly intervalSeconds: number
  readonly source: SourceConfig
  readonly topics: readonly TopicConfig[]
  readonly destinations: readonly DestinationConfig[]
}

export type TopicDigestInput = {
  readonly topicName: string
  readonly items: readonly ThreadItem[]
}

export type DigestItem = ThreadItem & {
  readonly topicName: string
}

export type Digest = {
  readonly title: string
  readonly text: string
  readonly items: readonly DigestItem[]
}

export type RunOnceResult = {
  readonly sentCount: number
  readonly itemCount: number
}
