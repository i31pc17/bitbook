# 28장. Function Calling / Tool Use

> **이 장의 목표**
> "모델이 우리 API를 직접 호출"
> 하는 게 어떻게 가능한지 이해합니다.
>
> 그리고 로컬 모델로 그걸 구현하는 첫 코드를 짭니다.

---

## 28.1 한 줄로

> **모델이 텍스트 대신
> "이 함수를 이 인자로 부르고 싶어"라는 JSON을 만들고,
> 우리 코드가 그 함수를 실제로 실행하는 것.**

이것 자체가 Agent의 기반입니다.

---

## 28.2 흐름

```text
[사용자] "서울 날씨 알려줘"
       │
       ▼
[LLM에 사용 가능한 도구 목록 + 질문 전달]
       │
       ▼
[LLM] "get_weather(city='Seoul') 호출하고 싶음"
       │
       ▼
[우리 코드] 실제 get_weather('Seoul') 실행 → "맑음 22도"
       │
       ▼
[LLM에 결과 전달] "도구가 '맑음 22도'를 반환했음"
       │
       ▼
[LLM] "서울은 현재 맑고 22도입니다."
```

LLM은 **실행자가 아니라 결정자**.
실제 실행은 항상 우리 코드가 합니다.

---

## 28.3 도구 정의 — JSON Schema

OpenAI 형식.

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "도시의 현재 날씨를 조회합니다.",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string", "description": "도시 이름 (예: 'Seoul')"}
          },
          "required": ["city"]
        }
      }
    }
  ]
}
```

핵심:

- **`name`**: 함수 이름
- **`description`**: **LLM이 이걸 보고 호출 여부 결정** → 명확하게!
- **`parameters`**: JSON Schema 형식

---

## 28.4 첫 코드 (Python + Ollama)

```python
from openai import OpenAI
import json

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

# 1. 실제 함수
def get_weather(city: str) -> str:
    fake_db = {"Seoul": "맑음 22도", "Tokyo": "흐림 18도"}
    return fake_db.get(city, "정보 없음")

# 2. 도구 정의
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "도시의 현재 날씨를 조회합니다.",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"}
            },
            "required": ["city"]
        }
    }
}]

# 3. 첫 호출 — 도구 사용 의도 결정
messages = [{"role": "user", "content": "서울 날씨 알려줘"}]
resp = client.chat.completions.create(
    model="qwen3:32b",
    messages=messages,
    tools=tools,
)

msg = resp.choices[0].message
messages.append(msg)

# 4. 도구 호출 실행
if msg.tool_calls:
    for call in msg.tool_calls:
        args = json.loads(call.function.arguments)
        result = get_weather(**args)
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": result,
        })

# 5. 결과를 모델에게 다시 — 최종 답변
resp = client.chat.completions.create(
    model="qwen3:32b",
    messages=messages,
)
print(resp.choices[0].message.content)
```

---

## 28.5 어떤 모델이 도구 호출을 잘하나?

지원 여부와 품질이 모델마다 다릅니다.

### 잘하는 모델 (2026 기준)

- **Qwen 3 시리즈 (특히 32B+)**
- **Llama 3.3 70B Instruct**
- **DeepSeek R1 (Thinking 후 호출)**
- **Mistral Large·Mixtral**

### 약한 모델

- 작은 7~8B 일반 모델 (가끔 형식 깨짐)
- Base 모델
- 일부 한국어 특화 작은 모델

> **추천:** Function Calling은 **14B 이상** 부터.
> 가능하면 32B 이상.

---

## 28.6 로컬 모델의 흔한 함정

### 함정 ① 형식이 가끔 깨짐

JSON 따옴표 빠짐, 인자 누락 등.

대처:

- **시스템 프롬프트에 강조**
- **`response_format: json_schema` 지원 모델 우선**
- **재시도 로직**

### 함정 ② 도구를 너무 자주 / 너무 안 부름

- description을 더 명확히
- system 프롬프트에:
  "정보가 필요하면 적극적으로 도구를 사용해"
- 또는 반대로:
  "단순 질문은 도구 없이 답해"

### 함정 ③ 한국어 인자가 깨짐

- 도시 이름이 "서울" → 모델이 "Seoul"로 바꿔 부름
- description에 명시:
  "도시 이름은 영어로 (예: 'Seoul')"
  또는 한국어 그대로 받는 함수로 만들기

---

## 28.7 자주 만드는 도구 예시

### 검색

```json
{
  "name": "search_wiki",
  "description": "사내 위키에서 키워드로 문서 검색",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {"type": "string"},
      "top_k": {"type": "integer", "default": 5}
    },
    "required": ["query"]
  }
}
```

### 파일 읽기

```json
{
  "name": "read_file",
  "description": "프로젝트 안의 파일을 읽음",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {"type": "string"}
    },
    "required": ["path"]
  }
}
```

### 코드 실행

```json
{
  "name": "run_python",
  "description": "샌드박스에서 Python 코드 실행",
  "parameters": {
    "type": "object",
    "properties": {
      "code": {"type": "string"}
    },
    "required": ["code"]
  }
}
```

⚠ **`run_python`, `run_shell`은 위험.** 29장에서.

---

## 28.8 다중 호출 — Tool Loop

LLM이 한 번에 끝나지 않을 수 있습니다.

```text
1차: search_wiki("휴가 규정")  →  3개 문서 결과
2차: read_file("docs/leave.md")  →  문서 내용
3차: 최종 답변
```

루프 패턴:

```python
while True:
    resp = client.chat.completions.create(
        model="qwen3:32b",
        messages=messages,
        tools=tools,
    )
    msg = resp.choices[0].message
    messages.append(msg)

    if not msg.tool_calls:
        break  # 텍스트 답변이 나오면 종료

    for call in msg.tool_calls:
        result = dispatch(call.function.name, json.loads(call.function.arguments))
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": str(result),
        })
```

이 루프가 Agent의 출발점입니다 (29장).

---

## 28.9 평행 호출 (Parallel Tool Calls)

한 번에 도구 여러 개를 부를 수도 있습니다.

```python
msg.tool_calls  # [call1, call2, ...]
```

`call1` 과 `call2` 가 서로 독립이면 병렬 실행 가능.

성능 향상 큼.
단, 모델·도구 지원 여부 확인.

---

## 28.10 도구 결과 길이 관리

도구가 큰 결과를 반환하면
LLM 컨텍스트가 폭주합니다.

대처:

- 도구 안에서 결과를 **요약·잘라서** 반환
- 또는 LLM에 첫 200자만 보여주고
  "더 필요하면 다시 호출" 패턴

---

## 28.11 Structured Output — 도구 없는 JSON 강제

도구 호출이 아니라
**그냥 JSON 답변**이 필요할 때도 비슷한 기법을 씁니다.

```python
resp = client.chat.completions.create(
    model="qwen3:32b",
    messages=[...],
    response_format={"type": "json_object"},
)
```

지원 여부 도구마다 다름.
시스템 프롬프트에 스키마 명시하는 게 가장 호환성 좋음.

---

## 이 장에서 기억할 한 가지

> **LLM은 도구를 부르지 않습니다.
> "부르고 싶다"는 JSON만 만듭니다.**
>
> 실제 실행은 항상 우리 코드.
> 결과를 다시 LLM에 전달 → 최종 답변.

---

## 손으로 해볼 것

**1. 28.4 코드 그대로 실행**

도구 호출이 정상 동작하는지 확인.
`qwen3:8b` 로도 시도 후, `qwen3:32b` 와 품질 비교.

**2. 도구 한 개 추가**

`get_time(timezone)` 같은 함수를 추가하고
"서울 시간과 도쿄 시간 알려줘" 같은 질문에
**두 도구가 호출되는지** 확인.

---

다음 장에서는
**Agent의 구조** — 도구 호출 루프의 본격적 형태,
그리고 **로컬 모델에 권한을 주는 위험** 을 다룹니다.
