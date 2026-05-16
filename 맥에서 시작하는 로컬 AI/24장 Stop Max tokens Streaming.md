# 24장. Stop 토큰, Max tokens, Streaming

> **이 장의 목표**
> 코드로 모델을 호출할 때
> 답변을 **원하는 곳에서 끊고, 흘리고, 제한**하는 옵션들을
> 정리합니다.

---

## 24.1 왜 이걸 알아야 하나

채팅 UI에서는 자동으로 잘 처리되지만,
**자동화 파이프라인** 에서는 직접 설정해야 합니다.

- 답이 너무 길어서 비용·시간 폭주
- 답이 중간에 잘림
- 답이 끝나야 하는데 계속 이어 씀
- 사용자가 답을 실시간으로 보고 싶어함

이걸 컨트롤하는 게 이 장의 옵션들.

---

## 24.2 Max tokens — 출력 길이 한도

모델이 만들 **최대 토큰 수**.

OpenAI 호환 API:

```json
{
  "model": "qwen3:8b",
  "messages": [...],
  "max_tokens": 500
}
```

| 값 | 추천 상황 |
|---|---|
| 50~100 | 단답·분류 |
| 200~500 | 짧은 답·요약 |
| 1000~2000 | 일반 답변 |
| 4000+ | 긴 문서·코드 생성 |

> **너무 크게 잡으면:**
> - 답이 끝나도 모델이 계속 만들려고 함 (보통 stop 조건으로 끊김)
> - prefill 이후 메모리 여유가 줄어듦

너무 작으면 답이 잘려서 끝납니다.

---

## 24.3 Stop 토큰 — 여기서 끊어줘

특정 토큰·문자열이 나오면 **즉시 중단**.

API:

```json
{
  ...
  "stop": ["</answer>", "###", "사용자:"]
}
```

활용 예:

- **JSON 응답에서 추가 텍스트 막기**:
  `"stop": ["```", "\n\n"]`
- **다중 턴 대화에서 다음 사용자 차례 막기**:
  `"stop": ["User:", "사용자:"]`
- **마크다운 헤더 이후 잘라내기**:
  `"stop": ["\n# "]`

> 22장의 Chat Template이 잘못되면
> 모델이 자기 입으로 다음 사용자 차례를 만들기도 합니다.
> Stop 토큰으로 방어할 수 있습니다.

---

## 24.4 EOS / EOT — 모델이 직접 끝내는 토큰

모델 학습 시 정해둔
**"여기가 답의 끝"** 신호 토큰.

```text
Qwen3        →  <|im_end|>
Llama 3      →  <|eot_id|>
Mistral      →  </s>
Gemma 3      →  <end_of_turn>
```

도구가 이걸 자동으로 인식해서 답을 끝냅니다.

문제는 **잘못된 chat template** 으로 호출하면
이 토큰을 모델이 안 만들고 무한 생성합니다.

---

## 24.5 Streaming — 한 토큰씩 흘리기

ChatGPT처럼 답이 흐르는 효과.

```json
{
  ...
  "stream": true
}
```

응답이 **Server-Sent Events** 형식으로 한 청크씩 옵니다.

```text
data: {"choices":[{"delta":{"content":"안"}}]}
data: {"choices":[{"delta":{"content":"녕"}}]}
data: {"choices":[{"delta":{"content":"하"}}]}
...
data: [DONE]
```

장점:

- 첫 토큰까지 빨라 사용자 체감 ↑
- 긴 답변도 즉시 보기 시작

단점:

- 클라이언트 코드가 약간 복잡
- 분류·JSON 작업에선 무의미

---

## 24.6 OpenAI SDK로 streaming 받기

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

stream = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "긴 답변 부탁"}],
    stream=True,
    max_tokens=500,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

이게 가장 일반적인 패턴.

---

## 24.7 Timeout — 멈춰버린 모델 막기

긴 컨텍스트나 메모리 부족 시
모델이 **무한 대기**할 수 있습니다.

```python
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
    timeout=60.0,   # 60초
)
```

또는 요청별:

```python
resp = client.chat.completions.create(
    ...,
    timeout=30.0,
)
```

사내 도구라면 **반드시 timeout 설정.**

---

## 24.8 Retry — 실패 시 재시도

OpenAI SDK 기본 재시도가 있지만 가끔 조정 필요.

```python
client = OpenAI(
    ...,
    max_retries=2,
)
```

재시도 시 주의:

- **streaming + 재시도** 는 중복 응답 가능
- 재시도 가능한 오류(5xx)만 재시도하게
- Idempotency: 같은 입력 → 같은 결과를 기대할 때만

---

## 24.9 Tools / Function calling — 미리보기

모델이 **함수를 호출** 할 수도 있게 하는 옵션.

```json
{
  "messages": [...],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "도시 날씨 조회",
        "parameters": {...}
      }
    }
  ]
}
```

응답에는 보통 텍스트 대신 `tool_calls` 가 옵니다.

```json
{
  "tool_calls": [
    {"name": "get_weather", "arguments": {"city": "Seoul"}}
  ]
}
```

본격적인 내용은 **28장**.

---

## 24.10 응답 형식 — JSON 모드

OpenAI 호환 도구 일부는
**JSON 강제 모드**를 제공합니다.

```json
{
  "response_format": {"type": "json_object"}
}
```

지원 여부는 모델·도구마다 다름.

지원 안 하면 **시스템 프롬프트 + Temperature 0.1** 로 대체.

---

## 24.11 자주 만나는 함정

### 답이 잘림

`max_tokens` 가 너무 작음.
또는 출력에 stop sequence가 잘못 잡힘.

### 답이 안 끝남

- chat template 문제 (22장)
- stop 토큰 누락
- max_tokens 너무 큼

### JSON이 가끔 깨짐

- Temperature ↓
- 시스템 프롬프트에 "JSON만" 강조
- Few-shot 예시 1~2개 추가
- 도구가 지원하면 `response_format` 사용

### Streaming이 화면에서 끊겨 보임

- 클라이언트 버퍼링 문제
- `flush=True` 또는 Server-Sent Events 정상 처리 확인

---

## 24.12 실전 — 자동화 호출 한 줄 정리

자동화에서 자주 쓰는 안전한 호출 템플릿.

```python
resp = client.chat.completions.create(
    model="qwen3:8b",
    messages=messages,
    max_tokens=500,
    temperature=0.2,
    top_p=0.9,
    stream=False,        # 단일 응답
    timeout=30.0,
    stop=["사용자:", "User:"],
)
text = resp.choices[0].message.content.strip()
```

UI 응답이라면 `stream=True` 로 바꿈.

---

## 이 장에서 기억할 한 가지

> **자동화 호출에서 거의 항상 설정해야 할 것:**
>
> - `max_tokens` (출력 길이 한도)
> - `temperature` (23장)
> - `timeout` (멈춤 방지)
>
> 사용자 UI라면 추가로 `stream=True`.

---

## 손으로 해볼 것

**1. max_tokens 효과 확인**

같은 질문에 max_tokens 만 다르게:

```python
for limit in [30, 200, 1000]:
    resp = client.chat.completions.create(
        model="qwen3:8b",
        messages=[{"role":"user","content":"한국 역사를 길게 설명해줘"}],
        max_tokens=limit,
    )
    print(limit, ":", resp.choices[0].message.content[:80], "...")
```

**2. Streaming 직접 받기**

24.6 코드를 그대로 실행해서
ChatGPT처럼 답이 흐르는 걸 보세요.

---

여기까지가 **4부의 끝** 입니다.

같은 모델을 가지고 **더 좋은 답을 뽑는 기술** 4가지를 익혔습니다.

다음 부(5부)에서는
**로컬 AI를 내 업무 도구에 직접 연결**하기 시작합니다.
OpenAI 호환 API부터 RAG, Agent, MCP까지 갑니다.
