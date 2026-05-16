# 17장. Ollama — 터미널/API로 다루기

> **이 장의 목표**
> 터미널과 API로
> 로컬 AI를 다루는 표준 도구
> **Ollama** 를 익힙니다.
>
> 이걸 알면 자동화·사내 도구·Agent까지 길이 열립니다.

---

## 17.1 Ollama가 뭔가?

명령어 한 줄로 모델을 받고, 돌리고, API로 제공.

```bash
$ ollama run gemma3
```

이 한 줄이면 모델을 받아 채팅 모드로 들어갑니다.

LM Studio가 마우스 중심이라면,
Ollama는 **터미널·API 중심**.

특징:

- 백그라운드 데몬으로 항상 떠있음
- **`localhost:11434`** 에서 자동 API 서버
- **OpenAI 호환** 엔드포인트 제공
- Continue.dev, VS Code 확장,
  Open WebUI 등 거의 모든 클라이언트와 호환

---

## 17.2 설치

`ollama.com/download` 에서 **macOS** 버전 다운로드.

`.dmg` 를 열고 `Ollama.app` 을 **Applications** 로 드래그.

처음 실행하면 메뉴바에 작은 라마 아이콘이 뜹니다.
이게 **백그라운드 데몬**입니다.

확인:

```bash
$ ollama --version
ollama version is 0.x.x
```

---

## 17.3 첫 모델 — `pull` → `run`

### 받기

```bash
$ ollama pull qwen3:8b
```

`이름:태그` 형식입니다.
`태그` 는 보통 모델 크기.

자주 쓰는 태그:

```text
qwen3:8b
qwen3:32b
gemma3:27b
llama3.3:70b
deepseek-r1:14b
mistral:7b
```

### 바로 실행

```bash
$ ollama run qwen3:8b
>>> 한국어로 자기 소개 한 문장 해줘.
```

대화창에 그대로 글자가 흐릅니다.

종료: `/bye` 또는 `Ctrl + D`.

---

## 17.4 모델 목록·삭제·정보

| 명령 | 의미 |
|---|---|
| `ollama list` | 받아둔 모델 목록 |
| `ollama ps` | 지금 메모리에 떠 있는 모델 |
| `ollama rm qwen3:8b` | 모델 삭제 |
| `ollama show qwen3:8b` | 모델 정보 (컨텍스트, 시스템 프롬프트 등) |
| `ollama stop qwen3:8b` | 메모리에서 내림 |

`ollama list` 예:

```text
NAME              SIZE     MODIFIED
qwen3:8b          4.7GB    1일 전
qwen3:32b         20.4GB   3시간 전
gemma3:27b        15.6GB   2일 전
```

---

## 17.5 응답 속도 측정 — `--verbose`

7장에서 본 그 값들을 직접 볼 수 있는 옵션.

```bash
$ ollama run qwen3:32b --verbose
>>> 한국어로 자기 소개 한 문장 해줘.

저는 Qwen3 모델입니다...

total duration:       3.2s
load duration:        53ms
prompt eval count:    18 tokens
prompt eval rate:     245 tokens/s
eval count:           42 tokens
eval rate:            17.5 tokens/s
```

| 값 | 의미 |
|---|---|
| `prompt eval rate` | prefill 속도 |
| `eval rate` | **decode 속도** (= 우리가 보는 tokens/sec) |

---

## 17.6 API — `localhost:11434`

Ollama가 켜져 있으면
자동으로 다음 주소가 열려 있습니다.

```text
http://localhost:11434
```

가장 기본 호출:

```bash
$ curl http://localhost:11434/api/generate -d '{
  "model": "qwen3:8b",
  "prompt": "한국어로 자기 소개 한 문장 해줘.",
  "stream": false
}'
```

응답:

```json
{
  "model": "qwen3:8b",
  "response": "저는 Qwen3 모델입니다...",
  "done": true,
  ...
}
```

`"stream": true` 로 하면 토큰이 흐르듯 한 줄씩 옵니다.

---

## 17.7 OpenAI 호환 엔드포인트

이게 Ollama의 **킬러 기능**입니다.

```text
POST http://localhost:11434/v1/chat/completions
```

OpenAI 형식 그대로 받습니다.

```bash
$ curl http://localhost:11434/v1/chat/completions -d '{
  "model": "qwen3:8b",
  "messages": [
    {"role": "system", "content": "너는 친절한 어시스턴트야."},
    {"role": "user", "content": "안녕"}
  ]
}'
```

OpenAI SDK 코드의 `base_url` 만 바꾸면
**그대로 로컬 모델**로 동작합니다.

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # 아무 값
)

resp = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "hi"}],
)
print(resp.choices[0].message.content)
```

이 한 가지가
**Continue.dev, Open WebUI, n8n, LangChain** 등
**거의 모든 도구를 로컬 AI로 돌릴 수 있게** 해줍니다.

25장에서 본격 다룹니다.

---

## 17.8 컨텍스트 길이 늘리기

Ollama는 모델 메모리에 따라
자동으로 컨텍스트를 다르게 잡습니다.

기본값을 바꾸려면:

```bash
$ OLLAMA_CONTEXT_LENGTH=32768 ollama serve
```

또는 모델 단위로 **Modelfile** 작성 (다음 절).

---

## 17.9 Modelfile — 모델 커스터마이즈

Ollama는 모델을 살짝 변형해
별도 이름으로 저장할 수 있습니다.

`Modelfile` 한 줄 예:

```text
FROM qwen3:32b
PARAMETER num_ctx 32768
PARAMETER temperature 0.4
SYSTEM "너는 우리 회사의 한국어 챗봇이야. 정중하게 답해."
```

빌드:

```bash
$ ollama create my-qwen -f Modelfile
```

실행:

```bash
$ ollama run my-qwen
```

용도:

- 사내 시스템 프롬프트 고정
- 응답 길이·창의성 미리 설정
- 회의록 요약 전용 / 코드 리뷰 전용 등 변형

---

## 17.10 모델 저장 위치 관리

기본 위치:

```text
~/.ollama/models/
```

용량 확인:

```bash
$ du -sh ~/.ollama/models/
84G   /Users/kjj/.ollama/models/
```

다른 디스크로 옮기고 싶으면:

```bash
$ export OLLAMA_MODELS=/Volumes/External/ollama-models
```

`~/.zshrc` 에 추가하면 영구 적용.

---

## 17.11 외장 모델 — GGUF 직접 임포트

Hugging Face에서 받은 GGUF 파일을
Ollama로 등록할 수도 있습니다.

```text
# Modelfile.import
FROM ./Qwen3-32B-Instruct-Q4_K_M.gguf
```

```bash
$ ollama create custom-qwen -f Modelfile.import
$ ollama run custom-qwen
```

---

## 17.12 자주 쓰는 Ollama 운영 명령 모음

```bash
$ ollama list                       # 받은 모델
$ ollama ps                         # 떠있는 모델
$ ollama run qwen3:8b               # 실행
$ ollama run qwen3:32b --verbose    # 속도 보면서 실행
$ ollama pull gemma3:27b            # 받기
$ ollama rm gemma3:27b              # 삭제
$ ollama stop qwen3:32b             # 메모리에서 내림
$ ollama serve                      # 데몬 직접 실행 (수동)
```

---

## 17.13 Ollama vs LM Studio — 언제 무엇을?

| 상황 | 추천 |
|---|---|
| 처음 입문 | **LM Studio** |
| 자동화·스크립트 | **Ollama** |
| Continue.dev 같은 IDE 통합 | **Ollama** |
| 빠른 GUI 비교 | **LM Studio** |
| 사내 챗봇 서버 | **Ollama** |
| 모델 카드 보면서 받기 | **LM Studio** |

두 도구는 **같이 깔아둘 수 있습니다.**
LM Studio로 모델 탐색하고,
Ollama로 자동화에 붙이는 것이 흔한 조합.

---

## 이 장에서 기억할 한 가지

> **Ollama = 터미널 + API 표준.**
>
> ```bash
> ollama run <모델>           # 채팅
> http://localhost:11434/v1/...   # OpenAI 호환 API
> ```
>
> 이걸 알면 자동화·Agent·IDE 통합의 문이 열립니다.

---

## 손으로 해볼 것

**1. 첫 모델 실행 & 속도 측정**

```bash
$ ollama run qwen3:8b --verbose
>>> 한국어로 자기 소개 한 문장 해줘.
```

`eval rate` 값을 16장 LM Studio에서 받은 값과 비교해보세요.

**2. API 호출**

```bash
$ curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:8b",
    "messages": [{"role": "user", "content": "안녕"}]
  }'
```

JSON으로 답이 오면 성공.

**3. Modelfile로 사내 챗봇 가짜 만들기**

```text
FROM qwen3:8b
SYSTEM "너는 우리 회사의 친절한 사내 비서야.
한국어로만 답하고, 회사 이름은 '비트북'이야."
PARAMETER temperature 0.5
```

`my-bitbook` 같은 이름으로 빌드하고 실행해보세요.

---

다음 장에서는
**llama.cpp** — Ollama·LM Studio가 내부적으로 쓰는
**더 깊은 층의 엔진**을 다룹니다.

깊이 가고 싶을 때만 봐도 됩니다.
