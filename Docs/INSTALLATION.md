# wonder-collect 설치 설명서

`wonder-collect`는 Threads 관심 주제 검색 결과를 주기적으로 수집해 Slack 또는 generic webhook 메신저로 전달하는 Bun/TypeScript 서비스입니다.

## 1. 요구 사항

- Bun 1.2 이상
- Threads API access token
- Slack Incoming Webhook URL 또는 generic webhook 수신 URL

Threads 실제 검색은 Meta의 공식 Threads API `GET https://graph.threads.net/v1.0/keyword_search`를 사용합니다. `threads_basic`, `threads_keyword_search` 권한이 필요하며, 앱이 `threads_keyword_search` 승인을 받기 전에는 인증된 사용자 소유 게시물 범위로 검색이 제한됩니다.

## 2. 설치

repo 루트에서 의존성을 설치합니다.

```sh
bun install
```

설치 후 기본 검증을 실행합니다.

```sh
bun test
bunx tsc --noEmit
```

## 3. 설정 파일 준비

fixture 기반 로컬 실행은 `examples/config.fixture.json`을 사용할 수 있습니다.

```sh
bun run dev -- --config examples/config.fixture.json --once
```

실제 Threads API를 쓰려면 설정 파일의 `source`를 다음 형태로 바꿉니다.

```json
{
  "source": {
    "type": "threads",
    "accessToken": "THREADS_ACCESS_TOKEN",
    "baseUrl": "https://graph.threads.net/v1.0"
  }
}
```

Slack 전달은 `destinations`에 Slack webhook URL을 넣습니다.

```json
{
  "destinations": [
    {
      "type": "slack",
      "url": "https://hooks.slack.com/services/..."
    }
  ]
}
```

## 4. 운영 전 확인

- `intervalSeconds`는 30 이상이어야 합니다.
- `topics`는 하나 이상 필요합니다.
- `destinations`는 하나 이상 필요합니다.
- 실서비스 token과 webhook URL은 repo에 커밋하지 말고 운영 환경의 비밀 관리 저장소에서 주입하세요.

