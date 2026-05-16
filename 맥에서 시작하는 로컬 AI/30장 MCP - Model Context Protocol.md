# 30장. MCP (Model Context Protocol)

> **이 장의 목표**
> 2024년 말 Anthropic이 공개해
> 2025~2026 사이 사실상 표준이 된
> **MCP** 가 뭔지, 왜 중요한지,
> 로컬 모델과 어떻게 쓰는지 정리합니다.

---

## 30.1 한 줄 정의

> **AI 모델과 외부 도구·데이터를 연결하는
> "USB-C 같은" 표준 프로토콜.**

도구를 만들면 **한 번 만들고**
**모든 AI 클라이언트**에서 쓸 수 있게 됩니다.

---

## 30.2 왜 만들어졌나

MCP 이전:

```text
ChatGPT  → 자체 플러그인
Claude   → 자체 도구
Cursor   → 자체 통합
Continue → 자체 통합
...
```

같은 "Slack 메시지 보내기" 도구를
**도구마다 따로** 만들어야 했습니다.

MCP 이후:

```text
[하나의 MCP 서버]
  - Slack
  - Notion
  - GitHub
  - DB
  ↓
[연결]
  ↓
Claude / ChatGPT / Cursor / Cline / Open WebUI / ...
```

도구 한 번 만들면 모든 곳에서 쓸 수 있음.

---

## 30.3 구조

```text
[MCP 클라이언트]              [MCP 서버]
- AI 앱 (Cline, Cursor,        - 실제 도구 구현
  Open WebUI 등)                (Slack, Notion, DB, ...)
       │                            │
       └──── JSON-RPC ──────────────┘
            (stdio 또는 HTTP)
```

MCP 서버는 다음 4가지를 제공할 수 있습니다.

| 종류 | 무엇 |
|---|---|
| **Tools** | 호출 가능한 함수 (28장의 Function Calling과 비슷) |
| **Resources** | 읽을 수 있는 데이터 (파일·URL·DB row) |
| **Prompts** | 미리 정의된 프롬프트 템플릿 |
| **Sampling** | 클라이언트가 다른 LLM을 호출하게 함 |

---

## 30.4 MCP 서버 예 — 이미 있는 것들

수백 개가 공개되어 있습니다.

| 서버 | 무엇 |
|---|---|
| **filesystem** | 파일 읽기·쓰기 |
| **github** | GitHub API |
| **gitlab** | GitLab API |
| **slack** | Slack 메시지 |
| **postgres** | DB 쿼리 |
| **brave-search** | 웹 검색 |
| **puppeteer** | 브라우저 자동화 |
| **memory** | 장기 메모리 저장 |
| **notion** | Notion 페이지 |
| **figma** | Figma 디자인 |
| **time** | 시간·타임존 |

전부 **공개 npm/pypi 패키지**.

---

## 30.5 클라이언트 — 어디서 쓰나

MCP를 받아들이는 클라이언트들:

| 클라이언트 | MCP 지원 |
|---|---|
| **Claude Desktop** | ✅ (최초 공개) |
| **Claude Code** | ✅ |
| **Cursor** | ✅ |
| **Cline** (VS Code) | ✅ |
| **Continue.dev** | ✅ |
| **Open WebUI** | ✅ |
| **Zed** | ✅ |
| **Goose** | ✅ |

> **2025~2026 동안 빠르게 표준화 진행 중.**

---

## 30.6 로컬 모델 + MCP 시나리오

가장 흔한 조합 두 가지.

### ① Cline + Ollama + 파일시스템 MCP

```text
Cline (VS Code Agent)
  ↓ tools via MCP
filesystem MCP server (파일 읽기·쓰기)
  ↓
로컬 폴더
```

`base_url` 을 Ollama로 설정하면
**로컬 32B 모델이 파일 작업을 수행** 합니다.

### ② Open WebUI + Ollama + 사내 MCP

사내에 Postgres·GitHub·Slack MCP 서버를 두고,
Open WebUI에서 로컬 모델이 그걸 호출.

→ **사내 정보 챗봇** 의 표준 구성.

---

## 30.7 가장 작은 MCP 서버 — Python 예

```bash
$ pip install mcp
```

```python
# my_mcp_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("hello-mcp")

@mcp.tool()
def add(a: int, b: int) -> int:
    """두 정수를 더합니다."""
    return a + b

@mcp.tool()
def greet(name: str) -> str:
    """이름으로 인사합니다."""
    return f"안녕, {name}!"

if __name__ == "__main__":
    mcp.run()
```

실행:

```bash
$ python my_mcp_server.py
```

이게 진짜 MCP 서버입니다.
이 서버를 클라이언트(예: Claude Desktop / Cline)에 등록하면
LLM이 `add`, `greet` 를 호출할 수 있습니다.

---

## 30.8 클라이언트 등록 예 — Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hello-mcp": {
      "command": "python",
      "args": ["/Users/kjj/dev/my_mcp_server.py"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/kjj/Documents"]
    }
  }
}
```

재시작하면 Claude Desktop이
**두 MCP 서버를 등록하고 도구를 사용**합니다.

---

## 30.9 Cline + Ollama + MCP

VS Code에서 Cline 설치 후
설정에서:

```text
API Provider: Ollama
Base URL:     http://localhost:11434
Model:        qwen3:32b
```

MCP 서버는 Cline 설정에서 추가.

이렇게 하면 **VS Code 안에서**
**로컬 32B 모델이 MCP 도구로 코드를 수정**합니다.

---

## 30.10 MCP vs Function Calling

| 항목 | Function Calling (28장) | MCP |
|---|---|---|
| 어디서 정의 | 클라이언트 코드 | 별도 서버 |
| 재사용 | 한 앱 안에서 | 여러 앱 |
| 표준 | OpenAI 호환 | MCP 사양 |
| 통신 | 함수 인자 | JSON-RPC |
| 적합 | 작은 앱·간단 도구 | 다중 앱·복잡 통합 |

> **새로 만들면 MCP가 미래.**
> 단, 단순한 앱은 Function Calling이 더 빠릅니다.

---

## 30.11 보안·운영 주의점

29장과 동일하지만 MCP 특유 주의:

- MCP 서버 자체가 권한을 갖습니다 → 서버 작성자가 누구인지 확인
- 출처 모르는 MCP 서버 등록 금지 (공급망 공격 위험)
- `filesystem` MCP는 허용 디렉토리만
- 사내 환경이면 사내 자체 MCP 서버 호스팅

---

## 30.12 MCP 학습 자료

- 공식 사이트: `modelcontextprotocol.io`
- 공식 서버 모음: `github.com/modelcontextprotocol/servers`
- 클라이언트 목록: 공식 문서의 Clients 페이지

---

## 이 장에서 기억할 한 가지

> **MCP는 AI 도구의 표준 USB-C.**
>
> 도구를 한 번 만들면 Claude·Cursor·Cline·Open WebUI 등
> 어디서든 쓸 수 있습니다.
>
> 로컬 모델은 OpenAI 호환 API를 통해
> 자연스럽게 이 생태계에 합류합니다.

---

## 손으로 해볼 것

**1. filesystem MCP 등록**

Claude Desktop이 있다면 30.8 절 설정으로
`filesystem` MCP를 등록하고
"내 Documents 폴더 안 파일 목록 보여줘" 라고 물어보세요.

**2. 30.7의 hello-mcp 서버 만들기**

Python 가상환경에서 30.7 코드 그대로 만들고
Cline 또는 Claude Desktop에 등록.
"3 + 4 좀 더해줘" 라고 물어보면
`add` 도구가 호출되는 걸 볼 수 있습니다.

---

다음 장에서는
**멀티모달** — 비전·음성 모델을 다룹니다.

스크린샷·차트 분석부터 회의록 받아쓰기까지.
