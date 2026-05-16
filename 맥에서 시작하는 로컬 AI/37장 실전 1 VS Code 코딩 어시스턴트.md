# 37장. 실전 ① VS Code 코딩 어시스턴트

> **이 장의 목표**
> 회사 코드를 외부에 보내지 않고
> **VS Code 안에서 ChatGPT처럼 코딩** 하는 환경을
> 30분 안에 만듭니다.

---

## 37.1 큰 그림

```text
[VS Code]
   ↓
[Continue.dev 확장]
   ↓ OpenAI 호환 API
[Ollama]
   ↓
[Qwen2.5-Coder-32B-Instruct (로컬)]
```

이걸 만들면:

- 자동완성 (탭 키)
- 코드 채팅 (사이드바)
- 인라인 편집 (`Cmd+I`)
- 코드 설명·디버깅

전부 로컬에서.

---

## 37.2 모델 선택

코딩 어시스턴트는 **코더 모델** 이 좋습니다 (9장).

| 메모리 | 권장 |
|---|---|
| 16GB | `qwen2.5-coder:7b` |
| 32GB | `qwen2.5-coder:14b` |
| 64GB | **`qwen2.5-coder:32b`** ★ |
| 32~64GB | DeepSeek-Coder-V2-Lite 도 가능 |

추가로 **자동완성용 작은 모델** 도 쓰면 좋습니다.

| 자동완성용 | 메모리 |
|---|---|
| `qwen2.5-coder:1.5b-base` | 매우 가벼움 |
| `qwen2.5-coder:3b-base` | 균형 |
| `qwen2.5-coder:7b-base` | 품질 |

이 둘이 분리되는 이유는 다음 절.

---

## 37.3 Chat 모델 vs FIM 모델

코딩 어시스턴트에는 두 종류 호출이 있습니다.

### Chat (대화 / 인라인 편집)

```text
"이 함수에 에러 처리 추가해줘"
```

→ Instruct/Chat 모델 사용.

### FIM (Fill-in-the-Middle, 자동완성)

```text
def get_user(id):
    user = db.query("...")
    return  ← 여기 채워줘
```

→ **Base 모델**의 FIM 기능 사용.
빠른 응답이 핵심.

> **자동완성에 32B는 너무 느립니다.**
> 1.5B~3B base 모델이 적합.

---

## 37.4 Ollama로 두 모델 받기

```bash
$ ollama pull qwen2.5-coder:32b
$ ollama pull qwen2.5-coder:1.5b-base
```

다운로드 후 확인:

```bash
$ ollama list
```

---

## 37.5 Continue.dev 설치

VS Code 확장 마켓플레이스에서 **Continue** 검색·설치.

설치 후 좌측 사이드바에 Continue 아이콘이 보입니다.

---

## 37.6 Continue 설정

`~/.continue/config.json` 또는
Continue 사이드바 → 설정 톱니바퀴.

```json
{
  "models": [
    {
      "title": "Qwen2.5 Coder 32B",
      "provider": "ollama",
      "model": "qwen2.5-coder:32b",
      "apiBase": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Qwen2.5 Coder 1.5B FIM",
    "provider": "ollama",
    "model": "qwen2.5-coder:1.5b-base",
    "apiBase": "http://localhost:11434"
  },
  "systemMessage": "You are a senior software engineer. Reply in Korean for explanations but keep code blocks in their original form."
}
```

| 키 | 의미 |
|---|---|
| `models` | Chat·인라인 편집용 모델 |
| `tabAutocompleteModel` | 자동완성용 (FIM) |
| `systemMessage` | 시스템 프롬프트 |

---

## 37.7 사용법

### 자동완성

코드 입력 중 멈추면 회색 텍스트로 추천이 뜸.
`Tab` 으로 수락, `Esc` 로 거절.

### 인라인 편집

코드 블록 선택 → `Cmd + I` →
"에러 처리 추가해줘" 같은 명령.

### 사이드바 채팅

좌측 Continue 아이콘 → 채팅창.
파일을 `@`로 첨부 가능.

```text
@src/login.py 이 함수의 보안 이슈를 찾아줘
```

---

## 37.8 활용 패턴

### 함수 단위 리뷰

```text
이 함수에 다음 관점에서 리뷰해줘:
1. 보안 (SQL injection, XSS)
2. 성능 (불필요한 쿼리, N+1)
3. 가독성 (변수명, 함수 분리)
```

### 테스트 자동 생성

```text
이 함수의 Pytest 단위 테스트를 작성해줘.
경계값과 예외 케이스 포함.
```

### 마이그레이션

```text
이 PHP 코드를 동일 동작의 Go 코드로 옮겨줘.
주석은 한국어로.
```

### 에러 분석

```text
다음 로그를 보고 원인 가능성 3개를
우선순위로 알려줘.

[로그 붙여넣기]
```

---

## 37.9 한국어 코딩 어시스턴트 시스템 프롬프트

```text
You are a senior software engineer based in Korea.

Rules:
1. Respond in Korean for explanations.
2. Code, paths, and shell commands stay in original form (no translation).
3. When unsure, explicitly say so. Don't invent APIs.
4. Prefer concise answers. Skip preamble.
5. When modifying logic, suggest tests if missing.
6. Match the project's existing style (indentation, naming).
```

---

## 37.10 보안 — 어디까지 모델에 노출되나

기본 Continue 동작:

- 현재 파일·선택 영역
- 사용자가 명시한 `@파일`
- 시스템·사용자 프롬프트

**자동으로 전체 프로젝트를 보내지 않습니다.**
필요할 때만 `@` 로 명시적으로 첨부.

회사 보안 정책에 따라
프로젝트 인덱싱 끄기 옵션도 있음:

```json
"experimental": {
  "disableIndex": true
}
```

---

## 37.11 자동완성 품질 개선

자동완성이 어색하다면 다음 시도.

### Context length 키우기

```json
"tabAutocompleteOptions": {
  "maxPromptTokens": 1024,
  "prefixPercentage": 0.8
}
```

### FIM 모델 키우기

1.5B → 3B → 7B (속도와 균형).

### 너무 길게 자동완성

```json
"tabAutocompleteOptions": {
  "maxTokens": 100
}
```

---

## 37.12 다른 클라이언트 — Cursor / Cline / Zed

| 도구 | 특징 |
|---|---|
| **Continue.dev** | 가장 무난. 이 책의 기본 |
| **Cline** | 자율 Agent 형 (29장). 파일 직접 수정 |
| **Aider** | 터미널 페어 프로그래밍 |
| **Cursor** | 자체 LLM 통합, 로컬 연결도 가능 |
| **Zed** | 빠른 에디터. AI 기본 내장 |

전부 OpenAI 호환 base_url 변경 지원.

---

## 37.13 속도 vs 품질 균형

64GB 맥에서 자주 쓰는 조합:

```text
자동완성:  qwen2.5-coder:1.5b-base    (매우 빠름)
채팅/편집: qwen2.5-coder:32b           (품질)

또는 시간이 급할 때:
채팅/편집: qwen2.5-coder:14b           (속도)
```

리눅스 서버에 32B를 두고 노트북은 클라이언트로만 쓰는 것도 좋습니다.

---

## 이 장에서 기억할 한 가지

> **VS Code + Continue + Ollama (Qwen2.5-Coder)**
> 가 가장 보편적인 사내 코딩 어시스턴트 구성.
>
> 자동완성용 작은 모델 + 채팅용 큰 모델 **두 개**를 같이.

---

## 손으로 해볼 것

**1. 30분 셋업**

37.4 ~ 37.6 절을 따라 셋업.
간단한 함수 하나 짜면서:

- 자동완성 동작
- `Cmd+I` 인라인 편집
- 사이드바 채팅 + `@파일` 첨부

세 가지가 다 되는지 확인.

**2. 회사 코드 한 함수 리뷰**

본인 프로젝트의 함수 하나를 선택해
"이 함수의 잠재적 버그·보안 이슈를 찾아줘"
라고 시키세요.

답이 충분히 유용한지 평가.
유용하지 않으면 시스템 프롬프트 강화·모델 크기 ↑.

---

다음 장에서는
**실전 ② 사내 RAG 챗봇** 을 만듭니다.

26·27장의 모든 개념이 한 곳에 모입니다.
