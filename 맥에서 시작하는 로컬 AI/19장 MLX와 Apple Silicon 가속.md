# 19장. MLX / mlx-lm — Apple Silicon 가속

> **이 장의 목표**
> **맥에서만** 누릴 수 있는 빠른 추론 프레임워크 MLX를
> 직접 만져봅니다.
>
> 같은 모델이 GGUF 대비
> **얼마나 더 빨라지는지** 체감하게 됩니다.

---

## 19.1 MLX가 뭔가?

Apple이 직접 만든
**머신러닝 프레임워크**.

- Apple Silicon에 **최적화된 연산**
- NumPy 비슷한 Python API
- macOS·iPadOS·iOS 모두에서 동일 코드
- 통합 메모리 활용 효율적
- Apple ML Research 팀이 직접 개발

LLM 추론용 패키지:

```text
mlx-lm
```

이게 우리가 쓸 도구입니다.

---

## 19.2 왜 MLX인가?

같은 양자화여도 **GGUF보다 빠를 수 있음.**

| 모델 | GGUF Q4_K_M | MLX 4bit |
|---|---:|---:|
| 7B (M3 Max) | 약 60 tok/s | 약 80 tok/s |
| 32B (M5 Pro) | 약 18 tok/s | 약 25 tok/s |
| 70B (M3 Ultra) | 약 22 tok/s | 약 28 tok/s |

(대략. 모델·셋업에 따라 변동)

> **이유:**
> Metal·ANE·통합 메모리에 더 직접적으로 매핑되기 때문.

---

## 19.3 설치

```bash
$ mkdir -p ~/Developer/local-ai-mlx
$ cd ~/Developer/local-ai-mlx

$ python3 -m venv .venv
$ source .venv/bin/activate

(.venv) $ pip install -U mlx-lm
```

15.8 절의 가상환경 방법을 그대로 따릅니다.

---

## 19.4 첫 실행

```bash
(.venv) $ mlx_lm.generate \
    --model mlx-community/Qwen3-8B-Instruct-4bit \
    --prompt "한국어로 자기 소개 한 문장 해줘." \
    --max-tokens 200
```

| 옵션 | 의미 |
|---|---|
| `--model` | Hugging Face의 mlx-community 경로 |
| `--prompt` | 프롬프트 |
| `--max-tokens` | 최대 생성 |

모델이 처음이라면 자동으로 다운로드됩니다.

결과 끝에 성능 통계가 찍힙니다.

```text
Prompt: 18 tokens, 320 tokens-per-sec
Generation: 124 tokens, 78 tokens-per-sec
```

`Generation` 의 tok/s 가 우리가 보는 decode 속도.

---

## 19.5 채팅 모드

```bash
(.venv) $ mlx_lm.chat \
    --model mlx-community/Qwen3-8B-Instruct-4bit
```

`exit` 또는 `Ctrl+C` 로 종료.

---

## 19.6 OpenAI 호환 서버

```bash
(.venv) $ mlx_lm.server \
    --model mlx-community/Qwen3-32B-Instruct-4bit \
    --port 8080
```

이러면 `http://localhost:8080` 에 OpenAI 호환 API.

```bash
$ curl http://localhost:8080/v1/chat/completions \
  -d '{
    "model": "qwen",
    "messages": [{"role":"user","content":"안녕"}]
  }'
```

Ollama·LM Studio와 같은 형식이므로
**클라이언트 코드를 그대로** 쓸 수 있습니다.

---

## 19.7 mlx-community — MLX 모델 저장소

Hugging Face의 `mlx-community` 가
**MLX 변환본 모음**입니다.

검색 팁:

- 원하는 모델 이름 뒤에 `-4bit`, `-8bit` 붙여서 검색
- 또는 Hugging Face에서 `mlx` 필터

자주 받는 모델:

```text
mlx-community/Qwen3-8B-Instruct-4bit
mlx-community/Qwen3-14B-Instruct-4bit
mlx-community/Qwen3-32B-Instruct-4bit
mlx-community/Llama-3.3-70B-Instruct-4bit
mlx-community/gemma-3-27b-it-4bit
```

---

## 19.8 직접 변환·양자화

MLX 모델이 없으면 직접 변환할 수도 있습니다.

```bash
(.venv) $ mlx_lm.convert \
    --hf-path Qwen/Qwen3-32B-Instruct \
    --mlx-path ./models/Qwen3-32B-Instruct-4bit \
    -q
```

| 옵션 | 의미 |
|---|---|
| `--hf-path` | Hugging Face 원본 |
| `--mlx-path` | 저장할 폴더 |
| `-q` | 양자화 (기본 4bit) |

8bit로 하고 싶으면 `-q --q-bits 8`.

자세한 건 33장.

---

## 19.9 LM Studio에서 MLX 쓰기

코드 안 만지고도 MLX를 쓰는 가장 쉬운 길:

**LM Studio.**

검색 시 `MLX` 태그 필터를 켜면 됩니다.

```text
LM Studio Discover →
검색창 옆 필터 →
"MLX" 활성화
```

받아서 채팅 탭에서 로드하면 끝.
GGUF랑 똑같이 씁니다.

---

## 19.10 Ollama에서 MLX 쓰기

2025년부터 Preview로 지원합니다.

```bash
$ OLLAMA_MLX=1 ollama serve
```

이렇게 띄우면 Ollama가 가능한 모델은 MLX로 돌립니다.
2026년 시점에서는 정식 지원에 가까워졌습니다.

---

## 19.11 MLX vs GGUF — 어느 쪽을 쓰나

| 상황 | 추천 |
|---|---|
| 최대 속도 | **MLX** |
| 가장 안정·호환성 | **GGUF** |
| 갓 나온 모델 | **GGUF** (MLX 변환은 며칠 늦음) |
| 윈도우/리눅스와 호환 | **GGUF** |
| Apple Silicon 전용 워크플로 | **MLX** |
| LM Studio | 둘 다 OK |
| Ollama | GGUF 우선 |

> **이 책의 권장:**
> 처음 한 달은 GGUF로 익히고,
> 같은 모델을 MLX로 받아 속도 비교를 한 번씩 해보세요.

---

## 19.12 자주 만나는 MLX 문제

### "tokenizer 오류" 나요

mlx-lm 버전을 최신으로:

```bash
$ pip install -U mlx-lm
```

### Chat template이 적용 안 돼요

22장의 chat template 개념이 잘못 들어간 경우.
모델 카드에서 권장 template 확인.

### 메모리가 갑자기 커져요

MLX는 컨텍스트 키울 때 메모리 폭이 큽니다.
8K → 16K로 시작하세요.

---

## 이 장에서 기억할 한 가지

> **MLX = 맥에서만 누리는 속도.**
>
> 같은 4bit 모델이 GGUF보다 빠른 경우가 많습니다.
> 도구는 **mlx-lm** (CLI/API) 또는 **LM Studio** (GUI).

---

## 손으로 해볼 것

**1. GGUF vs MLX 속도 비교**

같은 모델의 두 버전을 받고
같은 질문을 던져 속도를 측정하세요.

```bash
# GGUF (Ollama 또는 llama-cli)
$ ollama run qwen3:8b --verbose

# MLX
$ mlx_lm.generate --model mlx-community/Qwen3-8B-Instruct-4bit \
    --prompt "한국어로 자기 소개 한 문장 해줘."
```

표를 만들어보세요.

| 도구 | 모델 | tok/s |
|---|---|---|
| Ollama (GGUF) | qwen3:8b | ? |
| mlx-lm | Qwen3-8B-Instruct-4bit | ? |
| LM Studio (GGUF) | Qwen3-8B-Instruct-Q4_K_M | ? |
| LM Studio (MLX) | Qwen3-8B-Instruct-4bit (MLX) | ? |

**2. mlx_lm.server 띄워보기**

```bash
$ mlx_lm.server --model mlx-community/Qwen3-8B-Instruct-4bit --port 8080
```

다른 터미널에서:

```bash
$ curl http://localhost:8080/v1/chat/completions \
  -d '{
    "model": "any",
    "messages":[{"role":"user","content":"안녕"}]
  }'
```

---

다음 장에서는
지금까지 본 도구들을 정리합니다.

**언제 어떤 도구를 쓰는지** 한 번에 정리되는 비교표·결정 트리.
