# 부록 D. Java 개발자를 위한 Kotlin 비교표

자바를 아는 분이  
"이건 코틀린으로 어떻게 쓰지?"를  
빠르게 찾을 수 있게 정리했습니다.

---

## Java POJO → Kotlin Data Class

자바에서는 게터/세터/`equals`/`hashCode`/`toString`을  
길게 작성했습니다.

```java
// Java
public class User {
    private final String name;
    private final int age;
    // 생성자, getter, equals, hashCode, toString ...
}
```

코틀린은 한 줄입니다.

```kotlin
// Kotlin
data class User(val name: String, val age: Int)
```

(자세히: 9장)

---

## static → Companion Object

```java
// Java
public class Factory {
    public static Factory create() { ... }
}
Factory.create();
```

```kotlin
// Kotlin
class Factory {
    companion object {
        fun create(): Factory = Factory()
    }
}
Factory.create()
```

상수는 `const val`을 씁니다.

```kotlin
companion object {
    const val MAX = 100
}
```

(자세히: 11장)

---

## Optional → Nullable

```java
// Java
Optional<User> findUser(Long id);

Optional<User> user = findUser(1L);
user.map(User::getName).orElse("없음");
```

```kotlin
// Kotlin
fun findUser(id: Long): User?

val user = findUser(1)
user?.name ?: "없음"
```

코틀린은 `Optional` 대신  
타입에 `?`를 붙여 null 가능성을 표현합니다.

(자세히: 5장, 6장)

---

## Stream → Collection 함수

```java
// Java
list.stream()
    .filter(u -> u.getAge() >= 20)
    .map(User::getName)
    .collect(Collectors.toList());
```

```kotlin
// Kotlin
list.filter { it.age >= 20 }
    .map { it.name }
```

`.stream()`이나 `.collect()`가 필요 없습니다.  
컬렉션에서 바로 함수를 부릅니다.

(자세히: 13장)

---

## 익명 클래스 → Lambda / Object Expression

```java
// Java
button.setOnClickListener(new OnClickListener() {
    public void onClick() { ... }
});
```

```kotlin
// Kotlin: 람다 (SAM 변환)
button.setOnClickListener { ... }

// 여러 메서드가 필요하면 object 식
val listener = object : SomeListener {
    override fun onStart() { ... }
    override fun onEnd() { ... }
}
```

(자세히: 11장, 14장, 25장)

---

## Checked Exception 차이

```java
// Java: 반드시 처리하거나 선언해야 함
public void read() throws IOException { ... }
```

```kotlin
// Kotlin: 검사 예외가 없음
fun read() { ... }   // throws 선언 불필요
```

코틀린에는 검사 예외가 없어  
`try-catch`가 강제되지 않습니다.  
다만 실패 가능성은 스스로 챙겨야 합니다.

(자세히: 23장, 25장)

---

## 한눈에 보는 대응표

| 자바               | 코틀린                    |
| ---------------- | ---------------------- |
| POJO + 게터/세터     | `data class`           |
| `static`         | `companion object`     |
| `static final`   | `const val`            |
| `Optional<T>`    | `T?` (nullable)        |
| Stream API       | Collection 함수          |
| 익명 클래스           | Lambda / `object` 식    |
| Checked Exception| 없음 (강제 처리 X)           |
| `void`           | `Unit` (생략 가능)         |
| `==` (객체 비교)     | `===`                  |
| `equals()` (값 비교)| `==`                   |

이 표 하나면  
자바 지식을 코틀린으로 빠르게 옮길 수 있습니다.
