# 36장. Mac 메모리 관리 실전

> **이 장의 목표**
> 평소 64GB 맥에서 32B 모델을 돌리며
> 브라우저·IDE·도커까지 같이 쓸 때
> **swap 없이 쾌적하게** 유지하는 실전 요령을 정리합니다.

---

## 36.1 통합 메모리의 본질

4장 복습.

```text
일반 PC:  RAM(시스템) + VRAM(GPU)   ← 분리
맥 Apple Silicon: 통합 메모리(Unified Memory) ← 공유
```

장점:

- 큰 모델을 GPU에 올리기 쉬움
- macOS·앱·모델이 같은 풀에서 자유롭게 할당

단점:

- 모델이 너무 크면 **시스템 전체 압박**
- swap 발생 시 SSD I/O 폭주
- 발열·배터리 직격

---

## 36.2 메모리 점검 도구

### 활성 상태 보기 (Activity Monitor)

- `Cmd + Space` → "활성 상태 보기"
- **메모리** 탭
- 핵심 4개:
  - **물리적 메모리** (총량)
  - **사용된 메모리**
  - **메모리 압력** (그래프 색깔)
  - **스왑 사용량**

### 메모리 압력 색

- 🟢 **녹색**: 여유
- 🟡 **노랑**: 한계 근처
- 🔴 **빨강**: swap 발생 중

빨강이 자주 보이면 위험 신호.

### 터미널에서

```bash
$ top -l 1 | grep -E "PhysMem|VM"
PhysMem: 42G used (5G wired), 22G unused.
VM:      ... compressor: ...   swapouts: ...
```

`swapouts` 가 늘어나면 swap 사용 중.

---

## 36.3 모델 메모리 사용 추적

### Ollama

```bash
$ ollama ps
NAME              SIZE     PROCESSOR    UNTIL
qwen3:32b         24 GB    100% GPU     4 minutes from now
```

### LM Studio

좌하단 상태바에 실시간 사용량 표시.

### MLX

```bash
$ activity monitor에서 "python3" 또는 mlx_lm 프로세스 확인
```

---

## 36.4 평소 메모리 분배 (64GB 기준)

```text
[64GB 통합 메모리]
┌──────────────────────────────┐
│ macOS · 시스템:    약 6GB      │
│ 브라우저(Chrome):  4~10GB     │
│ IDE(VS Code):     1~3GB       │
│ Docker:           4~8GB       │
│ 기타 앱:           2~4GB       │
│ ──────                       │
│ 모델 + KV Cache: 30~45GB 가용 │
└──────────────────────────────┘
```

이게 평소 분배.

32B Q4 + 16K 컨텍스트 = 약 26GB 모델 사용 → 무난.
70B Q4 = 약 45GB → 거의 한계.

---

## 36.5 swap을 줄이는 실전 6가지

### ① 안 쓰는 앱 종료

브라우저 탭 100개, 슬랙, Notion, Zoom 다 켜져 있으면
모델 들어갈 자리가 없음.

자주 쓰는 앱만 남기기.

### ② Docker 중지

```bash
$ docker stop $(docker ps -q)
$ docker system prune
```

또는 Docker Desktop의 메모리 한도를 낮춤.

### ③ 백그라운드 모델 언로드

여러 모델 받아두면 자동으로 메모리에 다 안 올라가지만,
**Ollama는 자동 언로드 시간을 5분으로 늘려두면 좋음.**

```bash
$ export OLLAMA_KEEP_ALIVE=5m
```

쓰지 않는 모델은:

```bash
$ ollama stop qwen3:32b
```

### ④ 컨텍스트를 필요한 만큼만

128K를 굳이 쓰지 마세요.
16K로 충분한 경우가 95%.

### ⑤ 양자화를 한 단계 낮추기

Q5_K_M → Q4_K_M 으로만 바꿔도 메모리 25% 절약.

### ⑥ KV Cache 양자화

llama.cpp 옵션:

```bash
$ llama-server ... --cache-type-k q8_0 --cache-type-v q8_0
```

긴 컨텍스트에서 메모리 절반.

---

## 36.6 SSD swap 정책

macOS는 메모리 부족 시 SSD에 swap합니다.

```bash
$ sysctl vm.swapusage
vm.swapusage: total = 4096.00M  used = 2048.00M  free = 2048.00M
```

문제:

- 응답 속도 폭락
- SSD 수명 단축 (장기 사용 시)
- 발열

> **장기적으로 swap에 의존하지 마세요.**
> 모델 크기·컨텍스트를 줄이는 게 답.

---

## 36.7 발열·쓰로틀링

장시간 32B+ 모델 사용 시
**CPU/GPU 클럭이 자동 하향** 됩니다.

증상:

- 첫 답변은 18 tok/s
- 30분 후 같은 모델이 12 tok/s

대처:

- 외장 쿨링패드
- 노트북 받침대 (공기 흐름)
- 카페·여름 → 시원한 환경
- 데스크 사용 시 클램쉘 모드 피하고 키보드 열기

---

## 36.8 배터리 절약 모드 주의

macOS의 **저전력 모드** 가 켜져 있으면
GPU 성능이 크게 떨어집니다.

```text
시스템 설정 → 배터리 → 저전력 모드
```

로컬 AI 사용 중에는 **꺼두기**.

---

## 36.9 모델 저장 위치 — 외장 SSD

내장 SSD 용량이 부족하면 외장으로.

Ollama:

```bash
$ export OLLAMA_MODELS=/Volumes/External/ollama-models
```

LM Studio:

설정 → Models Directory 변경.

> **주의:**
> 외장 SSD는 USB 3.2 / Thunderbolt 권장.
> USB 2.0은 모델 로딩이 너무 느림.

---

## 36.10 멀티 모델 동시 사용

기본적으로 Ollama·LM Studio는
**같은 모델 인스턴스 1개만** 메모리에 올립니다.

여러 모델을 동시에 쓰고 싶다면:

```bash
$ export OLLAMA_MAX_LOADED_MODELS=2
$ export OLLAMA_NUM_PARALLEL=2
```

⚠ 메모리 폭주 주의.
64GB 맥에서는 7B + 14B 정도까지가 안전.

---

## 36.11 모니터링 자동화

평소에 모델 상태를 한눈에 보고 싶다면
간단한 watch 명령:

```bash
$ watch -n 2 'ollama ps; echo "---"; top -l 1 | grep PhysMem'
```

2초마다 갱신되는 모델·메모리 상태 대시보드.

---

## 36.12 메모리 응급처치

답이 갑자기 끊기거나 맥이 멈춘다면:

1. **활성 상태 보기** → 메모리 압력 확인
2. 빨강이면 큰 앱·모델 종료
3. swap이 안 줄면 **재부팅**
4. 재부팅 후 모델만 띄워서 베이스라인 측정

---

## 이 장에서 기억할 한 가지

> **64GB 맥에서 32B 모델은 충분하지만**
> **브라우저·도커·IDE 다 켜두면 빡빡합니다.**
>
> swap 없는 운영의 핵심:
> ① 안 쓰는 앱 닫기
> ② 컨텍스트 줄이기
> ③ 양자화 한 단계 낮추기

---

## 손으로 해볼 것

**1. 평소 메모리 분포 메모**

활성 상태 보기에서 다음을 기록.

- 평소 사용 메모리: ?GB
- 32B 모델 로드 후: ?GB
- 32B + 회의록 RAG 후: ?GB
- 메모리 압력 색: ?

**2. swap 시점 측정**

일부러 한계까지 밀어보기.

- 70B Q4 + 64K 컨텍스트 + 브라우저 100탭
- `vm.swapusage` 변화 관찰

이걸 한 번 경험하면
**왜 32B Q4 + 16K 가 표준인지** 몸으로 압니다.

---

다음 장에서는
**실전 ① VS Code 코딩 어시스턴트** 를 만듭니다.
