# 부록 C. Scope Function 선택표

스코프 함수 다섯 가지가 헷갈릴 때  
이 표로 빠르게 골라 쓰세요.  
(자세한 설명은 15장 참고)

---

## 한눈에 보는 선택표

| 함수      | 객체 접근  | 반환값       | 주요 용도        |
| ------- | ------ | --------- | ------------ |
| `let`   | `it`   | Lambda 결과 | 변환, Nullable |
| `run`   | `this` | Lambda 결과 | 객체 기반 계산     |
| `with`  | `this` | Lambda 결과 | 여러 멤버 접근     |
| `apply` | `this` | 객체        | 객체 설정        |
| `also`  | `it`   | 객체        | 부가 작업        |

---

## 두 가지 기준으로 고르기

스코프 함수는 두 질문으로 정리됩니다.

첫째, 객체를 무엇으로 부르는가?

- `it`으로 부름 : `let`, `also`
- `this`로 부름 : `run`, `with`, `apply`

둘째, 무엇을 돌려주는가?

- 람다 결과를 돌려줌 : `let`, `run`, `with`
- 객체 자신을 돌려줌 : `apply`, `also`

---

## 상황별 예시

### let — nullable 처리와 변환

```kotlin
val length = name?.let { it.trim().length }
```

null이 아닐 때만 실행하고  
결과를 돌려받고 싶을 때.

### run — 객체 기반 계산

```kotlin
val area = rectangle.run { width * height }
```

객체의 멤버를 써서  
어떤 값을 계산할 때.

### with — 여러 멤버에 연속 접근

```kotlin
with(person) {
    println(name)
    println(age)
}
```

한 객체의 여러 멤버를  
반복해서 다룰 때.

### apply — 객체 설정 후 그 객체 반환

```kotlin
val user = User().apply {
    name = "홍길동"
    age = 20
}
```

객체를 만들면서 설정하고  
그 객체를 그대로 받고 싶을 때.

### also — 부가 작업(로그 등)

```kotlin
val result = compute().also {
    println("계산 결과: $it")
}
```

흐름을 끊지 않고  
로그나 검증 같은 곁다리 작업을 할 때.

---

## 주의: 과하게 쓰지 않기

스코프 함수를 깊게 중첩하면  
오히려 읽기 어려워집니다. (38장)

```kotlin
// 나쁜 예: 과한 중첩
a?.let { it.b?.let { it.c?.let { println(it) } } }

// 좋은 예
val c = a?.b?.c
if (c != null) println(c)
```

> 편리하다고 남발하지 말고,  
> "읽기 쉬운가"를 기준으로 선택하세요.
