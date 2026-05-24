# 31장. 간단한 HTTP 서버

여기까지 왔다면 Go 의 거의 모든 핵심 기능을 봤다.
이번 장은 그 모든 게 한자리에 모이는 곳이다.

구조체와 JSON, 함수와 인터페이스,
동시성과 채널, 에러 처리...
이런 것들이 합쳐져
**웹 서버**라는 결과물이 된다.

목표:

- `net/http` 만으로 HTTP 서버를 띄우기
- 핸들러를 등록하고 요청/응답 다루기
- 쿼리, 경로, JSON 본문 읽기
- 미들웨어 패턴 익히기
- 정적 파일 서빙

---

## 31.1 net/http 둘러보기

Go 의 표준 라이브러리에는
이미 완전한 HTTP 서버가 들어 있다.

- 별도 프레임워크 없이 서버를 만들 수 있다
- 운영 환경에서도 그대로 쓸 만한 성능
- 외부 라이브러리는 라우팅 편의 등 부가 기능 정도

이 장은 **표준 라이브러리만** 으로 다룬다.
나중에 `chi`, `echo`, `gin` 같은 프레임워크로 옮겨가도
근본 개념은 그대로 통한다.

```go
import "net/http"
```

---

## 31.2 가장 작은 HTTP 서버

전체 코드 먼저.

```go
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Hello, World!")
    })

    log.Println("listening on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

이 한 파일이 진짜 동작하는 웹 서버다.
실행 후 브라우저로 `http://localhost:8080` 에 접속하면
"Hello, World!" 가 보인다.

핵심 두 함수.

| 함수 | 역할 |
|---|---|
| `http.HandleFunc` | 경로 → 처리 함수 등록 |
| `http.ListenAndServe` | 지정한 포트에서 서버 시작 |

`ListenAndServe` 의 두 번째 인자가 `nil` 이면
기본 라우터(default mux) 를 쓴다.
방금 등록한 핸들러가 거기 등록돼 있다.

---

## 31.3 핸들러

### http.Handler 인터페이스

`net/http` 의 핵심 인터페이스는 이거다.

```go
type Handler interface {
    ServeHTTP(w ResponseWriter, r *Request)
}
```

이 한 메서드만 가진 타입이면 모두 핸들러가 될 수 있다.
16장에서 본 인터페이스의 위력이다.

### HandlerFunc 어댑터

매번 타입을 만들고 메서드를 다는 건 번거롭다.
그래서 `http.HandlerFunc` 라는 어댑터가 있다.

```go
type HandlerFunc func(w ResponseWriter, r *Request)

// 자기 자신을 메서드로 호출
func (f HandlerFunc) ServeHTTP(w ResponseWriter, r *Request) {
    f(w, r)
}
```

이 덕분에 그냥 함수를 핸들러로 쓸 수 있다.
`HandleFunc` 가 내부에서 이 어댑터를 적용한다.

### ResponseWriter 와 Request

핸들러 함수의 두 인자.

- `http.ResponseWriter` — 응답을 적는 곳
  - 헤더 설정: `w.Header()`
  - 상태 코드: `w.WriteHeader(...)`
  - 본문: `w.Write(...)` 또는 `fmt.Fprint(w, ...)`
- `*http.Request` — 요청 정보가 든 구조체
  - `r.Method` — GET, POST 등
  - `r.URL` — URL 객체
  - `r.Header` — 요청 헤더
  - `r.Body` — 요청 본문 (io.Reader)

---

## 31.4 URL 라우팅

### http.ServeMux

내장 라우터다.

```go
mux := http.NewServeMux()
mux.HandleFunc("/", indexHandler)
mux.HandleFunc("/about", aboutHandler)

http.ListenAndServe(":8080", mux)
```

직접 `mux` 를 만들어 두 번째 인자로 넘기는 편이
큰 프로젝트에서 더 깔끔하다.

### 경로 매칭 규칙

- `/users` 처럼 끝에 `/` 가 없으면 **정확 일치**
- `/users/` 처럼 끝에 `/` 가 있으면 **접두사 매치**

```go
mux.HandleFunc("/static/", staticHandler)
// /static/ 로 시작하는 모든 경로
```

### Go 1.22 이후: 메서드 + 경로 패턴

Go 1.22 부터는 라우터가 한층 강력해졌다.
메서드와 경로 변수를 지정할 수 있다.

```go
mux.HandleFunc("GET /users/{id}", getUser)
mux.HandleFunc("POST /users", createUser)
mux.HandleFunc("DELETE /users/{id}", deleteUser)
```

경로 변수는 `r.PathValue("id")` 로 꺼낸다.

이전에는 외부 라우터 라이브러리가 사실상 필수였지만,
이제는 표준만으로도 꽤 멀리 갈 수 있다.

---

## 31.5 요청 다루기

### 쿼리 파라미터

```go
// GET /search?q=hello&page=2
func search(w http.ResponseWriter, r *http.Request) {
    q := r.URL.Query()
    keyword := q.Get("q")     // "hello"
    page := q.Get("page")     // "2" (문자열)

    fmt.Fprintf(w, "q=%s page=%s", keyword, page)
}
```

`r.URL.Query()` 는 `map` 비슷한 타입이다.
- `Get(key)` — 한 값 (없으면 `""`)
- `Has(key)` — 키가 있는지

문자열이므로 숫자가 필요하면 27장의 `strconv` 로 변환한다.

### 경로 변수 (Go 1.22+)

```go
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    fmt.Fprintf(w, "user id = %s", id)
})
```

### 요청 메서드

```go
switch r.Method {
case http.MethodGet:
    ...
case http.MethodPost:
    ...
default:
    http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}
```

Go 1.22 이후 라우터 패턴을 쓰면
메서드는 라우팅 단계에서 걸러지므로
이 분기가 줄어든다.

### 헤더

```go
ua := r.Header.Get("User-Agent")
auth := r.Header.Get("Authorization")
```

`r.Header` 는 `map[string][]string` 형태지만
보통 `Get` 으로 충분하다.

### JSON 본문 디코딩

30장의 스트리밍 디코더가 여기서 빛난다.

```go
type CreateUser struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

func createUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUser
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "bad json", http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    fmt.Fprintf(w, "created: %s", req.Name)
}
```

- `r.Body` 가 `io.Reader` 이므로 `json.NewDecoder` 가 그대로 받는다
- 디코딩 실패는 400 으로 응답
- `r.Body.Close()` 는 좋은 습관이지만
  Go 가 자동 정리를 어느 정도 보장한다

---

## 31.6 응답 보내기

### 상태 코드

```go
w.WriteHeader(http.StatusCreated) // 201
```

- 한 번만 호출할 수 있다
- 호출 안 하면 자동으로 200
- **헤더를 먼저 설정한 뒤에 호출**해야 한다

### 응답 헤더

```go
w.Header().Set("Content-Type", "application/json")
w.Header().Set("X-Custom", "value")
```

`WriteHeader` 또는 `Write` 가 호출된 뒤에는
헤더 변경이 무시된다.
"헤더 설정 → 상태 코드 → 본문" 순서를 지킨다.

### JSON 응답 보내기 (전체 예제)

```go
type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
}

func getUser(w http.ResponseWriter, r *http.Request) {
    u := User{ID: 1, Name: "Alice"}

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    if err := json.NewEncoder(w).Encode(u); err != nil {
        log.Println("encode error:", err)
    }
}
```

`json.NewEncoder(w).Encode(u)` 한 줄이
구조체 → JSON 변환 + 응답 본문 쓰기를 한 번에 한다.

> `Encode` 가 실패해도 응답 헤더는 이미 보낸 뒤다.
> 이 시점에서는 로그만 남기는 게 보통이다.

### 에러 응답 도우미

```go
http.Error(w, "not found", http.StatusNotFound)
```

- 적절한 헤더 설정
- 상태 코드 설정
- 본문 적기

세 가지를 한 번에 해 준다.
간단한 에러 응답에 매우 자주 쓴다.

---

## 31.7 미들웨어 패턴

같은 일을 모든 핸들러에서 반복하고 싶다.
예: 모든 요청에 대해 로그 남기기, 인증 확인 등.

**미들웨어**는 핸들러를 감싸는 또 다른 핸들러다.

### 모양

```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s took %v", r.Method, r.URL.Path, time.Since(start))
    })
}
```

- 입력으로 핸들러를 받고
- 그 핸들러를 감싸는 새 핸들러를 반환

### 사용

```go
mux := http.NewServeMux()
mux.HandleFunc("/", indexHandler)

handler := loggingMiddleware(mux)
http.ListenAndServe(":8080", handler)
```

### 여러 개 쌓기

```go
h := loggingMiddleware(
    authMiddleware(
        recoveryMiddleware(mux),
    ),
)
```

함수 합성처럼 쌓는다.
가장 바깥쪽 미들웨어가 가장 먼저 실행된다.

| 흔히 쓰는 미들웨어 | 역할 |
|---|---|
| 로깅 | 요청/응답 시간 기록 |
| 인증 | Authorization 헤더 검사 |
| 패닉 복구 | 핸들러의 panic 을 recover |
| CORS | 교차 출처 헤더 추가 |
| 압축 | gzip 응답 압축 |

미들웨어는 그 자체로 핸들러이므로
인터페이스 한 줄 (`http.Handler`) 만 구현하면 끝이다.
16장 인터페이스의 힘이 한 번 더 드러난다.

---

## 31.8 정적 파일 서빙

이미지, CSS, JS 같은 파일을 그대로 서빙할 때
`http.FileServer` 를 쓴다.

```go
fs := http.FileServer(http.Dir("./public"))
mux.Handle("/static/", http.StripPrefix("/static/", fs))
```

- `./public` 디렉터리의 파일들을 `/static/...` 경로로 노출
- `StripPrefix` 는 요청 경로에서 `/static/` 을 떼어 낸 뒤
  파일 시스템에서 찾도록 한다

이 줄들만으로 작은 정적 사이트도 그대로 돌아간다.

---

## 31.9 정리

- `net/http` 만으로 운영 가능한 웹 서버를 만들 수 있다
- 가장 작은 서버
  - `http.HandleFunc` + `http.ListenAndServe`
- 핸들러
  - 핵심 인터페이스 `http.Handler` (`ServeHTTP`)
  - 함수 어댑터 `http.HandlerFunc`
- 라우팅
  - `http.ServeMux`
  - Go 1.22+ 는 `"GET /users/{id}"` 패턴 지원
- 요청 다루기
  - 쿼리 `r.URL.Query()`
  - 경로 변수 `r.PathValue(...)` (1.22+)
  - 헤더 `r.Header.Get(...)`
  - JSON 본문 `json.NewDecoder(r.Body).Decode(...)`
- 응답 보내기
  - 헤더 → 상태 코드 → 본문 순서
  - JSON 은 `json.NewEncoder(w).Encode(...)`
  - 에러는 `http.Error(w, ..., status)`
- 미들웨어
  - 핸들러를 감싸는 또 다른 핸들러
  - 로깅, 인증, 복구, CORS 등에 활용
- 정적 파일은 `http.FileServer` + `http.StripPrefix`

여기까지 오면
Go 의 핵심을 거의 다 활용한 셈이다.
구조체와 JSON 으로 데이터 형식,
함수와 인터페이스로 라우팅과 미들웨어,
동시성으로 다수 요청을 동시에 처리,
에러 처리로 안정적인 응답.

다음 장에서는 한 단계 더 나아간다.
지금까지 만든 코드를 **테스트**로 지킨다.
