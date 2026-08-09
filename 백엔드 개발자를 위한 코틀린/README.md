# 백엔드 개발자를 위한 코틀린

### JVM부터 코틀린다운 코드, 백엔드 객체 설계까지

---

## 목차

---

# 1부. 코틀린 시작하기

### 1장. 백엔드 개발자가 코틀린을 배우는 이유

- 1.1 코틀린은 어떤 언어인가
- 1.2 Kotlin 코드는 어떻게 실행되는가
- 1.3 개발 환경 준비하기
- 1.4 첫 번째 Kotlin 프로그램

---

# 2부. 코틀린 기본 문법

### 2장. 변수와 타입

- 2.1 `val`과 `var`
- 2.2 타입과 타입 추론
- 2.3 문자열 다루기
- 2.4 Kotlin의 특별한 타입
- 2.5 값의 비교와 객체의 비교

### 3장. 조건과 반복

- 3.1 표현식으로서의 `if`
- 3.2 `when`
- 3.3 범위와 반복
- 3.4 구조 분해

### 4장. 함수

- 4.1 함수 선언하기
- 4.2 기본 인자와 이름 붙은 인자
- 4.3 가변 인자
- 4.4 함수 오버로딩
- 4.5 로컬 함수

---

# 3부. 안전하게 데이터를 다루는 코틀린

### 5장. Null Safety

- 5.1 Nullable과 Non-null
- 5.2 Safe Call `?.`
- 5.3 Elvis Operator `?:`
- 5.4 Not-null Assertion `!!`
- 5.5 Safe Cast `as?`
- 5.6 Nullable 값을 다루는 함수
- 5.7 초기화를 늦추기
- 5.8 Collection과 Null

### 6장. Java와 Kotlin 사이의 Null

- 6.1 Platform Type
- 6.2 Java API 호출하기
- 6.3 백엔드에서 만나는 Null
- 6.4 Null을 어떻게 모델링할 것인가

---

# 4부. 객체를 설계하는 코틀린

### 7장. 클래스와 프로퍼티

- 7.1 클래스 만들기
- 7.2 생성자
- 7.3 Getter와 Setter
- 7.4 접근 제어
- 7.5 불변 객체 만들기

### 8장. 상속과 인터페이스

- 8.1 Kotlin 클래스는 기본적으로 `final`
- 8.2 상속
- 8.3 인터페이스
- 8.4 인터페이스로 의존성 분리하기

### 9장. 데이터를 표현하는 클래스

- 9.1 Data Class
- 9.2 `copy`
- 9.3 구조 분해
- 9.4 백엔드 DTO 만들기

### 10장. Enum과 Sealed Type

- 10.1 Enum
- 10.2 Sealed Class
- 10.3 Sealed Interface
- 10.4 결과를 타입으로 표현하기
- 10.5 Enum과 Sealed Type 선택하기

### 11장. Object와 Companion Object

- 11.1 `object`
- 11.2 Companion Object
- 11.3 Java의 `static`과 비교
- 11.4 익명 객체

---

# 5부. 컬렉션과 함수형 프로그래밍

### 12장. Kotlin Collection

- 12.1 List, Set, Map
- 12.2 읽기 전용과 Mutable Collection
- 12.3 Collection 생성하기
- 12.4 Collection 조회하기

### 13장. Collection을 가공하는 함수

- 13.1 선택하고 변환하기
- 13.2 데이터를 찾고 검사하기
- 13.3 데이터를 묶기
- 13.4 정렬하고 중복 제거하기
- 13.5 집계하기
- 13.6 누적 계산
- 13.7 백엔드 데이터 가공 예제

### 14장. Lambda와 함수 타입

- 14.1 Lambda Expression
- 14.2 함수도 값이다
- 14.3 고차 함수
- 14.4 Closure
- 14.5 함수 참조
- 14.6 백엔드 로직을 함수로 분리하기

### 15장. Scope Function

- 15.1 `let`
- 15.2 `run`
- 15.3 `with`
- 15.4 `apply`
- 15.5 `also`
- 15.6 `this`와 `it`
- 15.7 어떤 Scope Function을 선택할 것인가
- 15.8 중첩된 Scope Function 피하기

### 16장. Sequence와 지연 연산

- 16.1 Collection 연산은 어떻게 실행되는가
- 16.2 Sequence란 무엇인가
- 16.3 `asSequence`
- 16.4 Intermediate Operation과 Terminal Operation
- 16.5 Lazy Evaluation
- 16.6 Collection과 Sequence 선택하기
- 16.7 Sequence가 항상 빠른 것은 아니다
- 16.8 대량 데이터 처리와 Sequence의 한계

---

# 6부. 코틀린다운 코드 작성하기

### 17장. 확장 함수와 확장 프로퍼티

- 17.1 Extension Function
- 17.2 Extension Property
- 17.3 확장 함수의 실제 동작
- 17.4 Member Function과 Extension Function
- 17.5 백엔드 공통 로직 분리하기

### 18장. 연산자와 Kotlin Convention

- 18.1 Operator Overloading
- 18.2 비교 연산
- 18.3 `contains`
- 18.4 `get`과 `set`
- 18.5 Iterator
- 18.6 구조 분해의 동작 원리
- 18.7 필요한 경우에만 연산자 오버로딩하기

### 19장. 위임

- 19.1 Delegation이란 무엇인가
- 19.2 Interface Delegation과 `by`
- 19.3 Property Delegation
- 19.4 `lazy`
- 19.5 Observable Property
- 19.6 Custom Delegate
- 19.7 상속보다 위임이 적절한 경우

---

# 7부. 타입 시스템을 깊게 이해하기

> 난이도가 높은 심화 파트입니다. 처음에는 건너뛰고 필요할 때 돌아와도 됩니다.

### 20장. Generic

- 20.1 Generic Class
- 20.2 Generic Function
- 20.3 Type Parameter 제한
- 20.4 Nullable Generic
- 20.5 Generic API 응답 객체 만들기

### 21장. Variance

- 21.1 왜 `List<Child>`는 `List<Parent>`가 아닌가
- 21.2 Invariance
- 21.3 Covariance와 `out`
- 21.4 Contravariance와 `in`
- 21.5 Star Projection
- 21.6 읽는 타입과 쓰는 타입
- 21.7 실무 코드를 읽기 위한 Variance

### 22장. Inline과 Reified

- 22.1 고차 함수와 함수 객체
- 22.2 `inline`
- 22.3 `noinline`
- 22.4 `crossinline`
- 22.5 JVM의 Type Erasure
- 22.6 `reified`
- 22.7 런타임 타입을 사용하는 Generic 함수

---

# 8부. 예외와 오류를 설계하기

### 23장. 예외 처리

- 23.1 `try`, `catch`, `finally`
- 23.2 Expression으로서의 `try`
- 23.3 `throw`
- 23.4 Kotlin에는 Checked Exception이 없다
- 23.5 Custom Exception
- 23.6 예외 메시지와 오류 정보 설계

### 24장. 실패를 표현하는 여러 방법

- 24.1 Nullable로 실패 표현하기
- 24.2 Exception으로 실패 표현하기
- 24.3 `Result`
- 24.4 `runCatching`
- 24.5 `getOrNull`, `getOrElse`, `getOrThrow`
- 24.6 Sealed Type으로 결과 표현하기
- 24.7 어떤 방식을 선택해야 하는가

---

# 9부. Java 생태계에서 코틀린 사용하기

### 25장. Java와 Kotlin 함께 사용하기

- 25.1 Java 코드를 Kotlin에서 호출하기
- 25.2 Java Getter와 Setter
- 25.3 Java Collection
- 25.4 SAM Conversion
- 25.5 Checked Exception
- 25.6 Platform Type 다시 살펴보기

### 26장. Kotlin 코드를 Java에 공개하기

- 26.1 Kotlin 코드가 JVM에서 보이는 모습
- 26.2 `@JvmStatic`
- 26.3 `@JvmField`
- 26.4 `@JvmOverloads`
- 26.5 `@JvmName`
- 26.6 Top-level Function
- 26.7 Java 친화적인 Kotlin API 만들기

### 27장. Annotation

- 27.1 Annotation 사용하기
- 27.2 Annotation 정의하기
- 27.3 Target과 Retention
- 27.4 Kotlin의 Use-site Target
- 27.5 DTO Validation을 예로 이해하기

### 28장. Reflection

- 28.1 Reflection이란
- 28.2 Java Reflection과 Kotlin Reflection
- 28.3 `KClass`
- 28.4 Property Reflection
- 28.5 Function Reflection
- 28.6 Annotation 조회하기
- 28.7 Reflection의 비용과 사용 시 주의점
- 28.8 프레임워크가 객체를 다루는 방식 이해하기

---

# 10부. 프로젝트를 구성하고 테스트하기

### 29장. Gradle과 Kotlin 프로젝트

- 29.1 Gradle이 필요한 이유
- 29.2 Gradle Wrapper
- 29.3 `build.gradle.kts`
- 29.4 Plugin
- 29.5 Repository
- 29.6 Dependency
- 29.7 Configuration
- 29.8 Task
- 29.9 Kotlin DSL 읽기
- 29.10 프로젝트 디렉터리 구조

### 30장. Kotlin 코드 테스트하기

- 30.1 테스트가 필요한 이유
- 30.2 JUnit 5
- 30.3 테스트 코드 작성하기
- 30.4 Given-When-Then
- 30.5 Kotlin의 백틱 함수 이름
- 30.6 Assertion
- 30.7 Test Fixture
- 30.8 예외 테스트
- 30.9 Parameterized Test

### 31장. 의존성이 있는 코드 테스트하기

- 31.1 Test Double
- 31.2 Dummy
- 31.3 Stub
- 31.4 Fake
- 31.5 Mock
- 31.6 Repository를 Fake로 교체하기
- 31.7 MockK 맛보기
- 31.8 테스트하기 좋은 코드의 구조

---

# 11부. 백엔드 코드로 익히는 Kotlin

> 지금까지 배운 언어 기능을 백엔드 프로그램의 구조로 연결합니다.  
> 특정 웹 프레임워크는 사용하지 않습니다.

### 32장. 백엔드 애플리케이션의 객체 나누기

- 32.1 회원과 주문 예제 설계
- 32.2 Domain Object
- 32.3 Request와 Response
- 32.4 Service
- 32.5 Repository
- 32.6 객체의 역할과 책임
- 32.7 패키지 구성하기

### 33장. DTO 설계하기

- 33.1 요청 객체 만들기
- 33.2 응답 객체 만들기
- 33.3 Data Class 활용하기
- 33.4 Nullable Field 결정하기
- 33.5 Default Parameter 사용하기
- 33.6 Domain Object를 그대로 응답하지 않기
- 33.7 Domain과 DTO 변환하기
- 33.8 Extension Function으로 변환 코드 정리하기

### 34장. 도메인 객체 설계하기

- 34.1 데이터를 담는 객체와 행동을 가진 객체
- 34.2 상태를 외부에서 변경하지 못하게 하기
- 34.3 생성 시점에 유효한 객체 만들기
- 34.4 Enum으로 상태 표현하기
- 34.5 Value Object 만들기
- 34.6 불변성을 활용한 모델링

### 35장. Repository 설계하기

- 35.1 Repository가 필요한 이유
- 35.2 Repository Interface
- 35.3 Memory Repository 만들기
- 35.4 조회 결과와 Nullable
- 35.5 Repository 구현체 교체하기
- 35.6 데이터 저장 방식과 비즈니스 로직 분리하기

### 36장. Service와 의존성

- 36.1 Service의 역할
- 36.2 생성자를 통한 의존성 전달
- 36.3 구현체가 아닌 Interface에 의존하기
- 36.4 Dependency Injection의 기본 개념
- 36.5 Service 테스트하기
- 36.6 Fake Repository 활용하기
- 36.7 의존성이 늘어날 때 발생하는 문제

---

# 12부. 실전 프로젝트

### 37장. Kotlin으로 주문 시스템 만들기

> 웹 서버나 데이터베이스 없이 순수 Kotlin으로 백엔드 핵심 로직을 완성합니다.

- 37.1 프로젝트 요구사항
- 37.2 프로젝트 구조 만들기
- 37.3 회원 기능 구현하기
- 37.4 상품 기능 구현하기
- 37.5 주문 기능 구현하기
- 37.6 Collection을 활용한 주문 데이터 처리
- 37.7 오류와 예외 처리
- 37.8 DTO 변환
- 37.9 테스트 작성
- 37.10 전체 코드 리팩터링

---

# 13부. 더 나은 Kotlin 코드를 위해

### 38장. Java스럽게 작성한 Kotlin 개선하기

- 38.1 Getter와 Setter를 그대로 옮기지 않기
- 38.2 불필요한 `var` 줄이기
- 38.3 불필요한 `!!` 없애기
- 38.4 반복문을 Collection 함수로 바꾸기
- 38.5 Utility Class를 Extension Function으로 바꾸기
- 38.6 과도한 Scope Function 줄이기
- 38.7 불필요한 상속 제거하기
- 38.8 Null과 Exception을 명확하게 표현하기

### 39장. 백엔드 개발자가 기억해야 할 Kotlin

- 39.1 불변성을 기본값으로 사용한다
- 39.2 Null을 타입의 일부로 생각한다
- 39.3 데이터와 상태를 명확하게 모델링한다
- 39.4 Interface로 경계를 만든다
- 39.5 Collection 함수를 활용한다
- 39.6 Kotlin 문법을 과도하게 사용하지 않는다
- 39.7 Java 생태계와의 연결을 이해한다
- 39.8 테스트하기 쉬운 객체를 만든다

---

# 부록

### 부록 A. Kotlin 문법 빠른 참조

- `val` / `var`
- `if` / `when`
- Nullable 연산자
- Collection 함수
- Scope Function
- 클래스 관련 키워드

### 부록 B. 자주 사용하는 Collection 함수

- 조회
- 필터
- 변환
- 그룹
- 정렬
- 집계

### 부록 C. Scope Function 선택표

| 함수      | 객체 접근  | 반환값       | 주요 용도        |
| ------- | ------ | --------- | ------------ |
| `let`   | `it`   | Lambda 결과 | 변환, Nullable |
| `run`   | `this` | Lambda 결과 | 객체 기반 계산     |
| `with`  | `this` | Lambda 결과 | 여러 멤버 접근     |
| `apply` | `this` | 객체        | 객체 설정        |
| `also`  | `it`   | 객체        | 부가 작업        |

### 부록 D. Java 개발자를 위한 Kotlin 비교표

- Java POJO → Kotlin Data Class
- `static` → Companion Object
- `Optional` → Nullable
- Stream → Collection 함수
- 익명 클래스 → Lambda / Object Expression
- Checked Exception 차이
