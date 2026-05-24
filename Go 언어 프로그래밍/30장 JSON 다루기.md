# 30장. JSON 다루기

JSON 은 오늘날 가장 흔한 데이터 교환 형식이다.
웹 API, 설정 파일, 로그, DB 의 한 컬럼까지 어디에나 등장한다.

Go 의 표준 라이브러리 `encoding/json` 만으로
대부분의 JSON 작업을 처리할 수 있다.
이번 장에서 그 사용법을 익힌다.

목표:

- Go 구조체와 JSON 사이를 자유롭게 변환하기
- 필드 태그로 키 이름과 옵션을 다루기
- 모양이 불확실한 JSON 을 안전하게 다루기
- 큰 JSON 데이터를 스트리밍으로 처리하기

---

## 30.1 encoding/json 패키지

핵심 함수는 두 개다.

| 함수 | 역할 |
|---|---|
| `json.Marshal` | Go 값 → JSON 바이트 |
| `json.Unmarshal` | JSON 바이트 → Go 값 |

이 둘만 알아도 90% 의 작업이 끝난다.

```go
import "encoding/json"
```

---

## 30.2 구조체와 JSON 매핑

가장 흔한 패턴은 구조체와 JSON 을 1:1 로 맞추는 것이다.

### 기본 매핑

```go
type User struct {
    Name string
    Age  int
}

u := User{Name: "Alice", Age: 30}
data, _ := json.Marshal(u)
fmt.Println(string(data))
// {"Name":"Alice","Age":30}
```

구조체 필드 이름이 그대로 JSON 키가 된다.

### 대소문자 규칙

> 매우 중요한 규칙: 대문자로 시작하는 필드만 JSON 에 포함된다.

```go
type User struct {
    Name string // O 포함됨
    age  int    // X 무시됨 (소문자)
}
```

이는 20장에서 본 export 규칙과 같다.
`json` 패키지는 소문자 필드에 접근할 수 없다.

### 필드 태그로 키 이름 바꾸기

JSON 키는 보통 `snake_case` 나 `camelCase` 다.
Go 의 `PascalCase` 와 다르다.
**필드 태그**로 매핑을 명시한다.

```go
type User struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

data, _ := json.Marshal(User{Name: "Alice", Age: 30})
// {"name":"Alice","age":30}
```

백틱(`` ` ``) 으로 둘러싼 문자열이 태그다.
`json:"키이름"` 형태로 적는다.

### 옵션: omitempty

빈 값이면 JSON 에서 빼고 싶을 때.

```go
type User struct {
    Name  string `json:"name"`
    Email string `json:"email,omitempty"`
}

u := User{Name: "Alice"} // Email 은 빈 문자열
data, _ := json.Marshal(u)
// {"name":"Alice"}     ← email 키가 없다
```

"빈 값" 의 기준은 각 타입의 제로값이다.

- 문자열: `""`
- 숫자: `0`
- bool: `false`
- 포인터/슬라이스/맵: `nil`

### 옵션: 제외(`"-"`)

특정 필드를 JSON 에서 항상 빼고 싶을 때.

```go
type User struct {
    Name     string `json:"name"`
    Password string `json:"-"`
}
```

`Password` 필드는 JSON 에 절대 나오지 않는다.
민감 정보 처리에 유용하다.

### 예제: User 구조체와 JSON

```go
type User struct {
    ID       int    `json:"id"`
    Name     string `json:"name"`
    Email    string `json:"email,omitempty"`
    Password string `json:"-"`
}

u := User{
    ID:       1,
    Name:     "Alice",
    Password: "secret",
}
data, _ := json.Marshal(u)
// {"id":1,"name":"Alice"}
```

---

## 30.3 인코딩 (구조체 → JSON)

### Marshal

```go
data, err := json.Marshal(value)
if err != nil {
    return err
}
```

결과는 `[]byte` 다.
문자열이 필요하면 `string(data)` 로 변환한다.

### MarshalIndent (가독성)

사람이 읽기 좋게 들여쓰기 된 JSON 을 만들 때.

```go
data, _ := json.MarshalIndent(u, "", "  ")
fmt.Println(string(data))
```

```json
{
  "id": 1,
  "name": "Alice"
}
```

- 두 번째 인자: 줄 머리 접두사 (보통 `""`)
- 세 번째 인자: 들여쓰기 (보통 공백 2~4칸)

설정 파일이나 디버그 출력에 유용하다.

### 슬라이스 / 맵 / 중첩 구조체

복잡한 구조도 그대로 인코딩된다.

```go
type Address struct {
    City    string `json:"city"`
    Country string `json:"country"`
}

type Person struct {
    Name      string   `json:"name"`
    Hobbies   []string `json:"hobbies"`
    Address   Address  `json:"address"`
    Scores    map[string]int `json:"scores"`
}

p := Person{
    Name:    "Alice",
    Hobbies: []string{"reading", "hiking"},
    Address: Address{City: "Seoul", Country: "KR"},
    Scores:  map[string]int{"math": 90, "eng": 80},
}
data, _ := json.MarshalIndent(p, "", "  ")
```

```json
{
  "name": "Alice",
  "hobbies": ["reading", "hiking"],
  "address": {
    "city": "Seoul",
    "country": "KR"
  },
  "scores": {
    "math": 90,
    "eng": 80
  }
}
```

별도 설정 없이 자동으로 처리된다.

---

## 30.4 디코딩 (JSON → 구조체)

### Unmarshal

```go
data := []byte(`{"name":"Alice","age":30}`)

var u User
if err := json.Unmarshal(data, &u); err != nil {
    return err
}
fmt.Println(u.Name, u.Age)
```

핵심 포인트:

- 두 번째 인자에 **포인터**를 넘긴다
- 그 포인터가 가리키는 구조체에 값이 채워진다

### 에러 처리

JSON 이 깨졌거나 타입이 맞지 않으면 에러가 난다.

```go
data := []byte(`{"name":"Alice","age":"thirty"}`) // age 가 문자열

var u User
err := json.Unmarshal(data, &u)
if err != nil {
    fmt.Println("디코딩 실패:", err)
}
```

21장의 에러 처리 관례를 그대로 적용한다.

### 알 수 없는 필드는 무시

JSON 에는 있는데 구조체에는 없는 필드는
조용히 무시된다.

```go
data := []byte(`{"name":"Alice","age":30,"extra":"hi"}`)

type User struct {
    Name string `json:"name"`
}

var u User
json.Unmarshal(data, &u)
// u.Name = "Alice", "age" 와 "extra" 는 무시
```

호환성을 유지하기 좋은 동작이다.
서버가 새 필드를 추가해도 클라이언트는 깨지지 않는다.

> 모르는 필드에서 에러를 내고 싶다면
> `json.Decoder` 의 `DisallowUnknownFields()` 를 쓴다.

### 빠진 필드는 제로값으로

JSON 에 없는 필드는 Go 의 제로값으로 남는다.

```go
data := []byte(`{"name":"Alice"}`)

type User struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

var u User
json.Unmarshal(data, &u)
// u = {Name:"Alice", Age:0}
```

"필드가 들어왔는가" 와 "값이 0 인가" 를 구분하려면
포인터 타입으로 선언한다.

```go
type User struct {
    Age *int `json:"age"`
}
```

- 안 들어왔으면 `nil`
- 0 이 들어왔으면 0 을 가리키는 포인터

---

## 30.5 동적 JSON 다루기

JSON 모양을 미리 알 수 없는 경우가 있다.
구조체를 못 정한다.

### map 또는 any 로 받기

```go
data := []byte(`{"name":"Alice","age":30}`)

var m map[string]any
json.Unmarshal(data, &m)

fmt.Println(m["name"]) // "Alice"
fmt.Println(m["age"])  // 30 (실제 타입은 float64)
```

JSON 의 값들이 Go 타입으로 변환되는 규칙은 다음과 같다.

| JSON 타입 | Go 타입 |
|---|---|
| 문자열 | `string` |
| 숫자 | `float64` (정수도 포함) |
| 불리언 | `bool` |
| 배열 | `[]any` |
| 객체 | `map[string]any` |
| null | `nil` |

> 숫자가 전부 `float64` 라는 점은 함정이다.
> 큰 정수를 다룬다면 정밀도 손실에 주의하자.
> `json.Decoder` 의 `UseNumber()` 옵션이 도움이 된다.

값을 꺼낼 때는 16장의 타입 단언을 쓴다.

```go
if name, ok := m["name"].(string); ok {
    fmt.Println(name)
}
```

### json.RawMessage 로 지연 처리

일부 필드만 미리 디코드하고
나머지는 나중에 처리하고 싶을 때.

```go
type Envelope struct {
    Type    string          `json:"type"`
    Payload json.RawMessage `json:"payload"`
}
```

`RawMessage` 는 그냥 바이트로 보관된다.
Type 값을 본 뒤에 그에 맞는 구조체로 다시 Unmarshal 한다.

```go
var env Envelope
json.Unmarshal(data, &env)

switch env.Type {
case "login":
    var p LoginPayload
    json.Unmarshal(env.Payload, &p)
case "logout":
    var p LogoutPayload
    json.Unmarshal(env.Payload, &p)
}
```

메시지가 여러 종류인 프로토콜에서 자주 쓰는 패턴이다.

---

## 30.6 스트리밍

`Marshal` / `Unmarshal` 은 데이터를 통째로 메모리에 들고 처리한다.
큰 파일이나 네트워크 스트림에서는 비효율적이다.

26장에서 본 스트리밍 철학을 JSON 에도 적용할 수 있다.
도구는 `json.Decoder` 와 `json.Encoder` 다.

### json.Decoder

`io.Reader` 에서 JSON 값을 하나씩 읽어 들인다.

```go
f, _ := os.Open("big.json")
defer f.Close()

dec := json.NewDecoder(f)
var u User
if err := dec.Decode(&u); err != nil {
    return err
}
```

여러 값이 이어진 형태("JSON Lines") 도 자연스럽다.

```go
// 한 줄에 하나씩 JSON 객체가 있는 파일
dec := json.NewDecoder(f)
for {
    var u User
    err := dec.Decode(&u)
    if err == io.EOF {
        break
    }
    if err != nil {
        return err
    }
    process(u)
}
```

전체를 메모리에 올리지 않고 한 객체씩 흘려보낸다.
26장의 `bufio.Scanner` 와 같은 발상이다.

### json.Encoder

`io.Writer` 에 JSON 을 흘려보낸다.

```go
f, _ := os.Create("out.json")
defer f.Close()

enc := json.NewEncoder(f)
for _, u := range users {
    if err := enc.Encode(u); err != nil {
        return err
    }
}
```

각 `Encode` 호출이 한 객체 + 개행을 적는다.
JSON Lines 형식이 그대로 만들어진다.

들여쓰기를 켤 수도 있다.

```go
enc.SetIndent("", "  ")
```

### 큰 파일 / 네트워크 스트림 처리

HTTP 응답 같은 네트워크 스트림은 그 자체가 `io.Reader` 다.
그래서 같은 패턴이 그대로 적용된다.

```go
resp, _ := http.Get(url)
defer resp.Body.Close()

dec := json.NewDecoder(resp.Body)
var data Response
dec.Decode(&data)
```

`io.ReadAll` 로 한 번에 다 받고 `Unmarshal` 하는 방법도 있지만,
응답이 커질 수 있다면 `Decoder` 가 더 안전하다.

---

## 30.7 정리

- `json.Marshal` / `Unmarshal` 로 기본 변환
- 구조체 ↔ JSON 매핑
  - **대문자 시작 필드만 인코딩됨**
  - 태그 `json:"키이름"` 으로 키 이름 지정
  - `omitempty` 로 빈 값 생략
  - `"-"` 로 필드 제외
- 디코딩 동작
  - 알 수 없는 필드는 무시
  - 빠진 필드는 제로값
  - 들어왔는지 0 인지 구분하려면 포인터 타입
- 모양이 불확실한 JSON
  - `map[string]any` 로 받고 타입 단언
  - `json.RawMessage` 로 지연 처리
- 스트리밍
  - `json.Decoder` 로 큰 파일/네트워크 처리
  - `json.Encoder` 로 점진적 출력

JSON 작업의 90% 는 "구조체와 태그를 잘 정의하는 것" 이다.
거기서부터 시작해서, 필요할 때 동적/스트리밍 도구를 꺼내 쓰면 된다.

다음 장에서는 지금까지 배운 것을 종합해
간단한 HTTP 서버를 만들어 본다.
JSON, 시간, 파일, 동시성이 한자리에 모인다.
