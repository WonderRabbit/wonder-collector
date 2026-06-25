# wonder-collect

`wonder-collect` collects configured Threads keyword or topic-tag searches on a schedule and delivers a digest to Slack or a generic webhook.

It uses the official Meta Threads API instead of scraping `threads.com`. Meta's current Threads Keyword and Topic Tag Search docs use:

- `GET https://graph.threads.net/v1.0/keyword_search`
- `q` for the keyword or topic tag
- `search_type` as `TOP` or `RECENT`
- `search_mode` as `KEYWORD` or `TAG`
- `threads_basic` and `threads_keyword_search` permissions

Meta limits unapproved apps to posts owned by the authenticated user. Public post search requires app approval for `threads_keyword_search`.

## Run

```sh
bun install
bun run dev -- --config examples/config.fixture.json --once
```

For a real Threads source, set `source.type` to `threads`, provide a Threads access token, and configure Slack or generic webhook destinations:

```json
{
  "intervalSeconds": 300,
  "source": {
    "type": "threads",
    "accessToken": "THREADS_ACCESS_TOKEN",
    "baseUrl": "https://graph.threads.net/v1.0"
  },
  "topics": [
    { "name": "ai", "query": "artificial intelligence", "searchType": "RECENT", "searchMode": "KEYWORD", "maxItems": 5 },
    { "name": "kpop", "query": "kpop", "searchType": "TOP", "searchMode": "TAG", "maxItems": 5 }
  ],
  "destinations": [
    { "type": "slack", "url": "https://hooks.slack.com/services/..." },
    { "type": "generic", "url": "https://example.com/webhook" }
  ]
}
```

Omit `--once` to keep the scheduler running at `intervalSeconds`.

## Verify

```sh
bun test
bunx tsc --noEmit
```
