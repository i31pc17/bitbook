# 16장. LM Studio — GUI로 시작하기

> **이 장의 목표**
> **15분 안에** 내 맥에서
> 첫 로컬 AI 응답을 받는 것이 목표입니다.
>
> 가장 친절한 GUI 도구 LM Studio로 시작합니다.

---

## 16.1 LM Studio가 뭔가?

로컬 AI를 **마우스 클릭만으로** 다루게 해주는 앱.

- 모델 검색
- 모델 다운로드
- 모델 로드/언로드
- 채팅 인터페이스
- API 서버 기능
- GGUF · MLX 모두 지원

> **처음 로컬 AI를 만지는 사람에게는
> LM Studio가 가장 부드러운 시작입니다.**

---

## 16.2 설치

`lmstudio.ai` 에 들어가서
**Download for macOS (Apple Silicon)** 버튼.

다운로드된 `.dmg` 를 열고 **Applications** 폴더로 드래그.

`Launchpad` 또는 `Spotlight` 에서
"LM Studio" 검색 → 실행.

---

## 16.3 첫 실행 — 화면 구성

좌측 사이드바에 5개 아이콘이 있습니다.

```text
[💬] Chat        — 대화
[🔍] Discover    — 모델 찾기·다운로드
[📁] My Models   — 받아둔 모델 목록
[🔧] Developer   — 로컬 API 서버
[⚙️] Settings    — 환경 설정
```

처음 할 일은 **Discover** 입니다.

---

## 16.4 첫 모델 다운로드 — Discover 탭

검색창에 다음을 넣어보세요.

```text
Qwen3-8B-Instruct
```

이 책의 표준 첫 모델은 **8B Q4_K_M** 입니다.

| 내 맥 메모리 | 첫 모델 추천 |
|---|---|
| 16GB | `Qwen3-8B-Instruct` Q4_K_M |
| 32GB | `Qwen3-14B-Instruct` Q5_K_M |
| 64GB | `Qwen3-32B-Instruct` Q4_K_M |

오른쪽에 양자화별 파일 목록이 보입니다.

```text
Q2_K       Q3_K_M   Q4_K_S   ★Q4_K_M★   Q5_K_M   Q6_K   Q8_0
```

**별표로 추천**된 양자화가 나옵니다.
보통 `Q4_K_M` 입니다.

다운로드 버튼을 누르면 진행 바가 흐릅니다.

> 8B Q4는 약 5GB.
> 32B Q4는 약 20GB.
> 안정된 와이파이에서 받으세요.

---

## 16.5 MLX 버전을 받을지 GGUF를 받을지

LM Studio는 둘 다 받을 수 있습니다.
검색 결과 옆에 `GGUF` 또는 `MLX` 태그가 보입니다.

| 상황 | 추천 |
|---|---|
| **처음** | GGUF (안정적) |
| **속도 최우선** | MLX |
| **윈도우와 호환 신경 쓰임** | GGUF |

처음에는 GGUF로 시작합시다.
19장에서 MLX 버전을 추가로 받아 비교해봅니다.

---

## 16.6 첫 채팅 — Chat 탭

다운로드가 끝나면 **Chat** 탭으로 갑니다.

상단 중앙에 **모델 선택** 드롭다운.

```text
[Select a model to load ↓]
```

방금 받은 모델을 고르면
오른쪽에 **로드 옵션 패널**이 떠요.

```text
Context Length:  [ 8192 ]
GPU Offload:     [ Max ]
CPU Threads:     [ Auto ]
KV Cache (FP16): [ ON ]
```

처음에는 그대로 두고 **Load Model** 클릭.

수 초~십수 초 후 메모리에 올라옵니다.

이제 아래 입력창에 질문을 적어보세요.

```text
한국어로 자기 소개 한 문장 해줘.
```

답이 흐르면 성공입니다.

---

## 16.7 답변 화면에서 보이는 정보

응답이 완료되면 작은 글씨로 다음 정보가 뜹니다.

```text
First token: 0.4s  •  Speed: 21.3 tok/s  •  92 tokens
```

| 항목 | 의미 |
|---|---|
| **First token** | 답이 시작되기까지 (prefill) |
| **Speed** | decode 속도 (7장 그 값) |
| **tokens** | 총 토큰 수 |

이걸 보면서 **내 맥의 실제 성능**을 측정할 수 있습니다.

---

## 16.8 LM Studio 채팅 화면의 유용한 기능

- **System Prompt** 입력 (좌측 또는 상단)
- **Temperature, Top-P** 조절 (우측)
- **컨텍스트 길이** 변경 (모델 재로드 필요)
- **Conversation branching** — 답변에서 분기
- **이미지 첨부** (VL 모델일 경우)
- **모델 비교 모드** (같은 질문에 두 모델 동시)
- **Markdown 렌더링**, 코드 하이라이트

---

## 16.9 컨텍스트 길이 — 빨리 만지는 법

상단 모델 이름 옆 **⚙ Configure** 클릭 →
**Context Length** 슬라이더.

| 컨텍스트 | 권장 |
|---|---|
| 8K | 일반 대화 |
| 16K | 코드·짧은 문서 |
| 32K | 회의록·보고서 |
| 64K+ | 장문 분석 (메모리 여유) |

너무 크게 잡으면 KV Cache로 메모리가 폭주합니다 (6장).
처음에는 8K~16K 권장.

---

## 16.10 API 서버 — Developer 탭

LM Studio의 진짜 강점:
**클릭 한 번으로 OpenAI 호환 API 서버**가 됩니다.

좌측 **Developer** 탭 → 상단 **Start Server**.

```text
Status: Running on http://localhost:1234
```

이제 다음 명령으로 외부에서 호출 가능:

```bash
$ curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-8b-instruct",
    "messages": [
      {"role": "user", "content": "안녕"}
    ]
  }'
```

이건 25장(OpenAI 호환 API)에서 본격 다룹니다.

---

## 16.11 자주 만나는 LM Studio 문제

### "Out of memory" 떠요

컨텍스트를 줄이세요.
또는 한 단계 아래 양자화로 다시 받으세요.

### 너무 느려요

- 채팅 기록이 길어졌나? → 새 채팅 시작
- 다른 모델이 로드돼 있나? → 언로드
- 컨텍스트가 너무 큰가? → 줄이기
- MLX 버전이 있나? → 그쪽 받아 비교

### 한국어가 깨져요

- 양자화가 너무 낮음 (Q3 이하)
- 모델 자체의 한국어가 약함 (모델 카드 확인)
- Chat Template이 잘못 적용 (22장)

---

## 16.12 LM Studio의 한계

처음에는 좋지만 점점 답답해질 수도 있습니다.

- 자동화·스크립트는 Ollama·llama.cpp가 더 편함
- 일부 최신 모델은 LM Studio 업데이트 지연
- 큰 워크로드를 백그라운드로 돌리기엔 무거움

> **그래도 처음 한 달은 LM Studio로 학습하세요.**
> 다른 도구도 결국 같은 원리입니다.

---

## 이 장에서 기억할 한 가지

> **첫 로컬 AI 응답까지 15분.**
>
> 1. LM Studio 설치
> 2. Discover에서 8B Q4_K_M 다운로드
> 3. Chat에서 Load
> 4. 질문하면 답이 흐름

---

## 손으로 해볼 것

**1. 내 맥의 표준 모델 받아 첫 대화**

위 16.4 절 표에서 내 맥에 맞는 모델 하나 받기.

다음 질문을 차례로 던져 보세요.

```text
1. 한국어로 자기 소개 한 문장 해줘.
2. 1과 2를 합하면? (수학 기초)
3. Python으로 1~10 출력하는 코드 한 줄 짜줘.
4. 너 한국어 잘하는 편이야? 솔직하게.
```

응답마다 **First token / Speed** 값을 메모해두세요.

**2. 같은 질문으로 양자화 비교 (선택)**

여유 메모리가 있다면
Q4_K_M 과 Q5_K_M 을 모두 받아
같은 질문에 답을 비교해 보세요.

품질 vs 속도 트레이드오프를 직접 체감할 수 있습니다.

---

다음 장에서는
**Ollama** — 터미널과 API 중심의 로컬 AI 도구를 다룹니다.

자동화나 사내 도구에 붙일 거라면
거의 항상 Ollama가 더 편합니다.
