# 14장. Kafka 가상 메모리 튜닝

Kafka는 운영체제의 **페이지 캐시(Page Cache)** 를 적극 활용해 디스크 I/O 성능을 높이는 구조입니다. 따라서 **가상 메모리와 스와핑(Swapping) 설정**은 Kafka 성능에 매우 큰 영향을 미칩니다.

---

## 14.1 스와핑(Swapping)이란?

운영체제에서 메모리가 부족하면, 자주 사용하지 않는 데이터를 디스크의 **스왑 공간(swap area)** 으로 옮겨 RAM 공간을 확보합니다. 이 과정을 **스와핑(swapping)** 이라고 합니다.

> 마치 방이 좁아서 자주 안 쓰는 짐을 창고(디스크)로 보내는 것과 비슷한 개념입니다.

---

## 14.2 Kafka에서 스와핑이 문제가 되는 이유

Kafka는 실시간 메시지 처리 시스템입니다. 빠른 응답과 낮은 지연 시간이 핵심인데, 스와핑이 발생하면 다음과 같은 문제를 일으킬 수 있습니다:

| 문제 상황 | 영향 |
|-----------|------|
| 페이지 캐시가 줄어듦 | 디스크 쓰기/읽기 성능 저하, 처리량 감소 |
| Kafka 스레드가 스왑됨 | 메시지 처리 지연, 응답 시간 불안정 |
| 스와핑이 반복됨 | 전체 시스템 성능 급락 (Thrashing 현상 발생) |

---

## 14.3 `vm.swappiness`란?

`vm.swappiness`는 Linux 커널 파라미터로, 운영체제가 메모리가 부족할 때 **스왑 공간을 얼마나 적극적으로 사용할지**를 결정합니다.

값이 낮을수록 실제 RAM을 더 많이 활용하고, 스왑 사용을 줄입니다.

### 설정 방법 (임시 적용)
```bash
sudo sysctl -w vm.swappiness=1
```

### 설정 방법 (영구 적용)
```bash
echo "vm.swappiness = 1" | sudo tee -a /etc/sysctl.conf
```

---

## 14.4 설정값의 의미와 Kafka 권장값

| 설정값 | 의미 |
|--------|------|
| 0      | 절대 스왑 사용 안 함. RAM 부족 시 OOM 위험 높음 |
| **1**  | 거의 스왑을 사용하지 않음. Kafka 권장 설정 |
| 60     | 기본값. 일반적인 Linux 서버 운영 환경 |
| 100    | 가능한 많이 스왑을 사용함 |

### Kafka에서는?

- `vm.swappiness = 0`은 OOM(Out of Memory) 가능성이 높아 위험할 수 있음
- `vm.swappiness = 1`은 스왑을 거의 사용하지 않으면서, 시스템이 완전히 RAM을 소진했을 때만 최소한으로 스왑을 활용함

✅ 따라서 Kafka 운영 환경에서는 다음과 같은 설정이 권장됩니다:

```text
vm.swappiness = 1
```

> 안정적인 처리 속도와 디스크 I/O 성능 유지를 위해 최소 스왑 정책이 가장 바람직합니다.
