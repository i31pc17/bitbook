# 22장. 시스템 프롬프트와 Chat Template

> **이 장의 목표**
> "분명히 한국어로 답하라고 했는데 영어가 나와요"
> "Cursor에선 되는데 Ollama에선 답이 이상해요"
>
> 이런 일의 90%는 **Chat Template** 문제입니다.
> 이걸 이해하고 넘어갑니다.

---

## 22.1 시스템 프롬프트 — 모델의 "성격 설정"

채팅에는 보통 세 종류의 역할이 있습니다.

```text
system    — 모델의 성격·규칙
user      — 사용자 메시지
assistant — 모델의 답
```

시스템 프롬프트는 **대화 전체에 영향**을 주는 지시입니다.

OpenAI 형식 예:

```json
{
  "messages": [
    {"role": "system", "content": "너는 한국어로만 답하는 시니어 엔지니어야."},
    {"role": "user",   "content": "Python에서 비동기란 뭐야?"}
  ]
}
```

시스템 프롬프트는:

- 대화가 길어져도 효과 유지
- 사용자 프롬프트보다 **우선** 적용
- 모델 입장에선 "법"에 가까움

---

## 22.2 시스템 프롬프트로 가능한 것

- **언어 강제**:
  "모든 답변은 한국어"
- **톤 설정**:
  "정중한 존댓말로"
- **역할 고정**:
  "너는 비트북 회사의 사내 비서"
- **거절 정책**:
  "회사 보안 이슈가 의심되면 답변 거절"
- **출력 형식**:
  "항상 JSON으로 답해"

---

## 22.3 시스템 프롬프트 작성 팁

### 짧고 명확하게

❌ "너는 매우 친절하고 똑똑하며 정확하고 자세하고..."
→ 길어질수록 약발이 떨어집니다.

✅ "너는 비트북 회사의 한국어 사내 비서야. 정중한 존댓말로 답해."

### 우선순위 명시

여러 규칙이면 번호를 매기세요.

```text
규칙:
1. 모든 답은 한국어 존댓말.
2. 모르는 내용은 "모르겠습니다"로.
3. 회사 기밀 의심되면 답변 거절.
```

### 길이도 모델과 균형

```text
간단한 8B 모델 → 시스템 프롬프트 짧게 (200자 이내)
큰 32B+ 모델   → 시스템 프롬프트 길어도 잘 따름
```

---

## 22.4 Chat Template — 모델이 진짜 보는 입력

여기가 중요한 부분입니다.

OpenAI 형식의 메시지는
**모델이 직접 보지 않습니다.**

각 모델마다 정해진 **Chat Template** 으로
**한 덩어리 텍스트**로 변환되어 들어갑니다.

예시. Qwen3의 Chat Template:

```text
<|im_start|>system
너는 한국어로 답하는 비서야.<|im_end|>
<|im_start|>user
안녕<|im_end|>
<|im_start|>assistant
```

마지막 줄이 비어있는 이유?

> 모델이 **이 위치부터 다음 토큰을 예측** 하기 시작하기 때문입니다.

Llama 3의 Chat Template은 또 다릅니다:

```text
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
너는 한국어로 답하는 비서야.<|eot_id|><|start_header_id|>user<|end_header_id|>
안녕<|eot_id|><|start_header_id|>assistant<|end_header_id|>
```

> **같은 의미의 대화도
> 모델마다 완전히 다른 모양의 토큰 시퀀스가 됩니다.**

---

## 22.5 Chat Template이 잘못 적용되면

증상이 무서울 정도로 다양합니다.

- "AI assistant" 라며 자기 소개부터 시작
- 답을 하다가 다음 사용자 차례를 자기가 채움
- 시스템 프롬프트를 무시
- 답변이 끝나지 않고 무한 반복
- 한국어 / 영어가 섞임

원인은 거의 다 **잘못된 chat template**.

```text
Qwen 모델에 Llama 템플릿 적용  →  답이 이상해짐
Base 모델에 Chat 템플릿 적용   →  답이 깨짐
```

---

## 22.6 어디서 적용되나?

좋은 소식: **대부분의 도구가 자동으로 처리** 해줍니다.

| 도구 | 자동 적용? |
|---|---|
| LM Studio | ✅ 모델의 `tokenizer_config.json` 자동 |
| Ollama | ✅ Modelfile에 내장 |
| mlx-lm | ✅ HF 토크나이저 |
| llama.cpp (`--chat-template`) | ⚠ 모델에 따라 명시 필요 |

문제가 되는 건 보통:

- llama.cpp 직접 호출
- 옛 GGUF 파일 (tokenizer_config 누락)
- 직접 OpenAI 호환 클라이언트를 짤 때
  **base 모델**에 chat 형식으로 호출

---

## 22.7 모델 카드에서 Chat Template 찾기

Hugging Face 모델 페이지의
**"Files and versions"** → `tokenizer_config.json` 을 열면
이런 게 보입니다.

```json
{
  "chat_template": "{% if messages[0]['role'] == 'system' %}...",
  ...
}
```

이 안에 Jinja2 템플릿으로 모양이 정의되어 있습니다.

또는 README의 **"Chat Format"** 또는 **"Usage"** 섹션에
명시되어 있습니다.

직접 살 일은 별로 없지만,
**"내 코드가 이상해질 때"** 한 번씩 들여다보세요.

---

## 22.8 직접 호출할 때 안전한 방법 (Python)

`transformers` 라이브러리는
모델별 chat template을 알아서 적용합니다.

```python
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("Qwen/Qwen3-8B-Instruct")

messages = [
    {"role": "system", "content": "너는 한국어로 답해."},
    {"role": "user",   "content": "안녕"},
]

prompt = tok.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)
print(prompt)
```

이 출력이 위 22.4 절의 그 모양입니다.

`add_generation_prompt=True` 가 중요:
**"이제 모델이 말할 차례"** 표시를 끝에 붙여줍니다.

---

## 22.9 컨텍스트 캐싱

대화가 길어지면 prefill이 매번 느려집니다.

같은 시스템 프롬프트 + 같은 앞부분 대화 → **결과 같음.**

그래서 도구들이 **이전 KV Cache를 재활용** 합니다.

| 도구 | 컨텍스트 캐싱 |
|---|---|
| Ollama | 자동 (같은 세션 내) |
| LM Studio | 자동 |
| llama.cpp | `--prompt-cache` 옵션 |
| mlx-lm | 자동 |

> 시스템 프롬프트를 **자주 바꾸지 않을수록**
> prefill 비용을 절약할 수 있습니다.

---

## 22.10 시스템 프롬프트 실전 모음

### 사내 비서 (38장과 연결)

```text
당신은 비트북 회사의 사내 비서입니다.

규칙:
1. 모든 답은 한국어 존댓말.
2. 회사 내부 자료에 없는 내용은 "확인 필요"로 표시.
3. 사람·계정 정보는 절대 추측하지 않음.
```

### 코딩 어시스턴트 (37장과 연결)

```text
You are a senior software engineer.
Respond in Korean for explanations,
but keep code, file paths, and shell commands in their original form.

Rules:
1. No unnecessary preamble.
2. When unsure, say so. Don't fabricate APIs.
3. Suggest tests when modifying logic.
```

### JSON 출력기

```text
모든 답은 다음 JSON으로만:
{
  "summary": "...",
  "tags": ["...", "..."],
  "confidence": 0.0-1.0
}

다른 텍스트 절대 금지. 코드블록도 금지.
```

---

## 이 장에서 기억할 한 가지

> **모델은 OpenAI 형식 메시지를 직접 안 본다.**
>
> Chat Template으로 **모델별 모양**의 텍스트로 변환된 뒤에야 본다.
>
> 답이 이상하면 가장 먼저 **잘못된 template**을 의심하세요.

---

## 손으로 해볼 것

**1. 시스템 프롬프트 효과 체감**

LM Studio에서 같은 8B 모델에 두 번 같은 질문.

A. 시스템 프롬프트 비움:

```text
사용자: 안녕
```

B. 시스템 프롬프트:

```text
너는 비트북 회사의 한국어 사내 비서야.
정중한 존댓말로만 답해.
```

같은 사용자 메시지로 답을 비교하세요.

**2. apply_chat_template 출력 확인 (선택)**

가상환경에서:

```bash
(.venv) $ pip install transformers
```

위 22.8 코드를 실행해서
모델이 진짜로 보는 텍스트가 어떻게 생겼는지 직접 확인.

---

다음 장에서는
**Temperature, Top-p, Top-k** —
"창의성 슬라이더"의 정체를 봅니다.
