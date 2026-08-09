# 부록 B. 자주 사용하는 Collection 함수

백엔드에서 특히 자주 쓰는  
컬렉션 함수를 용도별로 모았습니다.  
(자세한 설명은 13장 참고)

예제에 쓸 데이터를 먼저 가정합니다.

```kotlin
data class User(val id: Long, val name: String, val age: Int)

val users = listOf(
    User(1, "홍길동", 20),
    User(2, "김철수", 35),
    User(3, "이영희", 28)
)
```

---

## 조회

```kotlin
users.first()                     // 첫 번째
users.firstOrNull()               // 첫 번째 (없으면 null)
users.find { it.age > 30 }        // 조건에 맞는 첫 번째
users.getOrNull(10)               // 인덱스 접근 (없으면 null)
```

> "없을 수 있는" 조회는  
> `~OrNull`을 써서 안전하게.

---

## 필터

```kotlin
users.filter { it.age >= 30 }         // 조건에 맞는 것만
users.filterNot { it.age >= 30 }      // 조건에 안 맞는 것만
users.filterNotNull()                 // null 제거
names.mapNotNull { it.toIntOrNull() } // 변환하며 null 제거
```

---

## 변환

```kotlin
users.map { it.name }                 // 각각 변환
users.map { it.age * 2 }
users.flatMap { it.orders }           // 중첩 목록 펼치기
users.mapNotNull { it.emailOrNull() } // 변환 + null 제거
```

---

## 그룹

```kotlin
users.groupBy { it.age / 10 }         // 나이대별 그룹
users.associateBy { it.id }           // id를 키로 하는 Map
users.associate { it.id to it.name }  // 키-값 쌍으로 Map
users.partition { it.age >= 30 }      // 조건으로 두 그룹 분리
```

`associateBy`는 특히 자주 씁니다.

```kotlin
val userMap: Map<Long, User> = users.associateBy { it.id }
val user = userMap[1]   // id로 빠르게 조회
```

---

## 정렬

```kotlin
users.sortedBy { it.age }               // 오름차순
users.sortedByDescending { it.age }     // 내림차순
users.sortedWith(compareBy({ it.age }, { it.name }))  // 다중 기준
users.distinct()                        // 중복 제거
users.distinctBy { it.name }            // 특정 기준 중복 제거
```

---

## 집계

```kotlin
users.count()                       // 개수
users.count { it.age >= 30 }        // 조건 개수
users.sumOf { it.age }              // 합계
users.maxByOrNull { it.age }        // 최댓값 요소
users.minByOrNull { it.age }        // 최솟값 요소
users.map { it.age }.average()      // 평균

users.any { it.age >= 30 }          // 하나라도 참인가
users.all { it.age >= 20 }          // 모두 참인가
users.none { it.age < 0 }           // 하나도 없는가
```

누적 계산이 필요하면 `fold`/`reduce`를 씁니다.

```kotlin
val total = users.fold(0) { acc, u -> acc + u.age }
```

---

## 자주 쓰는 조합

```kotlin
// 30세 이상 회원의 이름만
users.filter { it.age >= 30 }.map { it.name }

// 나이대별 인원 수
users.groupBy { it.age / 10 }.mapValues { it.value.size }

// 조건에 맞는 총합
users.filter { it.age >= 20 }.sumOf { it.age }
```

이 조합 패턴이  
백엔드 데이터 가공의 대부분을 차지합니다.
