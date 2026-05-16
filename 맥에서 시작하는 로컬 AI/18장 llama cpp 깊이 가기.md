# 18장. llama.cpp — 더 깊이 가고 싶을 때

> **이 장의 목표**
> Ollama·LM Studio가 **그 아래에서** 무엇을 쓰는지 알게 됩니다.
>
> 그리고 **사내 서버에 단독 추론 엔진을 띄울 때**,
> 또는 **새 모델이 GGUF로 막 풀렸을 때**
> 직접 다룰 수 있게 됩니다.
>
> 일반 사용자라면 이 장은 **참고용**으로 봐도 됩니다.

---

## 18.1 llama.cpp가 뭔가?

C++로 짠 **로컬 LLM 추론 엔진**.

- GGUF 포맷의 표준 구현체
- macOS·리눅스·윈도우·iOS·안드로이드까지 지원
- **Ollama, LM Studio가 내부적으로 llama.cpp 기반**
- 가장 빠른 업데이트 (새 모델 지원 1~2일 안에)

> **로컬 LLM 생태계의 심장.**

---

## 18.2 왜 직접 쓰나?

이미 Ollama가 있는데도 llama.cpp를 직접 만지는 이유:

- Ollama·LM Studio가 **아직 지원 안 하는 신규 모델** 빠르게 시험
- **세부 옵션** (KV cache 정밀도, GPU 레이어 수 등) 직접 조정
- **벤치마크·실험**
- 리눅스 서버에 단독 띄우기
- 임베디드·iOS 빌드
- 학습 목적

일반 사용자라면 Ollama로 충분합니다.

---

## 18.3 macOS 설치

가장 빠른 방법:

```bash
$ brew install llama.cpp
```

확인:

```bash
$ llama-cli --version
```

또는 직접 빌드 (최신 기능 필요 시):

```bash
$ git clone https://github.com/ggml-org/llama.cpp
$ cd llama.cpp
$ make
```

Apple Silicon은 **Metal 가속**이 자동으로 활성화됩니다.

---

## 18.4 첫 실행

GGUF 파일 하나가 필요합니다 (10장).

Hugging Face에서 받기:

```bash
$ huggingface-cli download \
    bartowski/Qwen3-8B-Instruct-GGUF \
    Qwen3-8B-Instruct-Q4_K_M.gguf \
    --local-dir ./models
```

채팅 모드 실행:

```bash
$ llama-cli \
    -m ./models/Qwen3-8B-Instruct-Q4_K_M.gguf \
    -p "한국어로 자기 소개 한 문장 해줘." \
    -n 200
```

| 옵션 | 의미 |
|---|---|
| `-m` | 모델 경로 |
| `-p` | 프롬프트 |
| `-n` | 생성할 최대 토큰 수 |

---

## 18.5 자주 쓰는 옵션

```bash
$ llama-cli \
    -m ./models/Qwen3-8B-Instruct-Q4_K_M.gguf \
    -p "한국어로 인사해줘." \
    -n 200 \
    -c 8192 \
    -t 8 \
    -ngl 99 \
    --temp 0.4 \
    --top-p 0.9
```

| 옵션 | 의미 |
|---|---|
| `-c` | 컨텍스트 길이 |
| `-t` | CPU 스레드 수 |
| `-ngl` | GPU에 올릴 레이어 수 (Apple은 99로 두면 전부 GPU) |
| `--temp` | Temperature (23장) |
| `--top-p` | Top-P |

---

## 18.6 채팅 모드 — `-cnv`

ChatGPT처럼 대화 인터페이스:

```bash
$ llama-cli \
    -m ./models/Qwen3-8B-Instruct-Q4_K_M.gguf \
    -cnv
```

`-cnv` (conversation) 옵션이 핵심.

종료: `Ctrl + C`.

---

## 18.7 서버 모드 — `llama-server`

API 서버로도 띄울 수 있습니다.

```bash
$ llama-server \
    -m ./models/Qwen3-32B-Instruct-Q4_K_M.gguf \
    -c 16384 \
    -ngl 99 \
    --host 0.0.0.0 \
    --port 8080
```

이러면 `http://localhost:8080` 에 API가 열립니다.

OpenAI 호환 엔드포인트도 제공:

```bash
$ curl http://localhost:8080/v1/chat/completions -d '{
  "model": "any",
  "messages": [{"role": "user", "content": "안녕"}]
}'
```

---

## 18.8 성능 측정 — `llama-bench`

```bash
$ llama-bench \
    -m ./models/Qwen3-32B-Instruct-Q4_K_M.gguf \
    -p 512 \
    -n 128
```

이 명령은 prefill·decode 속도를 자동으로 측정합니다.

```text
| model         | size | pp 512  | tg 128 |
|---------------|------|---------|--------|
| qwen3 32B Q4_K_M | 18GB | 250 tok/s | 19 tok/s |
```

`pp` = prompt processing (prefill)
`tg` = text generation (decode)

내 맥의 진짜 성능을 잴 때 표준 도구.

---

## 18.9 KV Cache 정밀도 조정

긴 컨텍스트에서 메모리를 아끼고 싶을 때:

```bash
$ llama-cli ... --cache-type-k q8_0 --cache-type-v q8_0
```

KV Cache를 8비트로 저장 → 메모리 절반.
품질은 거의 차이 없음.

64K 이상 컨텍스트에서는 권장.

---

## 18.10 임베딩도 가능

llama.cpp는 임베딩 모델도 돕니다.

```bash
$ llama-embedding \
    -m ./models/bge-m3-Q8_0.gguf \
    -p "오늘 회의 어땠어?"
```

결과로 숫자 벡터가 출력됩니다.
26장(RAG)에서 다시 봅니다.

---

## 18.11 양자화 직접 해보기

원본 모델을 받아 직접 양자화할 수 있습니다.

```bash
# 1. Safetensors → F16 GGUF
$ python3 convert_hf_to_gguf.py \
    /path/to/Qwen3-8B-Instruct \
    --outfile qwen3-8b-f16.gguf \
    --outtype f16

# 2. F16 → Q4_K_M
$ llama-quantize qwen3-8b-f16.gguf qwen3-8b-Q4_K_M.gguf Q4_K_M
```

자세한 건 33장.

---

## 18.12 Apple Silicon에서의 llama.cpp

- **Metal 가속**이 기본
- `-ngl 99` 로 모든 레이어 GPU로
- M4 Max 이상에서 큰 차이 체감
- M5에서는 추가 개선 빠르게 반영됨

---

## 18.13 Ollama와 비교

| 항목 | Ollama | llama.cpp 직접 |
|---|---|---|
| 진입 난이도 | 쉬움 | 보통 |
| 새 모델 지원 | 며칠 후 | 즉시 |
| 세부 옵션 | 제한적 | 전부 |
| API 서버 | 기본 제공 | `llama-server` |
| 자동화 | 매우 좋음 | 좋음 |
| 학습 가치 | 낮음 | 높음 |

> **결론:**
> 일반 작업은 Ollama,
> 깊은 실험은 llama.cpp.

---

## 이 장에서 기억할 한 가지

> **llama.cpp는 로컬 LLM 생태계의 엔진.**
>
> Ollama·LM Studio가 그 위에 얹힌 GUI/CLI 래퍼.
>
> 직접 쓰면 **속도·옵션·신규 모델**에서 가장 빠른 길이 됩니다.

---

## 손으로 해볼 것

**1. `llama-bench` 로 내 맥 벤치 찍기**

이미 받아둔 GGUF 모델로:

```bash
$ llama-bench -m ./models/Qwen3-8B-Instruct-Q4_K_M.gguf
```

| 모델 크기 | pp (prefill) | tg (decode) |
|---|---|---|
| 8B Q4 | ? | ? |
| 14B Q4 | ? | ? |
| 32B Q4 | ? | ? |

7장에서 계산한 어림값과 비교해보세요.

**2. `llama-server` 띄워 OpenAI 호환 호출**

```bash
$ llama-server -m ./models/Qwen3-8B-Instruct-Q4_K_M.gguf -c 8192
```

다른 터미널 창에서:

```bash
$ curl http://localhost:8080/v1/chat/completions \
  -d '{
    "model": "any",
    "messages": [{"role":"user","content":"안녕"}]
  }'
```

---

다음 장에서는
**MLX / mlx-lm** — Apple Silicon에 특화된 프레임워크로
같은 모델을 더 빠르게 돌려봅니다.

GGUF vs MLX 속도 차이를 직접 체감하게 됩니다.
