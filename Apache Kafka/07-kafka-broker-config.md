# 7장. Kafka 브로커 설정 이해하기 (KRaft 기반)

Kafka는 과거 Zookeeper 기반으로 동작했지만,  
Kafka 4.0부터는 Zookeeper 없이 운영 가능한 KRaft 모드가 기본입니다.  
이 장에서는 Kafka 브로커 설정 파일(server.properties)을 기준으로,  
KRaft 환경에서 반드시 필요한 설정 항목과 그 의미를 설명합니다.  
특히 3대 브로커로 구성된 Kafka 클러스터를 기준으로 실무에 가까운 설정 예제를 제공합니다.

## 7.1 설정 파일 위치

Kafka Docker 컨테이너를 기준으로 설정 파일은 다음 위치에 존재하며,  
브로커가 어떤 역할을 하느냐에 따라 **다른 설정 파일을 사용할 수 있습니다.**

| 파일 경로 | 사용 조건 | 설명 |
|-----------|-----------|------|
| `/opt/kafka/config/server.properties` | 브로커 + 컨트롤러 | 브로커와 컨트롤러 역할을 동시에 수행하는 서버에서 사용 |
| `/opt/kafka/config/broker.properties` | 브로커 전용 | 브로커 역할만 수행하는 서버에서 사용 |
| `/opt/kafka/config/controller.properties` | 컨트롤러 전용 | 컨트롤러 역할만 수행하는 서버에서 사용 |

Docker 공식 이미지를 사용할 경우 기본적으로 `server.properties`를 사용하며,  
대부분의 단일 노드 또는 소규모 구성에서는 브로커와 컨트롤러를 동시에 구성하기 때문에 이 파일이 사용됩니다.

> 주의: 각 설정 파일에는 `process.roles`, `node.id`, `controller.quorum.voters` 등  
> KRaft에 필요한 필수 항목이 반드시 포함되어 있어야 합니다.

## 7.2 브로커 식별자

Kafka 클러스터에서 각 브로커를 구분하기 위해 고유한 ID를 부여해야 합니다.  
KRaft 모드에서는 `node.id` 항목으로 브로커 ID를 설정합니다.  
값은 1 이상의 정수이며, 클러스터 내에서 중복되지 않아야 합니다.

```properties
node.id=1
```

## 7.3 브로커 역할 설정

Kafka는 하나의 프로세스에서 브로커와 컨트롤러 역할을 동시에 수행할 수 있습니다.  
컨트롤러는 클러스터 메타데이터와 리더 선출을 담당합니다.

```properties
process.roles=broker,controller
```

## 7.4 네트워크 설정

Kafka는 클라이언트 또는 다른 브로커와 통신하기 위해 네트워크 포트를 설정합니다.  
브로커 역할과 컨트롤러 역할은 별도의 포트를 사용하며,  
클라이언트가 접근할 수 있도록 외부 주소(advertised.listeners)를 반드시 지정해야 합니다.

```properties
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://kafka1:9092
```

- `PLAINTEXT`는 Kafka 클라이언트와 통신할 포트
- `CONTROLLER`는 브로커 간 메타데이터 통신용
- `advertised.listeners`는 도커 환경에서는 외부 접근을 위해 필수

## 7.5 컨트롤러 클러스터 설정

KRaft 모드에서는 Zookeeper 대신 브로커 간 직접 통신을 통해 컨트롤러가 선출됩니다.  
이를 위해 아래 세 가지 설정이 반드시 필요합니다.

```properties
controller.listener.names=CONTROLLER

controller.quorum.voters=1@kafka1:9093,2@kafka2:9094,3@kafka3:9095

controller.quorum.bootstrap.servers=kafka1:9093,kafka2:9094,kafka3:9095
```

- `controller.listener.names`는 컨트롤러 통신용 리스너 이름
- `controller.quorum.voters`는 컨트롤러 노드 ID와 주소 목록
- `controller.quorum.bootstrap.servers`는 컨트롤러 간 초기 통신에 사용될 주소 목록

> 주의: 이 세 항목은 모두 필수이며, 누락 시 Kafka는 실행되지 않습니다.

## 7.6 로그 저장 및 메시지 보존 설정

Kafka는 수신한 메시지를 디스크에 로그 형태로 저장합니다.  
로그 파일의 위치, 보존 기간, 파일 크기 등을 다음 항목으로 설정할 수 있습니다.

```properties
log.dirs=/var/lib/kafka/data1
log.retention.hours=168
log.retention.bytes=-1
log.segment.bytes=1073741824
```

- `log.dirs`: 메시지를 저장할 디렉토리
- `log.retention.hours`: 메시지를 최대 보관할 시간 (기본 168시간 = 7일)
- `log.retention.bytes`: 보존할 전체 로그의 최대 크기 (기본 -1은 무제한). 이 값을 넘으면 오래된 로그부터 삭제됩니다.
- `log.segment.bytes`: 로그를 나눠 저장하는 세그먼트 파일의 최대 크기 (기본 1GB)

> `log.retention.bytes`와 `log.retention.hours`는 **보존 기준**이며,  
> 둘 중 하나라도 초과하면 Kafka는 오래된 로그부터 삭제합니다.  
> `log.segment.bytes`는 삭제와는 관계 없이, **파일 분할 구조에만 영향을 미칩니다.**

## 7.7 토픽 기본 설정

Kafka는 토픽 생성 시 기본값으로 적용할 파티션 수와 복제 수를 설정할 수 있습니다.

```properties
num.partitions=1
default.replication.factor=3
```

> 복제 수는 클러스터 브로커 수보다 크면 오류가 발생하므로, 브로커 수 이하로 설정해야 합니다.

## 7.8 기타 유용한 설정

```properties
log.cleanup.policy=delete
delete.topic.enable=true
auto.create.topics.enable=true
message.max.bytes=1048576
min.insync.replicas=1
```

- `log.cleanup.policy`: 메시지를 삭제할지(`delete`) 압축할지(`compact`) 선택
- `delete.topic.enable`: 토픽을 삭제할 수 있는지 여부
- `auto.create.topics.enable`: 존재하지 않는 토픽으로 메시지를 전송했을 때 자동 생성 여부
- `message.max.bytes`: 프로듀서가 전송할 수 있는 메시지의 최대 크기 (기본값: 1MB). 큰 메시지를 보내려면 이 값을 조정해야 합니다.
- `min.insync.replicas`: 복제본 중 최소 몇 개가 살아 있어야 메시지를 쓸 수 있는지 설정합니다. `acks=all`일 경우 이 숫자보다 적으면 쓰기가 실패합니다.

운영 환경에서는 `auto.create.topics.enable=false`로 설정하는 것이 일반적입니다.

## 7.9 브로커 3대 구성 예시

아래는 Kafka를 3대 브로커로 구성할 때의 설정 예시입니다.  
모든 브로커는 컨트롤러 역할도 함께 수행합니다.

| 브로커 | node.id | CONTROLLER 포트 | 데이터 포트 | Hostname |
|--------|---------|------------------|-------------|----------|
| kafka1 | 1       | 9093             | 9092        | kafka1   |
| kafka2 | 2       | 9094             | 9092        | kafka2   |
| kafka3 | 3       | 9095             | 9092        | kafka3   |

> 이 Hostname 값은 Docker 컨테이너 이름이거나, `/etc/hosts` 또는 DNS에 등록된 이름이어야 하며,  
> 실제 환경에서는 내부 IP나 EC2 프라이빗 DNS로 대체해야 합니다.

### broker1 설정 예시

```properties
node.id=1
process.roles=broker,controller

listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://kafka1:9092

controller.listener.names=CONTROLLER
controller.quorum.voters=1@kafka1:9093,2@kafka2:9094,3@kafka3:9095
controller.quorum.bootstrap.servers=kafka1:9093,kafka2:9094,kafka3:9095

log.dirs=/var/lib/kafka/data1
log.retention.hours=168
num.partitions=1
default.replication.factor=3
```

broker2, broker3는 node.id, CONTROLLER 포트, log.dirs, advertised.listeners 부분만 각각 다르게 설정하면 됩니다.

## 7.10 설정 적용 시 주의사항

- server.properties를 수정한 후에는 Kafka 브로커를 반드시 재시작해야 적용됩니다.
- controller 관련 항목은 KRaft 클러스터 기동 시 필수입니다.
- 모든 브로커는 동일한 `controller.quorum.voters`와 `bootstrap.servers` 값을 가지고 있어야 클러스터로 인식됩니다.

## 마무리

이 장에서는 Kafka를 KRaft 모드로 구성할 때 필수적으로 알아야 할 설정 항목을 정리하고,  
3개의 브로커로 Kafka 클러스터를 구성하는 실전 예시도 함께 확인했습니다.  
다음 장에서는 이 설정을 기반으로 Kafka KRaft 클러스터를 실행하고 테스트하는 실습을 진행합니다.