# 25장. OpenAI 호환 API로 외부 도구 연결

> **이 장의 목표**
> "ChatGPT를 쓰는 도구"라면
> 그 안에 들어가는 모델을
> **내 맥의 로컬 모델로 바꾸는 법**을 익힙니다.
>
> 이 한 가지만 알면
> 시중 AI 도구의 70%가 로컬화 가능합니다.

---

## 25.1 핵심 한 줄

> **OpenAI API의 `base_url` 만 바꾸면
> 로컬 모델로 동작합니다.**

OpenAI:

```text
https://api.openai.com/v1
```

Ollama:

```text
http://localhost:11434/v1
```

LM Studio:

```text
http://localhost:1234/v1
```

같은 형식이라 **나머지 코드는 그대로**.

---

## 25.2 왜 이게 가능한가

대부분 도구가 OpenAI SDK를 사용합니다.

이때 도구가 보는 건:

```text
POST {base_url}/chat/completions
```

그래서 `base_url` 만 바꾸면
**그 자리에 어떤 모델이 있든** 통신이 됩니다.

Ollama·LM Studio·llama-server·mlx-lm.server 모두
OpenAI 호환 엔드포인트를 제공합니다 (20장).

---

## 25.3 가장 쉬운 예 — curl 한 번

```bash
$ curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:8b",
    "messages": [
      {"role": "system", "content": "너는 한국어로 답해."},
      {"role": "user",   "content": "안녕"}
    ]
  }'
```

응답:

```json
{
  "id": "...",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "안녕하세요! 무엇을 도와드릴까요?"
      }
    }
  ]
}
```

이게 다입니다.

---

## 25.4 Python — OpenAI SDK

가장 흔한 방법.

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",   # 아무 문자열이나 OK
)

resp = client.chat.completions.create(
    model="qwen3:8b",
    messages=[
        {"role": "system", "content": "너는 한국어로 답해."},
        {"role": "user",   "content": "안녕"},
    ],
)

print(resp.choices[0].message.content)
```

OpenAI 코드 예제를 인터넷에서 찾았다면
**`api_key`** 와 **`base_url`** 두 줄만 바꿔주면 됩니다.

---

## 25.5 Node.js — openai 패키지

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

const resp = await client.chat.completions.create({
  model: "qwen3:8b",
  messages: [
    { role: "user", content: "안녕" },
  ],
});

console.log(resp.choices[0].message.content);
```

---

## 25.6 어떤 도구들이 base_url 변경을 지원하나?

생각보다 많습니다.

### IDE / 개발 도구

- **Continue.dev** (VS Code, JetBrains)
- **Cursor** (일부 모드)
- **Cline** (VS Code 자율 코딩)
- **Aider** (터미널 페어 프로그래밍)
- **Zed** AI

### 채팅 UI

- **Open WebUI** — ChatGPT 같은 웹 UI
- **LibreChat**
- **AnythingLLM**

### 자동화·워크플로

- **n8n**
- **Make / Zapier 일부 노드**
- **LangChain / LangGraph**
- **LlamaIndex**

### Agent 프레임워크

- **Auto-GPT 계열**
- **CrewAI**
- **LangGraph**

이 모든 도구가
**base_url 한 줄**로 로컬 모델을 받아들입니다.

---

## 25.7 Continue.dev (VS Code 통합) 예

`~/.continue/config.json` 또는 GUI 설정:

```json
{
  "models": [
    {
      "title": "Qwen3 32B (Local)",
      "provider": "openai",
      "model": "qwen3:32b",
      "apiBase": "http://localhost:11434/v1",
      "apiKey": "ollama"
    }
  ]
}
```

이러면 VS Code 안에서
**ChatGPT 자리에 내 로컬 모델**이 들어옵니다.

자세한 셋업은 37장.

---

## 25.8 Open WebUI — 사내 ChatGPT 만들기

ChatGPT 같은 웹 인터페이스를 사내 서버에 띄울 수 있습니다.

```bash
$ docker run -d -p 3000:8080 \
    -e OPENAI_API_BASE_URL=http://host.docker.internal:11434/v1 \
    -e OPENAI_API_KEY=ollama \
    -v open-webui:/app/backend/data \
    --name open-webui \
    ghcr.io/open-webui/open-webui:main
```

브라우저로 `http://localhost:3000` 접속하면
**ChatGPT 같은 화면**으로 로컬 모델과 대화 가능.

사내망에 띄우면 팀원 모두가 쓸 수 있습니다.

자세한 셋업은 38장.

---

## 25.9 표준이 아닌 부분 — 도구마다 다를 수 있음

OpenAI **호환** 이지만, 100%는 아닙니다.

차이가 자주 나는 부분:

| 기능 | Ollama | LM Studio | mlx-lm | llama-server |
|---|:-:|:-:|:-:|:-:|
| `chat/completions` 기본 | ✅ | ✅ | ✅ | ✅ |
| Streaming | ✅ | ✅ | ✅ | ✅ |
| `tools` (function calling) | ⚠ 일부 | ⚠ 일부 | ⚠ | ⚠ |
| `response_format` (JSON) | ⚠ | ✅ | ⚠ | ⚠ |
| 임베딩 `embeddings` 엔드포인트 | ✅ | ✅ | ⚠ | ✅ |
| 비전 입력 | ⚠ | ✅ | ⚠ | ⚠ |

**기본 채팅은 어디서나 됩니다.**
고급 기능은 도구별 문서를 한 번씩 확인.

---

## 25.10 환경변수로 분리

코드에 base_url을 박지 말고 환경변수로:

```bash
# ~/.zshrc
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_API_KEY="ollama"
```

```python
from openai import OpenAI
client = OpenAI()  # 환경변수 자동 사용
```

이러면 **로컬 / 클라우드 전환**이 환경변수 한 줄로 끝.

---

## 25.11 보안 — 사내 사용 시

기본 Ollama·LM Studio API는
**localhost** 만 듣습니다.

다른 컴퓨터에서 접근하려면 추가 설정:

```bash
# Ollama가 모든 인터페이스에서 듣게
$ OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

⚠ **주의:**

- 사내망에 노출하면 누구나 API 호출 가능
- 별도 인증 게이트(예: Nginx + Basic Auth)를 앞에 두기
- 또는 사내망 VPN 안에서만 접근 가능하게

38장에서 자세히.

---

## 25.12 한 도구에서 여러 모델 라우팅

같은 base_url 안에서
모델 이름만 바꿔서 호출하면 됩니다.

```python
resp = client.chat.completions.create(model="qwen3:8b",  ...)
resp = client.chat.completions.create(model="qwen3:32b", ...)
resp = client.chat.completions.create(model="gemma3:27b", ...)
```

Ollama 같은 매니저는 **자동으로 모델 로드/언로드** 합니다.
단, 메모리에 한 번에 하나만 올라옴 (기본 설정).

---

## 25.13 실전 — 회사 도구를 로컬화하는 순서

가장 흔한 도입 순서.

```text
① 일단 OpenAI 형식 API를 쓰는 도구인지 확인
   - 설정에 "OpenAI API Key" 항목이 있으면 거의 OK

② 그 도구가 base_url 변경을 지원하는지 확인
   - 보통 "Base URL", "API Endpoint" 같은 항목

③ Ollama 또는 LM Studio API 서버 켜기

④ base_url, api_key, model 세 가지만 바꿔서 저장

⑤ 작은 모델(8B)로 먼저 동작 확인

⑥ 잘 되면 큰 모델로 교체
```

---

## 이 장에서 기억할 한 가지

> **`base_url` 한 줄만 바꾸면 됩니다.**
>
> ```text
> https://api.openai.com/v1
>           ↓
> http://localhost:11434/v1
> ```
>
> 나머지 코드·도구는 그대로.

---

## 손으로 해볼 것

**1. Python 한 번 호출**

가상환경에서:

```bash
(.venv) $ pip install openai
```

25.4 절 코드를 그대로 실행하세요.
답이 출력되면 성공.

**2. 환경변수 설정**

```bash
$ export OPENAI_BASE_URL="http://localhost:11434/v1"
$ export OPENAI_API_KEY="ollama"
$ python3 -c "from openai import OpenAI; print(OpenAI().chat.completions.create(model='qwen3:8b', messages=[{'role':'user','content':'안녕'}]).choices[0].message.content)"
```

이 한 줄이 동작하면 자동화 준비 완료.

---

다음 장에서는
**RAG (Retrieval Augmented Generation)** —
**내 문서를 모델이 참고하게 하는** 가장 흔한 실무 패턴을 봅니다.
