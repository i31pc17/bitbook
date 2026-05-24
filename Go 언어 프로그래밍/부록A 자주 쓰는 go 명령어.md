# 부록 A. 자주 쓰는 `go` 명령어

`go` 명령어는 컴파일러뿐 아니라
프로젝트 관리, 테스트, 분석을 모두 묶은 도구다.
실무에서 자주 쓰는 것만 한 자리에 모았다.

이 부록은 사전처럼 쓰면 된다.
잊었을 때 한 줄씩 찾아보는 용도다.

---

## A.1 한눈에 보기

| 명령 | 한 줄 설명 |
|---|---|
| `go run` | 빌드 후 즉시 실행 (결과물 안 남김) |
| `go build` | 실행 파일 생성 |
| `go install` | 빌드 후 `$GOBIN` 에 설치 |
| `go test` | 테스트 실행 |
| `go mod init` | 새 모듈 초기화 |
| `go mod tidy` | 의존성 정리 |
| `go get` | 외부 패키지 받기 / 버전 변경 |
| `go fmt` | 코드 정리 |
| `go vet` | 정적 분석 |
| `go env` | Go 환경변수 확인 |
| `go doc` | 패키지 / 식별자 문서 보기 |
| `go tool pprof` | 프로파일 분석 |

---

## A.2 빌드와 실행

### go run

소스를 빌드해서 바로 실행한다.
실행 파일은 임시 위치에 만들어지고 사라진다.

```bash
go run main.go
go run .
go run ./cmd/server
```

| 표현 | 의미 |
|---|---|
| `main.go` | 그 파일 하나만 |
| `.` | 현재 디렉터리의 패키지 전체 |
| `./cmd/server` | 그 경로의 패키지 |

> 빠르게 시도해 볼 때 가장 자주 쓰는 명령이다.

### go build

실행 파일을 만든다.

```bash
go build           # 현재 디렉터리에 실행 파일
go build -o bin/app
go build ./...     # 모듈 안 모든 패키지를 빌드 검증
```

크로스 컴파일도 환경변수만으로 된다.

```bash
GOOS=linux  GOARCH=amd64 go build -o app-linux
GOOS=darwin GOARCH=arm64 go build -o app-mac
GOOS=windows GOARCH=amd64 go build -o app.exe
```

빌드 시 자주 쓰는 플래그:

| 플래그 | 의미 |
|---|---|
| `-o <파일>` | 출력 파일 이름 지정 |
| `-race` | 데이터 레이스 탐지기 포함 |
| `-ldflags="-s -w"` | 바이너리 용량 줄이기 (디버그 심볼 제거) |
| `-trimpath` | 빌드 경로 정보 제거 (재현 가능 빌드) |

### go install

빌드 후 결과물을 `$GOBIN` (기본 `$HOME/go/bin`)에 둔다.
CLI 도구 배포에 자주 쓴다.

```bash
go install example.com/cmd/mytool@latest
```

| 표현 | 의미 |
|---|---|
| `@latest` | 최신 버전 |
| `@v1.2.3` | 특정 버전 |
| `@main` | main 브랜치 최신 커밋 |

> `$GOBIN` 이 `PATH` 에 들어 있어야 어디서나 실행할 수 있다.

---

## A.3 테스트와 측정

### go test

```bash
go test            # 현재 패키지
go test ./...      # 모듈의 모든 패키지
go test -v         # 상세 출력
go test -run TestAdd      # 이름 패턴 매칭
go test -run TestAdd/음수 # 서브테스트만
go test -count=1   # 결과 캐시 무효화
```

> `go test` 는 같은 코드면 결과를 캐싱한다.
> 캐시를 무시하고 강제로 다시 돌리려면 `-count=1`.

### -race — 데이터 레이스 탐지

```bash
go test -race ./...
go run -race ./cmd/server
```

23장에서 봤듯이, 한 곳에서 동시 접근 사고가 일어나면
바로 보고해 준다. CI 에서는 거의 항상 켠다.

### -bench — 벤치마크

```bash
go test -bench=.            # 모든 벤치마크
go test -bench=BenchmarkAdd # 특정 벤치마크
go test -bench=. -benchmem  # 메모리 할당도
go test -bench=. -benchtime=3s
go test -bench=. -count=5
```

### -cover — 커버리지

```bash
go test -cover                    # 요약
go test -coverprofile=c.out       # 파일로 저장
go tool cover -html=c.out         # HTML 리포트
go tool cover -func=c.out         # 함수별 통계
```

---

## A.4 모듈과 의존성

### go mod init

새 모듈을 시작한다.

```bash
go mod init example.com/myapp
```

`go.mod` 파일이 생긴다.
모듈 경로는 보통 GitHub 등 호스팅 주소를 쓴다.

### go mod tidy

`go.mod`, `go.sum` 을 코드와 동기화한다.

```bash
go mod tidy
```

- 코드가 쓰는 외부 패키지를 자동으로 추가
- 더 이상 쓰지 않는 의존성은 제거
- 해시 정보를 `go.sum` 에 갱신

> 의존성 작업의 마무리로 거의 항상 한 번 돌린다.

### go mod download

`go.sum` 에 명시된 의존성을 미리 받는다.
주로 CI 빌드의 첫 단계로 쓴다.

```bash
go mod download
```

### go get

외부 패키지를 추가하거나 버전을 바꾼다.

```bash
go get github.com/google/uuid
go get github.com/google/uuid@v1.6.0
go get -u            # 모든 의존성 마이너 버전 업그레이드
go get -u ./...      # 위와 거의 같음
```

| 표현 | 의미 |
|---|---|
| 패키지 추가 | `go get <경로>` |
| 특정 버전 고정 | `go get <경로>@v1.2.3` |
| 업그레이드 | `go get -u <경로>` |
| 제거 | `go mod tidy` 후 자동 |

---

## A.5 코드 품질 도구

### go fmt / gofmt

코드 스타일을 통일한다.

```bash
go fmt ./...        # 모듈 전체 정리
gofmt -d main.go    # 변경 사항을 diff 로만 표시
gofmt -w main.go    # 파일에 직접 반영
```

VS Code 에서는 저장 시 자동으로 돈다.

### go vet

흔한 실수를 정적으로 잡아 준다.

```bash
go vet ./...
```

잡아 주는 예:

- `Printf` 의 포맷 동사와 인자 개수 불일치
- shadowing 가능성
- 사용되지 않는 결과
- 잘못된 락 사용 패턴

> `go test` 실행 시 자동으로 함께 도는 경우도 많다.

### golangci-lint (외부)

여러 린터를 한 번에 묶어 돌려 주는 외부 도구다.
실무에선 거의 표준이다. 부록 C 에서 더 다룬다.

---

## A.6 환경 정보

### go env

설정된 환경변수를 출력한다.

```bash
go env
go env GOOS GOARCH GOPATH
```

자주 보는 값:

| 변수 | 의미 |
|---|---|
| `GOOS` | 타깃 OS (linux/darwin/windows ...) |
| `GOARCH` | 타깃 아키텍처 (amd64/arm64 ...) |
| `GOPATH` | 모듈 캐시 / `bin` 위치 (기본 `~/go`) |
| `GOROOT` | Go 자체 설치 위치 |
| `GOMODCACHE` | 다운로드된 모듈 캐시 |

### go version

```bash
go version
go version -m ./myapp    # 빌드된 바이너리의 모듈 정보
```

---

## A.7 문서 보기

### go doc

표준 라이브러리든 외부 패키지든 문서를 터미널에서 본다.

```bash
go doc fmt
go doc fmt.Println
go doc -src fmt.Println       # 소스 코드도
go doc strings.Builder
```

### pkg.go.dev

웹 브라우저에서 보고 싶다면 https://pkg.go.dev 가 공식 문서 포털이다.
검색 한 줄이면 거의 모든 공개 패키지를 찾을 수 있다.

> 옛날엔 별도 `godoc` 서버를 띄웠지만,
> 지금은 공식 사이트가 그 역할을 대신한다.

---

## A.8 프로파일링과 디버깅 보조

### go tool pprof

CPU / 메모리 프로파일을 분석한다 (26장).

```bash
go test -cpuprofile cpu.out -bench=.
go tool pprof cpu.out
```

`pprof` 안에서 자주 쓰는 명령:

| 명령 | 의미 |
|---|---|
| `top` | 시간 많이 쓴 함수 상위 목록 |
| `list FuncName` | 특정 함수 줄 단위 분석 |
| `web` | 그래프를 브라우저로 (graphviz 필요) |

HTTP 서버에 `net/http/pprof` 를 임포트하면
실행 중인 서버에서 바로 프로파일을 얻을 수 있다.

### go tool trace

이벤트 트레이스를 분석한다.
고루틴 스케줄링, GC, 시스템 콜 등을 시각화한다.

```bash
go test -trace=trace.out -bench=.
go tool trace trace.out
```

---

## A.9 자주 묶어 쓰는 한 줄들

실무에서 손에 익혀 두면 좋은 조합들이다.

```bash
# 의존성 정리 → 포맷 → 정적 분석 → 테스트
go mod tidy && go fmt ./... && go vet ./... && go test ./...

# 레이스 + 커버리지로 모두 돌리기
go test -race -cover ./...

# Linux용 작은 바이너리
GOOS=linux GOARCH=amd64 \
  go build -ldflags="-s -w" -trimpath -o app

# 의존성 업데이트 흐름
go get -u ./...
go mod tidy
```

---

## A.10 정리

`go` 하나로 빌드, 테스트, 의존성, 분석까지 모두 된다.
처음에는 명령이 많아 보이지만,
실제로 매일 쓰는 건 다섯 개 정도다.

- `go run`
- `go test`
- `go build`
- `go mod tidy`
- `go fmt` (대개 자동)

나머지는 필요할 때 이 부록을 한 번씩 펴 보면 된다.
