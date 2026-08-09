# 부록 A. Kotlin 문법 빠른 참조

자주 쓰는 문법을 한곳에 모았습니다.  
기억이 가물가물할 때 빠르게 찾아보세요.

---

## val / var

```kotlin
val name = "홍길동"   // 변경 불가 (권장 기본값)
var age = 20         // 변경 가능

val price: Int = 1000   // 타입 명시
```

- `val` : 한 번 정하면 못 바꿈
- `var` : 나중에 바꿀 수 있음

(자세히: 2장)

---

## if / when

```kotlin
// if는 표현식 (값을 돌려줌)
val max = if (a > b) a else b

// when
val grade = when (score) {
    in 90..100 -> "A"
    in 80..89  -> "B"
    else       -> "F"
}

// 타입 검사 when
when (value) {
    is String -> println("문자열")
    is Int    -> println("정수")
    else      -> println("기타")
}
```

(자세히: 3장)

---

## Nullable 연산자

```kotlin
val name: String? = null

name?.length              // Safe Call: null이면 null
name ?: "기본값"           // Elvis: null이면 기본값
name!!                    // Not-null 단언 (위험)
val len = name?.length ?: 0   // 조합
```

| 연산자 | 뜻                    |
| --- | -------------------- |
| `?.` | null이 아닐 때만 실행       |
| `?:` | null이면 오른쪽 값 사용      |
| `!!` | null이면 예외 (최후의 수단)   |
| `as?`| 캐스팅 실패 시 null        |

(자세히: 5장)

---

## Collection 함수

```kotlin
list.filter { it > 0 }          // 조건에 맞는 것만
list.map { it * 2 }             // 변환
list.groupBy { it.category }    // 그룹화
list.sortedBy { it.price }      // 정렬
list.sumOf { it.price }         // 합계
list.any { it.isActive }        // 하나라도 참인가
list.all { it.isActive }        // 모두 참인가
list.find { it.id == 1L }       // 첫 번째 일치 (없으면 null)
```

(자세히: 13장)

---

## Scope Function

```kotlin
val result = value.let { it.trim() }      // 변환, nullable
val obj = Person().apply { name = "홍" }    // 객체 설정
value.also { println(it) }                // 부가 작업
with(person) { println(name) }            // 여러 멤버 접근
val x = run { compute() }                 // 블록 실행 후 결과
```

(자세히: 15장, 부록 C)

---

## 클래스 관련 키워드

```kotlin
class User(val name: String)          // 클래스 + 프로퍼티
data class Point(val x: Int, val y: Int)   // 데이터 클래스
enum class Color { RED, GREEN, BLUE }      // 열거형
sealed interface Result                     // 봉인된 타입
object Config                               // 싱글턴
interface Repository                        // 인터페이스
abstract class Shape                        // 추상 클래스

open class Base        // 상속 허용 (기본은 final)
class Child : Base()   // 상속
```

| 키워드     | 용도            |
| ------- | ------------- |
| `class` | 일반 클래스        |
| `data`  | 값 중심 클래스      |
| `enum`  | 정해진 값들        |
| `sealed`| 제한된 타입 계층     |
| `object`| 싱글턴           |
| `open`  | 상속 허용         |

(자세히: 7~11장)
