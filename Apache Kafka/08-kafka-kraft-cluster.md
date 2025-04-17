# 8장. Kafka KRaft 클러스터 실습

Kafka 4.0부터는 Zookeeper 없이 Kafka 클러스터를 구성할 수 있습니다.  
이 장에서는 Docker Compose를 이용해 Kafka KRaft 클러스터를 손쉽게 구성하고,  
토픽 생성부터 메시지 송수신까지 간단한 실습을 진행합니다.

## 8.1 Docker Compose 설치 (Amazon Linux 2023 기준)

Kafka 클러스터 구성을 쉽게 하기 위해 Docker Compose를 사용합니다.

### 1. Compose 바이너리 설치

```bash
mkdir -p ~/.docker/cli-plugins

curl -sSL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o ~/.docker/cli-plugins/docker-compose

chmod +x ~/.docker/cli-plugins/docker-compose
```

### 2. 정상 설치 확인

```bash
docker compose version
```

## 8.2 클러스터 구성 파일 다운로드

Kafka 클러스터 구성을 위한 `docker-compose.yml` 파일을 다운로드합니다.

```bash
mkdir docker-kafka-cluster
cd docker-kafka-cluster

wget -O docker-compose.yml https://raw.githubusercontent.com/i31pc17/bitbook/main/Apache%20Kafka/docker-compose.yml
```

이 구성은 Kafka 브로커 + 컨트롤러 역할을 동시에 수행하는 3노드 KRaft 클러스터 예제이며,  
**직접 제작된 커스텀 구성 파일입니다.**

> 각 사용자의 환경에 따라 브로커 수, 포트, 볼륨 경로, 환경 변수 등을 자유롭게 수정해서 사용하면 됩니다.

## 8.3 Kafka 클러스터 실행

```bash
docker compose up -d
```

브로커와 컨트롤러가 모두 자동으로 실행됩니다.

## 8.4 토픽 생성 및 메시지 송수신 실습

Kafka 컨테이너 내부로 진입해 명령어를 실행합니다.

```bash
docker exec --workdir /opt/kafka/bin/ -it broker-controller-1 sh
```

### 1. 토픽 생성

```bash
./kafka-topics.sh --bootstrap-server broker-controller-1:19092,broker-controller-2:19092,broker-controller-3:19092 --create --topic test-topic
```

### 2. 메시지 전송 (Producer)

```bash
./kafka-console-producer.sh --bootstrap-server broker-controller-1:19092,broker-controller-2:19092,broker-controller-3:19092 --topic test-topic
```

입력창이 뜨면 메시지를 입력하고 Enter로 전송합니다.  
예:
```
hello kafka
this is a test
```

`Ctrl + C`로 종료합니다.

### 3. 메시지 수신 (Consumer)

```bash
./kafka-console-consumer.sh --bootstrap-server broker-controller-1:19092,broker-controller-2:19092,broker-controller-3:19092 --topic test-topic --from-beginning
```

위에서 보낸 메시지가 출력됩니다.  
`Ctrl + C`로 종료합니다.

### 4. 컨테이너 셸에서 나가기

```bash
exit
```

## 8.5 클러스터 종료 및 정리

```bash
docker compose down
```

## 마무리

이제 Kafka KRaft 클러스터를 직접 실행해보고,  
실제로 메시지를 주고받으며 Kafka의 기본 흐름을 체험해볼 수 있습니다.  
다음 장에서는 Kafka 운영 시 고려해야 할 성능 최적화 및 사이징 전략을 다룹니다.