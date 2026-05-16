# 10장. 파일 포맷 — Safetensors / GGUF / MLX

> **이 장의 목표**
> 모델을 받을 때
> **어떤 형식의 파일을 받아야 내 도구에서 도는지** 가
> 자동으로 매칭됩니다.
>
> "왜 받았는데 안 돌지?" 가 사라집니다.

---

## 10.1 왜 같은 모델이 여러 형식인가?

같은 모델이라도
**어떤 런타임에서 돌릴 거냐**에 따라
포맷이 다릅니다.

비유:

```text
같은 영화도 mp4, mkv, mov, webm으로 받을 수 있는 것과 같음
```

가장 흔히 만나는 세 종류만 알면 됩니다.

| 포맷 | 주 사용처 |
|---|---|
| **Safetensors** | 원본·연구·파인튜닝·Transformers |
| **GGUF** | 로컬 추론 (llama.cpp / Ollama / LM Studio) |
| **MLX** | Apple Silicon 최적화 (mlx-lm) |

---

## 10.2 Safetensors — 원본 가중치

**Hugging Face의 표준 모델 형식.**

```text
model-00001-of-00014.safetensors
model-00002-of-00014.safetensors
...
model.safetensors.index.json
```

여러 조각으로 쪼개져 있습니다.

특징:

- **원본 정밀도** (FP16, BF16)
- 파일 크기가 큼
- 파이썬 `transformers` 라이브러리로 바로 로드
- 양자화 안 된 상태
- **로컬에서 직접 돌리기엔 무거움**

언제 받나:

- 직접 양자화하거나 변환하고 싶을 때 (33장)
- 파인튜닝 할 때 (32장)
- `transformers` 코드로 실험할 때

> **초보자는 거의 받을 일이 없습니다.**

---

## 10.3 GGUF — 로컬 AI의 표준

**llama.cpp 진영의 단일 파일 포맷.**

```text
Qwen3-32B-Instruct-Q4_K_M.gguf   ← 파일 하나
```

특징:

- **단일 파일** (보통 4~40GB)
- 메타데이터·토크나이저·가중치가 다 들어있음
- **양자화에 최적화** (Q4/Q5/Q8 등)
- macOS 포함 거의 모든 OS에서 동작
- **Ollama, LM Studio, llama.cpp가 모두 사용**

언제 받나:

- LM Studio로 돌릴 때 ✅
- Ollama로 돌릴 때 ✅
- 거의 모든 로컬 AI 도구 ✅

> **이 책의 표준 포맷입니다.**

### GGUF 파일 이름 해독

```text
Qwen3-32B-Instruct-Q4_K_M.gguf
└──┘  └─┘  └──────┘  └────┘
모델  크기   종류     양자화
```

- **모델 시리즈**: `Qwen3`
- **파라미터 크기**: `32B`
- **종류**: `Instruct` (9장)
- **양자화**: `Q4_K_M` (5장)
- **확장자**: `.gguf`

---

## 10.4 MLX — Apple Silicon 전용

**Apple이 직접 만든 머신러닝 프레임워크의 모델 형식.**

```text
mlx-community/Qwen3-32B-Instruct-4bit
├── config.json
├── tokenizer.json
├── model.safetensors          ← 형식은 같지만 양자화됨
├── tokenizer_config.json
└── special_tokens_map.json
```

특징:

- **Apple Silicon에 직접 최적화**
- 같은 4bit여도 GGUF보다 빠를 수 있음
- 폴더(여러 파일)로 받음
- **mlx-lm 라이브러리** 또는 LM Studio(MLX 백엔드)로 실행
- 윈도우·리눅스에서는 사용 불가

언제 받나:

- 맥에서 **최대 속도**를 뽑고 싶을 때
- MLX 기반 도구를 쓸 때 (19장)

> **2025년부터 LM Studio가 MLX를 정식 지원하면서
> 맥 사용자의 매력적 선택지가 되었습니다.**

---

## 10.5 그 외 만나게 될 포맷들

자주 보지만 깊이 알 필요는 없는 형식들.

| 포맷 | 한 줄 설명 |
|---|---|
| **AWQ** | GPU용 4비트 양자화. CUDA 환경에서 빠름. 맥에선 잘 안 씀 |
| **GPTQ** | 또 다른 4비트 양자화. AWQ 비슷한 위치 |
| **EXL2** | 텍스트 생성 최적화 GPU 양자화. 맥과 무관 |
| **ONNX** | 범용 모델 교환 포맷. 모바일·엣지에서 종종 |
| **PyTorch (`.bin`, `.pt`)** | 옛날 형식. 새 모델은 Safetensors 위주 |

> **맥에서 로컬 AI를 한다면
> 결국 `GGUF` 또는 `MLX` 둘 중 하나입니다.**

---

## 10.6 도구 ↔ 포맷 매칭표

| 도구 | Safetensors | GGUF | MLX |
|---|:-:|:-:|:-:|
| **LM Studio** | ⚠ 변환 필요 | ✅ | ✅ |
| **Ollama** | ❌ | ✅ | ⚠ Preview |
| **llama.cpp** | ❌ | ✅ | ❌ |
| **mlx-lm** | ❌ | ❌ | ✅ |
| **Transformers** | ✅ | ⚠ 일부 | ❌ |

> **요약**
> - **GGUF**: 거의 모든 도구에서 됨
> - **MLX**: LM Studio·mlx-lm에서 빠름
> - **Safetensors**: 직접 변환·실험용

---

## 10.7 같은 모델, 어떤 페이지로 가야 하나

`Qwen3-32B-Instruct` 를 예로 들면:

```text
원본 Safetensors
└─ Qwen/Qwen3-32B-Instruct           ← 큰 원본 (60GB+)

GGUF 양자화 배포자
├─ bartowski/Qwen3-32B-Instruct-GGUF
├─ unsloth/Qwen3-32B-Instruct-GGUF
└─ Qwen/Qwen3-32B-Instruct-GGUF      ← 공식 GGUF가 있는 경우도 있음

MLX 변환본
└─ mlx-community/Qwen3-32B-Instruct-4bit
```

목적별로:

- **LM Studio / Ollama 사용자** →
  GGUF 양자화 배포자 페이지
- **MLX 도구 / 빠른 속도 원하는 맥 사용자** →
  mlx-community
- **연구·파인튜닝** →
  원본 Safetensors

---

## 10.8 신뢰할 수 있는 양자화 배포자

GGUF는 누구나 만들 수 있어서
**누가 만들었느냐**가 중요합니다.

검증된 배포자:

| 배포자 | 특징 |
|---|---|
| **`unsloth`** | 최신 기법·빠른 업데이트 |
| **`bartowski`** | 양자화 종류가 가장 다양함 |
| **`TheBloke`** | 클래식. 최근엔 활동 줄어듦 |
| **`mlx-community`** | MLX 변환의 표준 |
| **원본 회사 공식** | 있으면 최우선 |

처음 보는 배포자라면
**Community 탭의 후기**를 한 번 확인하세요.

---

## 10.9 GGUF 파일 어디에 저장하나?

LM Studio·Ollama는 자동으로 관리해주지만,
원리를 알면 디스크 정리가 쉽습니다.

| 도구 | 기본 저장 위치 |
|---|---|
| **LM Studio** | `~/.lmstudio/models/` |
| **Ollama** | `~/.ollama/models/` |
| **llama.cpp (수동)** | 사용자 지정 |

```bash
$ du -sh ~/.lmstudio/models ~/.ollama/models
```

이 명령으로 얼마나 차지하는지 확인 가능.

용량 부족하면
사용 안 하는 모델은 17장에서 어떻게 지우는지 봅니다.

---

## 이 장에서 기억할 한 가지

> **맥에서는 결국 `GGUF` 또는 `MLX` 둘 중 하나입니다.**
>
> - **호환성·도구 다양성**: GGUF
> - **속도·맥 최적화**: MLX
>
> Safetensors는 양자화·파인튜닝 할 때만 받습니다.

---

## 손으로 해볼 것

**1. 같은 모델의 세 포맷 페이지를 직접 비교**

다음 세 페이지를 띄워보세요.

- `Qwen/Qwen3-8B-Instruct` (Safetensors 원본)
- `bartowski/Qwen3-8B-Instruct-GGUF` (GGUF)
- `mlx-community/Qwen3-8B-Instruct-4bit` (MLX)

각각의 **파일 목록과 총 크기**를 비교해보세요.

**2. 받기 직전 결정 한 줄 적기**

```text
내가 쓸 도구:              LM Studio / Ollama / mlx-lm / 기타
그에 맞는 포맷:            GGUF / MLX
받을 모델:                 ___________________
양자화 (5장):              Q4_K_M / Q5_K_M / 4bit
배포자:                    bartowski / unsloth / mlx-community / ...
```

이걸 들고 17장으로 가면 됩니다.

---

다음 장에서는
**모델 이름을 처음부터 끝까지 해독하는 법** 을
한 번에 정리합니다.

`DeepSeek-R1-Distill-Qwen-32B-Q5_K_M-128K.gguf`
같은 이름도 무서워지지 않습니다.
