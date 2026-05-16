# 8장. Hugging Face 완전 정복

> **이 장의 목표**
> Hugging Face 모델 페이지를 처음 봤을 때
> **어디를 어떤 순서로 봐야 하는지** 알게 됩니다.
>
> 안에 적힌 영어 표현 30가지가 한국어로 들립니다.

---

## 8.1 Hugging Face가 뭔가

한 줄 요약:

> **AI 모델의 GitHub.**

전 세계 연구자·회사가
모델을 올리고 공유하는 거대한 저장소입니다.

```text
huggingface.co
```

이 사이트가 사실상 **로컬 AI의 입구**입니다.

크게 4가지가 올라옵니다.

1. **Models** — 모델 파일들
2. **Datasets** — 학습용 데이터
3. **Spaces** — 모델을 웹앱처럼 돌려보는 곳
4. **Papers** — 관련 논문

우리가 자주 쓰는 건 **Models** 입니다.

---

## 8.2 모델 페이지 한눈에 보기

예시. `Qwen/Qwen3-32B-Instruct` 페이지에 들어가면
이런 구조가 보입니다.

```text
┌─────────────────────────────────────────┐
│  Qwen / Qwen3-32B-Instruct              │  ← ① 소유자 / 모델명
│  [Like] [Follow]                        │
├─────────────────────────────────────────┤
│  Model card | Files | Community         │  ← ② 탭
├─────────────────────────────────────────┤
│  Tags: text-generation, ko, en, ...     │  ← ③ 태그
│  License: apache-2.0                    │  ← ④ 라이선스
│  Downloads: 1.2M                        │
├─────────────────────────────────────────┤
│  README (모델 카드 본문)                │  ← ⑤ 모델 카드
└─────────────────────────────────────────┘
```

순서대로 살펴봅니다.

---

## 8.3 ① 소유자 / 모델명

```text
Qwen / Qwen3-32B-Instruct
└──┘   └──────────────────┘
소유자     모델명
```

소유자는 보통 회사나 개인입니다.

| 소유자 예 | 누구 |
|---|---|
| `meta-llama` | Meta (Llama 시리즈) |
| `Qwen` | Alibaba (Qwen 시리즈) |
| `google` | Google (Gemma 시리즈) |
| `microsoft` | Microsoft (Phi 시리즈) |
| `mistralai` | Mistral AI |
| `deepseek-ai` | DeepSeek |
| `bartowski` | 유명 양자화 배포자 (개인) |
| `mlx-community` | MLX 변환본 모음 |

**팁:** 모델을 받을 때
**누가 올린 것인지** 확인하는 습관을 들이세요.
같은 모델이라도 변환본 품질이 다릅니다.

---

## 8.4 ② 탭 — 모델 카드 / Files / Community

### Model card

모델 설명서입니다.
어떤 모델이고, 어떻게 쓰는지, 라이선스가 뭔지.

### Files and versions

**여기가 실전입니다.**

실제 모델 파일 목록이 보입니다.

```text
config.json                   ← 모델 구조 설정
generation_config.json        ← 기본 생성 옵션
tokenizer.json                ← 토큰화 규칙
tokenizer_config.json         ← 토크나이저 설정
model-00001-of-00014.safetensors   ← 원본 가중치 조각
model-00002-of-00014.safetensors
...
model.safetensors.index.json
```

### Community

질문·이슈·논의가 올라오는 탭.
모델을 받기 전에 **알려진 버그**를 빠르게 확인할 수 있습니다.

---

## 8.5 ③ 태그 보는 법

페이지 위쪽에 줄줄이 붙어있는 태그입니다.

자주 보는 것들:

| 태그 | 의미 |
|---|---|
| `text-generation` | 일반 대화·생성용 |
| `text-classification` | 분류용 (로컬 LLM 흐름에선 잘 안 씀) |
| `conversational` | 대화 튜닝 됨 |
| `code` | 코드 특화 |
| `instruct` | 지시사항 튜닝 됨 |
| `gguf` | GGUF 파일 포함 (10장) |
| `mlx` | MLX 변환본 (10장) |
| `safetensors` | 원본 가중치 형식 |
| `ko`, `en`, `ja` | 지원 언어 |
| `apache-2.0`, `mit`, `llama3` | 라이선스 |

> **빠른 필터링 팁**
> 검색창 옆 필터에서 `GGUF` 만 켜면
> **로컬 실행 가능한 모델**만 나옵니다.

---

## 8.6 ④ 라이선스

회사에서 쓸 거라면 **여기를 가장 먼저** 보세요.

흔한 라이선스:

| 라이선스 | 상업적 사용 |
|---|---|
| `apache-2.0` | ✅ |
| `mit` | ✅ |
| `llama3` / `llama3.1` | ✅ (월 7억 MAU 미만 회사) |
| `gemma` | ✅ (제한 조건 있음) |
| `qwen` | ✅ |
| `cc-by-nc-4.0` | ❌ 비상업 |
| `cc-by-sa-4.0` | ⚠ 조건부 |
| `bigscience-openrail-m` | ⚠ 조건부 |

자세한 비교는 **12장** 에서.

---

## 8.7 ⑤ 모델 카드 — 어디를 읽나

모델 카드는 길고 복잡합니다.
초보자라면 다음 4가지만 보세요.

### 1. Intended use / 사용 권장 사항

이 모델이 무엇을 잘하는지.

### 2. Limitations / 한계

이 모델이 잘 못하는 것.
한국어가 약하다거나, 코드를 못 짠다거나.

### 3. How to use / 사용 예제

`transformers` 코드가 적혀 있더라도
**Chat template** 이라는 항목이 보이면
22장에서 꺼낼 정보입니다.

### 4. Quantization / 양자화 버전 안내

원본 페이지 하단이나 README에
**"Quantized versions"** 또는
**"GGUF version"** 링크가 종종 있습니다.

거기로 들어가면 보통
`bartowski`, `unsloth`, `mlx-community` 같은
**양자화 배포자 페이지**로 연결됩니다.

---

## 8.8 같은 모델, 여러 버전 — 누구를 받아야 하나

대규모 인기 모델이면 보통 이런 구도가 됩니다.

```text
Qwen/Qwen3-32B-Instruct           ← 원본 (Safetensors, 60GB+)
  ↓
unsloth/Qwen3-32B-Instruct-GGUF   ← GGUF 양자화 (Q4~Q8)
bartowski/Qwen3-32B-Instruct-GGUF ← 또 다른 GGUF 배포자
mlx-community/Qwen3-32B-Instruct-4bit  ← MLX 변환
```

목적별 추천:

- **Ollama / LM Studio 쓰는 사람** →
  GGUF 받으세요. `bartowski` 또는 `unsloth` 추천.
- **MLX 쓰는 사람** →
  `mlx-community/` 페이지 받으세요.
- **연구·파인튜닝 할 사람** →
  원본 Safetensors.

---

## 8.9 모델 검색 잘하는 팁

좌측 검색창에서 단순 키워드보다
**필터** 를 활용하세요.

추천 필터 조합:

```text
Task:        Text Generation
Library:     Transformers / GGUF
Languages:   Korean
Sort:        Trending
```

또는

```text
Sort: Most Downloads
Sort: Recently Updated
```

`Trending` 으로 두고 일주일에 한 번 둘러보면
**지금 뜨는 모델**이 보입니다.

---

## 8.10 다운로드 받을 때 알아둘 것

큰 모델은 파일 크기가 수십~수백 GB입니다.

- 안정된 와이파이에서 받기
- 외장 SSD에 받는 게 편함 (특히 256GB 맥)
- **`huggingface-cli`** 가 가장 안정적

설치는 한 줄:

```bash
$ pip install -U huggingface_hub
```

다운로드는:

```bash
$ huggingface-cli download \
    bartowski/Qwen3-32B-Instruct-GGUF \
    Qwen3-32B-Instruct-Q4_K_M.gguf \
    --local-dir ./models
```

이런 식으로 받으면 됩니다.
(실제 실습은 17장.)

---

## 이 장에서 기억할 한 가지

> **Hugging Face 모델 페이지에서는
> 5가지만 순서대로 봅니다.**
>
> 1. 소유자 (누가 올렸나)
> 2. 라이선스 (회사에서 써도 되나)
> 3. 태그 (GGUF/MLX 있나, 한국어 되나)
> 4. Files 탭 (어떤 파일을 받을 수 있나)
> 5. 모델 카드의 Limitations (한계는 뭔가)

---

## 손으로 해볼 것

**1. Hugging Face 계정 만들기**

`huggingface.co/join` 에서 무료 계정 만드세요.
일부 모델은 로그인이 필요합니다 (예: Meta Llama 시리즈).

**2. 후보 모델 페이지 3개 비교**

다음 3개 페이지를 띄워놓고 비교해보세요.

- `Qwen/Qwen3-32B-Instruct`
- `meta-llama/Llama-3.1-8B-Instruct`
- `google/gemma-3-27b-it`

각각의:

- 라이선스
- 파일 크기
- 지원 언어
- Community 탭 이슈 개수

를 표로 만들어보세요.

이게 습관이 되면 새 모델을 만났을 때
30초 안에 판단이 섭니다.

---

다음 장에서는
**Base / Instruct / Chat / Coder / Reasoning / VL / Embedding**
모델 종류를 한 번에 정리합니다.

이름만 봐도 "이건 내가 쓸 수 있는 거다"
"이건 아직 아니다" 판단이 섭니다.
