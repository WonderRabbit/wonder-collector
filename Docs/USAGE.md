# wonder-collect 사용 설명서

## 1. 한 번만 실행하기

설정 파일 기준으로 한 번 수집하고 digest를 전송합니다.

```sh
bun run dev -- --config examples/config.fixture.json --once
```

성공하면 다음 형태의 결과가 출력됩니다.

```text
sent=1 items=1
```

## 2. 주기 실행하기

`--once`를 빼면 `intervalSeconds` 간격으로 계속 실행됩니다.

```sh
bun run dev -- --config path/to/config.json
```

주기 실행 중 수집 또는 전달 실패가 발생하면 에러를 stderr에 출력하고 다음 주기를 계속 진행합니다. URL과 token은 로그에서 redaction 처리됩니다.

## 3. 설정 필드

최상위 설정:

| 필드 | 설명 |
| --- | --- |
| `intervalSeconds` | 주기 실행 간격입니다. 최소값은 30입니다. |
| `source` | `fixture` 또는 `threads` 수집원입니다. |
| `topics` | 수집할 관심 주제 목록입니다. |
| `destinations` | Slack 또는 generic webhook 전달 대상입니다. |

`topics` 항목:

| 필드 | 설명 |
| --- | --- |
| `name` | digest 섹션에 표시할 주제 이름입니다. |
| `query` | Threads API의 `q` 값입니다. |
| `searchType` | `TOP` 또는 `RECENT`입니다. 기본값은 `TOP`입니다. |
| `searchMode` | `KEYWORD` 또는 `TAG`입니다. 기본값은 `KEYWORD`입니다. |
| `mediaType` | 선택값입니다. `TEXT`, `IMAGE`, `VIDEO`, `CAROUSEL_ALBUM` 중 하나입니다. |
| `maxItems` | 주제별 최대 항목 수입니다. 기본값은 10입니다. |

## 4. 전달 대상

Slack:

```json
{
  "type": "slack",
  "url": "https://hooks.slack.com/services/..."
}
```

Generic webhook:

```json
{
  "type": "generic",
  "url": "https://example.com/webhook"
}
```

Generic webhook은 다음 형태의 JSON payload를 받습니다.

```json
{
  "event": "threads.digest",
  "title": "Threads topic digest",
  "text": "Threads topic digest...",
  "items": []
}
```

## 5. 로컬 테스트

전체 테스트와 타입 검사를 실행합니다.

```sh
bun test
bunx tsc --noEmit
```

테스트에는 fixture 수집, Threads API 요청 경로, digest dedupe, Slack/generic payload, config validation, scheduler recovery, secret redaction 검증이 포함됩니다.

