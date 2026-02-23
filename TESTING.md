# 로컬 테스트 가이드

BitBook을 로컬에서 빌드하고 미리보기하는 방법입니다.

---

## 사전 준비

### 1. Python 3.10+

```bash
python --version
```

### 2. mdBook 설치

아래 중 하나를 선택하세요.

**winget (권장)**
```bash
winget install mdbook
```

**cargo**
```bash
cargo install mdbook
```

**수동 다운로드**

[mdBook Releases](https://github.com/rust-lang/mdBook/releases) 에서 zip 다운로드 후 PATH에 추가하거나 `.bin/` 폴더에 넣으세요.

---

## 빌드 & 미리보기

### 1단계: SUMMARY.md 생성

```bash
python scripts/generate_summary.py
```

출력 예시:
```
  [OK] 팀장을 하며 계속 정리하게 되는 것들 - 31 chapters
  [OK] 면접관을 위한 면접의 기술 - 3 chapters
  ...
Generated SUMMARY.md - 94 entries total
```

### 2단계: 빌드

```bash
mdbook build
```

`book/` 폴더에 HTML이 생성됩니다.

### 3단계: 로컬 서버

```bash
mdbook serve --open
```

브라우저에서 `http://localhost:3000` 이 자동으로 열립니다.
파일을 수정하면 자동으로 새로고침됩니다.

---

## 한 줄로 실행

```bash
python scripts/generate_summary.py && mdbook serve --open
```

---

## 새 챕터 추가 시

1. 해당 책 폴더에 마크다운 파일 추가 (예: `Apache Kafka/17장 새 주제.md`)
2. 파일 첫 줄에 `# 제목` 작성
3. `python scripts/generate_summary.py` 재실행
4. SUMMARY.md가 자동으로 갱신됩니다

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| `mdbook: command not found` | mdBook 미설치 | 위 설치 방법 참고 |
| 빌드 시 파일 못 찾음 | 경로에 공백 | `generate_summary.py`가 자동 처리 |
| 한글 깨짐 | 인코딩 | 파일을 UTF-8로 저장 |
| 목차에 새 파일 안 보임 | SUMMARY 미갱신 | `python scripts/generate_summary.py` 재실행 |