# 부록 B. 초보가 자주 만나는 에러와 해결

Go 의 에러 메시지는 친절한 편이지만,
처음 보면 "이게 무슨 말이지" 싶은 경우가 적지 않다.

이 부록은 그런 메시지를 만났을 때
빠르게 원인과 해결책을 찾도록 정리한 카드 모음이다.

각 항목은 다음 형태로 적혀 있다.

- 에러 메시지
- 원인
- 해결 코드

---

## B.1 컴파일 단계 에러

### imported and not used: "strings"

**원인.** 임포트만 해 놓고 한 번도 안 썼다.
Go 는 미사용 import 를 컴파일 에러로 막는다 (3장).

**잘못된 예:**

```go
import (
    "fmt"
    "strings" // 안 씀
)

func main() {
    fmt.Println("hi")
}
```

**해결.** 안 쓰는 import 줄을 지운다.
VS Code 의 Go 확장은 저장 시 자동으로 정리해 준다.

가끔 import 만 해서 부작용을 얻는 패키지가 있는데
(예: `database/sql` 드라이버 등록)
이때는 빈 식별자 `_` 를 붙인다.

```go
import _ "github.com/lib/pq"
```

---

### declared but not used: x

**원인.** 변수를 선언만 하고 한 번도 안 썼다 (4장).

```go
func main() {
    x := 10 // 오류
}
```

**해결.** 쓰거나 지운다.
디버깅 중에 잠깐 살려 두고 싶다면 빈 식별자에 대입한다.

```go
_ = x
```

> 함수 반환값을 받기 싫을 때도 `_` 를 쓴다 — `n, _ := strconv.Atoi(s)`.

---

### cannot use X (type T1) as type T2 in argument

**원인.** 함수가 기대하는 타입과
넘긴 값의 타입이 다르다 (4장, 9장).

```go
func greet(n int) { ... }

var x int32 = 3
greet(x) // 오류: int32 ≠ int
```

**해결.** 명시적 변환을 한다.

```go
greet(int(x))
```

> Go 는 다른 언어처럼 정수끼리 자동 변환하지 않는다.
> "비슷하게 생긴" 타입도 똑같이 취급하지 않는다.

---

### missing return at end of function

**원인.** 반환 타입이 있는데
모든 실행 경로가 `return` 으로 끝나지 않는다 (9장).

```go
func sign(n int) string {
    if n > 0 {
        return "+"
    } else if n < 0 {
        return "-"
    }
    // n == 0 일 때 빠짐
}
```

**해결.** 빠진 경로에 return 을 넣는다.

```go
func sign(n int) string {
    if n > 0 {
        return "+"
    }
    if n < 0 {
        return "-"
    }
    return "0"
}
```

---

### syntax error: unexpected newline, expecting `{`

**원인.** 여는 중괄호 `{` 를 다음 줄로 내렸다 (3장).
세미콜론 자동 삽입 규칙 때문에 컴파일이 깨진다.

```go
// 오류
func main()
{
    fmt.Println("hi")
}
```

**해결.** `{` 를 항상 같은 줄에 둔다.

```go
func main() {
    fmt.Println("hi")
}
```

`if`, `for`, `switch` 도 마찬가지다.

---

## B.2 모듈 / 패키지 관련

### go: cannot find main module

**원인.** 현재 디렉터리 또는 상위에 `go.mod` 가 없다 (20장).

**해결.** 모듈을 초기화한다.

```bash
go mod init example.com/myapp
```

---

### no required module provides package X

**원인.** 외부 패키지를 import 했지만
`go.mod` 가 그 의존성을 모른다.

```go
import "github.com/google/uuid"
```

**해결.** 의존성으로 등록한다.

```bash
go get github.com/google/uuid
go mod tidy
```

---

### missing go.sum entry for module

**원인.** `go.mod` 에는 있는데 `go.sum` 에 해시가 빠졌다.

**해결.**

```bash
go mod tidy
```

> `go mod tidy` 는 의존성 작업의 마지막에 거의 항상 돌린다.

---

### package X is not in std

**원인.** 표준 라이브러리에 없는 패키지를
표준처럼 import 하고 있다.

**해결.** 외부 패키지라면 `go get` 으로 받는다.
오타가 아닌지도 한 번 확인한다.

```bash
go get github.com/...
```

---

## B.3 런타임 panic

### panic: runtime error: index out of range [N] with length M

**원인.** 슬라이스 / 배열의 유효 범위를 벗어난 인덱스 (11장).

```go
xs := []int{1, 2, 3}
_ = xs[5] // panic
```

**해결.** 접근 전에 길이를 확인한다.

```go
if i < len(xs) {
    _ = xs[i]
}
```

`for range` 를 쓰면 자동으로 안전한 인덱스를 받는다.

---

### panic: assignment to entry in nil map

**원인.** 선언만 한 맵에 값을 넣고 있다 (12장).
선언만 하면 맵은 `nil` 이고, 쓰기는 panic 이 된다.

```go
var m map[string]int
m["a"] = 1 // panic
```

**해결.** `make` 로 만든다.

```go
m := make(map[string]int)
m["a"] = 1
```

리터럴로 만들어도 된다.

```go
m := map[string]int{}
```

---

### fatal error: concurrent map writes

**원인.** 여러 고루틴이 보호 없이 같은 맵을 쓰고 있다 (19장, 23장).
Go 맵은 동시 쓰기에 안전하지 않다.

**해결 1.** `sync.Mutex` 로 보호.

```go
var (
    mu sync.Mutex
    m  = map[string]int{}
)

mu.Lock()
m["a"]++
mu.Unlock()
```

**해결 2.** 쓰기는 한 고루틴만 하도록 설계 (24장).
채널로 변경 요청을 보내면 한 곳에서 적용한다.

**해결 3.** 읽기 위주라면 `sync.Map` 도 선택지 (25장).

---

### fatal error: all goroutines are asleep - deadlock!

**원인.** 모든 고루틴이 서로를 기다리며 멈췄다 (22장, 23장).

가장 흔한 사례 두 가지.

**사례 1.** 받는 사람이 없는 채널에 보냄.

```go
ch := make(chan int)
ch <- 1 // 받는 고루틴이 없음 → 영원히 대기
```

**해결.** 받는 고루틴을 먼저 띄우거나
버퍼 채널을 쓴다.

```go
ch := make(chan int, 1)
ch <- 1
```

**사례 2.** `range` 가 끝나지 않음.
보내는 쪽이 `close` 를 안 했다.

```go
for v := range ch { // close 없으면 무한 대기
    ...
}
```

**해결.** 송신이 끝났을 때 `close(ch)` 호출.

```go
close(ch)
```

---

## B.4 자주 부딪히는 함정

### nil 인터페이스 비교 함정

```go
var err *MyError = nil
var i error = err
fmt.Println(i == nil) // false (의외로!)
```

**원인.** 인터페이스는 (타입, 값) 두 부분이다 (16장).
타입이 박혀 있으면 값이 nil 이어도 인터페이스 자체는 nil 이 아니다.

**해결.** nil 일 가능성이 있는 경우엔
인터페이스로 박지 말고 그대로 반환한다.

```go
func find() (*MyError, error) {
    return nil, nil // 인터페이스로 박지 않음
}
```

함수가 `error` 를 반환해야 한다면
nil 일 때는 명시적으로 nil 을 반환한다.

```go
if err == nil {
    return nil
}
return err
```

---

### 슬라이스의 부분 슬라이스가 원본을 붙잡는 함정

```go
big := make([]byte, 1<<20)
small := big[:10]
```

`small` 은 짧지만 내부적으로 `big` 의 큰 배열을 가리킨다.
GC 가 `big` 을 못 풀어 메모리가 안 줄어든다 (11장, 26장).

**해결.** 메모리를 끊고 싶다면 `copy` 로 새 배열에 옮긴다.

```go
small := make([]byte, 10)
copy(small, big[:10])
big = nil
```

---

### 루프 변수 캡처 함정 (Go 1.22 이전)

```go
xs := []int{1, 2, 3}
for _, x := range xs {
    go func() {
        fmt.Println(x) // 예상치 못한 값
    }()
}
```

Go 1.22 미만에서는 `x` 가 매 반복마다 같은 변수라
고루틴 실행 시점엔 마지막 값으로 모이는 일이 흔했다 (10장, 22장).

**해결 1.** 매 반복에서 새 변수로 복사.

```go
for _, x := range xs {
    x := x
    go func() { fmt.Println(x) }()
}
```

**해결 2.** 인자로 전달.

```go
for _, x := range xs {
    go func(v int) { fmt.Println(v) }(x)
}
```

> Go 1.22 부터는 `for` 루프 변수가 매 반복마다 새로 만들어진다.
> 같은 코드라도 결과가 달라진다.
> 사용 중인 Go 버전을 확인하자.

---

### 0 으로 나누기 / 나머지

```go
x := 10 / 0 // 컴파일 에러
```

상수면 컴파일러가 잡아 준다.
하지만 변수라면 런타임 panic 이 된다.

```go
var b int = 0
_ = 10 / b // panic
```

**해결.** 나누기 전에 0 검사를 한다.

```go
if b != 0 {
    _ = 10 / b
}
```

---

### shadowing 으로 인한 미묘한 버그

```go
var x int

if true {
    x := 10 // 안쪽에서 새 x 생성
    _ = x
}
fmt.Println(x) // 0
```

**원인.** `:=` 는 같은 이름이라도
바깥 블록의 변수를 안 가리지 않고
새 변수를 만든다 (10장).

**해결.** 바깥 변수를 쓰고 싶을 땐 `=` 로 대입한다.

```go
if true {
    x = 10
}
```

`go vet -shadow` 또는 `golangci-lint` 의 `govet` 가 잡아 준다.

---

### 에러를 무시하면 안 되는데 무시한 경우

```go
data, _ := os.ReadFile("config.json") // 위험
```

파일이 없거나 권한이 없을 때
`data` 는 빈 슬라이스가 되고
이후 코드가 이상하게 흘러간다 (21장).

**해결.** 에러는 항상 확인한다.

```go
data, err := os.ReadFile("config.json")
if err != nil {
    return fmt.Errorf("config 읽기: %w", err)
}
```

---

## B.5 정리

자주 만나는 에러 메시지의 패턴은 결국 몇 가지로 모인다.

- 미사용 변수 / import
- nil 맵 / nil 인터페이스
- 슬라이스 인덱스 / 잘못된 길이
- 동시 접근 / 데드락
- `go.mod` 누락 / `go.sum` 누락

처음엔 당황스럽지만,
한 번씩 만나 본 다음부터는
메시지만 보고도 어느 줄을 봐야 할지 감이 온다.

이 부록은 다 외울 필요는 없다.
실제로 에러를 만났을 때 다시 펴 보면 된다.
