# 7장. fmt 패키지로 입출력

2장부터 매번 써 온 `fmt.Println` 의 정체를 이 장에서 들여다본다.
`fmt` 는 Go 의 표준 입출력 패키지로,
출력뿐 아니라 입력 받기, 문자열 만들기에도 두루 쓰인다.

목표:

- 세 가지 출력 함수의 차이 알기
- 포맷 동사로 출력 모양 자유롭게 조절하기
- 사용자 입력을 받아 변수에 담아 보기

---

## 7.1 fmt 패키지란

`fmt` 는 Go 표준 라이브러리에 들어 있는
**포맷팅 기반 입출력 패키지** 다.

- 화면에 값을 출력 (`Print`, `Println`, `Printf`)
- 문자열로 포맷팅 (`Sprintf`)
- 사용자 입력을 받음 (`Scan`, `Scanln`, `Scanf`)

이름의 fmt 는 format 의 줄임말이다.
형식을 지정해 입출력을 다룬다는 뜻이다.

```go
import "fmt"
```

3장에서 본 그 import 줄이 이걸 가져오는 것이다.

---

## 7.2 출력 함수

자주 쓰는 출력 함수 세 가지를 비교해 본다.

### fmt.Print

값을 그대로 출력한다.
줄바꿈도 없고, 인자 사이에 자동 공백도 없다.

```go
fmt.Print("Hello", "World")
fmt.Print("Done")
```

출력:

```
HelloWorldDone
```

세 단어가 다 붙어 나온다.
"내가 적은 그대로" 가 화면에 찍힌다고 보면 된다.

> 예외: 인자가 둘 다 문자열이 아닌 경우엔 자동으로 공백이 들어간다.
> 그래서 동작이 살짝 헷갈릴 때가 있다.
> 깔끔하게 가려면 다음에 나오는 `Printf` 가 낫다.

### fmt.Println

가장 많이 본 함수다.

- 인자 사이에 자동으로 공백을 넣어 준다
- 마지막에 자동으로 줄바꿈을 붙여 준다

```go
fmt.Println("Hello", "World")
fmt.Println("Done")
```

출력:

```
Hello World
Done
```

"디버깅용 빠른 출력" 으로 가장 편하다.

### fmt.Printf

포맷 문자열을 첫 인자로 받는다.
출력 모양을 정밀하게 다듬을 수 있다.

```go
name := "Alice"
age  := 30

fmt.Printf("%s is %d years old.\n", name, age)
```

출력:

```
Alice is 30 years old.
```

`%s` 자리에 `name`, `%d` 자리에 `age` 값이 들어간다.
줄바꿈은 자동이 아니라 `\n` 을 직접 적어 줘야 한다.

### 한눈에 비교

| 함수 | 자동 공백 | 자동 줄바꿈 | 포맷 지정 |
|---|---|---|---|
| `Print` | 일부 경우만 | 아니오 | 아니오 |
| `Println` | 예 | 예 | 아니오 |
| `Printf` | 아니오 | 아니오 (`\n` 직접) | 예 |

---

## 7.3 자주 쓰는 포맷 동사

`Printf` 의 핵심은 포맷 동사(verb) 다.
`%` 로 시작하는 짧은 코드로 "여기에 무엇을 끼워 넣을지" 를 지정한다.

### 기본 동사

| 동사 | 의미 | 예 |
|---|---|---|
| `%d` | 10진 정수 | `42` |
| `%f` | 실수 | `3.140000` |
| `%s` | 문자열 | `Hello` |
| `%t` | 불리언 | `true` |
| `%v` | 어떤 값이든 (기본 표현) | `42`, `Hello`, `true` |
| `%T` | 값의 **타입** 출력 | `int`, `string` |
| `%%` | 퍼센트 문자 자체 | `%` |

```go
n  := 42
pi := 3.14
s  := "Go"
ok := true

fmt.Printf("%d\n", n)       // 42
fmt.Printf("%f\n", pi)      // 3.140000
fmt.Printf("%s\n", s)       // Go
fmt.Printf("%t\n", ok)      // true
fmt.Printf("%v %v %v\n", n, pi, s)  // 42 3.14 Go
fmt.Printf("%T\n", n)       // int
fmt.Printf("100%% done\n")  // 100% done
```

`%v` 는 "타입 신경 쓰기 귀찮을 때" 쓰는 만능 동사다.
디버깅용으로 매우 자주 쓰인다.

### 너비와 정밀도

숫자 앞뒤에 추가로 옵션을 붙일 수 있다.

| 표기 | 의미 |
|---|---|
| `%5d` | 너비 5칸 (오른쪽 정렬, 앞에 공백) |
| `%-5d` | 너비 5칸 (왼쪽 정렬) |
| `%05d` | 너비 5칸 (앞을 0 으로 채움) |
| `%.2f` | 소수점 아래 2자리 |
| `%6.2f` | 전체 너비 6, 소수점 아래 2자리 |
| `%-10s` | 너비 10칸 (왼쪽 정렬 문자열) |

예시.

```go
fmt.Printf("[%5d]\n",   42)     // [   42]
fmt.Printf("[%-5d]\n",  42)     // [42   ]
fmt.Printf("[%05d]\n",  42)     // [00042]
fmt.Printf("[%.2f]\n",  3.14159) // [3.14]
fmt.Printf("[%6.2f]\n", 3.14159) // [  3.14]
fmt.Printf("[%-10s|]\n", "Go")  // [Go        |]
```

표 모양으로 정렬해 출력할 때 유용하다.

```go
fmt.Printf("%-10s %5d\n", "Alice",   30)
fmt.Printf("%-10s %5d\n", "Bob",    100)
fmt.Printf("%-10s %5d\n", "Charlie", 5)
```

출력:

```
Alice         30
Bob          100
Charlie        5
```

### 이스케이프 문자

문자열 안에서 특별한 의미를 가지는 짧은 표기들이다.

| 표기 | 의미 |
|---|---|
| `\n` | 줄바꿈 |
| `\t` | 탭 |
| `\\` | 역슬래시 자체 |
| `\"` | 큰따옴표 자체 |

```go
fmt.Printf("이름:\tAlice\n나이:\t30\n")
```

출력:

```
이름:	Alice
나이:	30
```

6장에서 본 백틱(`` ` ` ``) 문자열은 이런 이스케이프를 해석하지 않는다는 점을 같이 떠올려 보자.

---

## 7.4 문자열 만들기

화면에 출력하지 말고 **문자열 변수로 받고 싶을 때** 가 있다.
이때는 `fmt.Sprintf` 를 쓴다.

- `Printf` 와 사용법 동일
- 결과를 화면에 찍는 대신 `string` 으로 돌려준다

```go
name := "Alice"
age  := 30

greeting := fmt.Sprintf("%s is %d years old.", name, age)
fmt.Println(greeting)
// Alice is 30 years old.
```

활용 예시.

```go
// 파일명 만들기
path := fmt.Sprintf("logs/%d.txt", 2024)

// 로그 메시지 만들기
msg := fmt.Sprintf("user=%s action=%s ok=%t", name, "login", true)
```

문자열을 `+` 로 이어 만드는 것보다 훨씬 깔끔하다.
포맷 동사 덕에 숫자 자리수도 맞출 수 있다.

```go
for i := 1; i <= 3; i++ {
    file := fmt.Sprintf("file_%03d.txt", i)
    fmt.Println(file)
}
```

출력:

```
file_001.txt
file_002.txt
file_003.txt
```

---

## 7.5 사용자 입력 받기

지금까지는 프로그램이 일방적으로 출력만 했다.
이제 사용자가 입력한 값을 변수에 담아 보자.

### fmt.Scan

공백이나 줄바꿈을 기준으로 값들을 읽어 들인다.

```go
var name string
var age int

fmt.Print("이름과 나이를 입력하세요: ")
fmt.Scan(&name, &age)

fmt.Println("이름:", name)
fmt.Println("나이:", age)
```

실행 예.

```
이름과 나이를 입력하세요: Alice 30
이름: Alice
나이: 30
```

### & 가 붙는 이유 (짧게)

`Scan` 의 인자에 `&name`, `&age` 처럼 앞에 `&` 가 붙는다.
이건 "변수의 주소" 를 의미한다.

- 함수가 변수의 값을 **바꾸려면** 주소를 알아야 한다
- 값만 넘기면 함수 안에서 복사본만 바꾸고 끝난다

이 개념을 **포인터** 라고 부른다.
지금은 "입력 받을 때는 `&` 를 붙인다" 정도만 알면 충분하다.
포인터 자체는 14장에서 차근차근 다룬다.

### fmt.Scanln

`Scanln` 은 줄바꿈에서 입력을 끝낸다.
한 줄에 정해진 개수만큼만 받고 싶을 때 좋다.

```go
var name string
var age int

fmt.Print("입력: ")
fmt.Scanln(&name, &age)
```

`Scan` 과의 차이는 미묘하다.
`Scan` 은 줄바꿈을 만나도 더 읽어들이려 기다리지만,
`Scanln` 은 줄바꿈에서 멈춘다.

### fmt.Scanf

포맷을 지정해서 받는다.
`Printf` 의 입력 버전이라 보면 된다.

```go
var year int
var month int

fmt.Print("입력 (YYYY-MM): ")
fmt.Scanf("%d-%d", &year, &month)

fmt.Println(year, month)
```

실행 예.

```
입력 (YYYY-MM): 2024-09
2024 9
```

### 어떤 걸 써야 하나

| 함수 | 언제 쓰나 |
|---|---|
| `Scan` | 공백이나 줄바꿈으로 구분된 값 여러 개 |
| `Scanln` | 한 줄에 정확히 N 개의 값 |
| `Scanf` | 입력 형식이 정해져 있을 때 |

초보 단계에서는 `Scanln` 을 기본으로 쓰면 거의 다 된다.

---

## 7.6 미니 실습: 인사 프로그램

지금까지 배운 걸 합쳐서 간단한 프로그램을 만들어 보자.

> 사용자에게 이름과 나이를 입력 받아,
> 보기 좋은 인사 메시지를 출력한다.

```go
package main

import "fmt"

func main() {
    var name string
    var age int

    fmt.Print("이름을 입력하세요: ")
    fmt.Scanln(&name)

    fmt.Print("나이를 입력하세요: ")
    fmt.Scanln(&age)

    greeting := fmt.Sprintf(
        "안녕하세요, %s 님! 올해 %d 살이시군요.",
        name, age,
    )

    fmt.Println("---")
    fmt.Println(greeting)
    fmt.Printf("내년에는 %d 살이 됩니다.\n", age+1)
}
```

실행 예.

```
이름을 입력하세요: Alice
나이를 입력하세요: 30
---
안녕하세요, Alice 님! 올해 30 살이시군요.
내년에는 31 살이 됩니다.
```

이 작은 프로그램에 이번 장의 거의 모든 도구가 들어 있다.

- `fmt.Print` 로 줄바꿈 없는 안내문
- `fmt.Scanln` 으로 변수에 입력 받기
- `fmt.Sprintf` 로 문자열 조립
- `fmt.Println` 과 `fmt.Printf` 로 결과 출력

---

## 7.7 정리

- `fmt` 는 Go 표준 입출력 패키지다
- 출력 함수 세 가지의 성격이 다르다
  - `Print` : 그대로
  - `Println` : 공백 + 줄바꿈 자동
  - `Printf` : 포맷 지정
- 포맷 동사로 모양을 정밀하게 다듬는다 (`%d`, `%f`, `%s`, `%v`, `%T` 등)
- `Sprintf` 는 출력 대신 문자열을 돌려준다
- 입력은 `Scan`, `Scanln`, `Scanf`
  - 인자에는 `&변수명` 으로 주소를 넘긴다 (포인터, 14장)

이제 값을 다루고, 출력하고, 입력 받는 일이 가능해졌다.
하지만 프로그램이 진짜 "프로그램" 다워지려면 조건과 반복이 필요하다.

다음 장에서는 흐름 제어를 다룬다.
`if`, `switch`, `for` 로 분기와 반복을 표현해 보자.
