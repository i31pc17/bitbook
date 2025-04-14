# 6장. Kafka 설치 및 기본 사용법

> 이 장에서는 Kafka를 직접 설치하고, 간단한 메시지를 주고받는 실습을 해봅니다.  
> 초보자도 따라할 수 있도록 **AWS EC2(Amazon Linux 2023)** 환경에서 Docker 기반 Kafka를 실행해봅니다.

---

## 6.1 Docker 설치 (Amazon Linux 2023 기준)

Kafka는 JVM 기반으로 동작하는 복잡한 구조이기 때문에, Docker를 사용하면 훨씬 쉽게 실행할 수 있어요.  
우선 EC2에 Docker를 설치하고 간단한 컨테이너가 잘 실행되는지 확인해보겠습니다.

### 1단계: 패키지 업데이트

```bash
sudo dnf update -y
```

### 2단계: Docker 설치

```bash
sudo dnf install -y docker
docker --version
```

### 3단계: Docker 데몬 활성화 및 시작

```bash
sudo systemctl enable --now docker
```

### 4단계: 테스트 – Hello World 실행

```bash
sudo docker run hello-world
```

> 위 명령을 실행하면 아래와 같은 출력이 나오면 성공입니다:

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

> 이 과정은 "Docker가 정상 작동하는지"를 확인하는 간단한 테스트예요.

---

### 5단계: 현재 사용자에 docker 권한 부여 (옵션)

매번 `sudo docker`라고 입력하는 게 불편하다면, 현재 사용자에게 Docker 그룹 권한을 부여하세요.

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

> **왜 필요한가요?**  
> → 이 작업을 하면 앞으로는 `sudo` 없이도 `docker` 명령어를 실행할 수 있어요.  
> 단, 이 명령 후에는 **터미널을 완전히 종료했다가 다시 로그인해야 적용됩니다.**

```bash
docker run hello-world  # 이제 sudo 없이 실행!
```

---

## 6.2 Kafka 브로커 실행

이제 Kafka를 실행해봅시다.  
[Kafka 공식 Docker Hub 페이지](https://hub.docker.com/r/apache/kafka)에 나와 있는 예제와 같이 간단하게 실행합니다.

### Kafka 이미지 다운로드

```bash
docker pull apache/kafka:4.0.0
```

### Kafka 브로커 컨테이너 실행

```bash
docker run -d --name broker apache/kafka:4.0.0
```

> 컨테이너가 실행되면 Kafka 브로커가 자동으로 시작됩니다.

---

## 6.3 토픽 생성 및 메시지 송수신 테스트 (Producer → Consumer 순)

Kafka에서는 다음과 같은 순서로 메시지를 주고받습니다:

- **토픽(topic)** 을 만든 후  
- **Producer가 메시지를 보내고**,  
- **Consumer가 메시지를 받아 읽는** 구조입니다.

---

### 1. Kafka 명령어를 실행하기 위해 컨테이너 내부로 진입

```bash
docker exec --workdir /opt/kafka/bin/ -it broker sh
```

---

### 2. 토픽 생성

```bash
./kafka-topics.sh --bootstrap-server localhost:9092 --create --topic test-topic
```

> 출력 예:
```
Created topic test-topic.
```

---

### 3. 메시지 전송 (Producer 먼저 실행)

```bash
./kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test-topic
```

> 아래처럼 커서가 깜빡이며 입력 대기 상태가 됩니다.  
> 메시지를 몇 줄 입력하고 **Enter** 를 누르면 전송됩니다:

```
hello kafka
this is my first message
```

> 다 입력했다면 `Ctrl + C` 를 눌러 종료하세요.  
> 이제 메시지가 Kafka에 저장된 상태입니다.

---

### 4. 메시지 수신 (Consumer 실행)

```bash
./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
```

> 이제 위에서 보낸 메시지가 출력됩니다:

```
hello kafka
this is my first message
```

> 👉 **Consumer 실행 상태에서는 메시지를 계속 수신 대기**하게 됩니다.  
> 메시지를 다 확인했으면 **`Ctrl + C`** 를 눌러 종료하세요.

---

## 6.4 테스트 종료 및 정리

### 컨테이너에서 나가기

> Kafka 명령어를 실행했던 컨테이너 내부 셸에서 나가려면 아래 명령을 입력하세요:

```bash
exit
```

> 이 명령을 입력하면 **EC2 터미널(호스트)** 로 돌아옵니다.

---

### Kafka 컨테이너 삭제

```bash
docker rm -f broker
```

> Kafka 브로커를 완전히 종료하고 삭제합니다.

---

## 마무리

이 장에서는 Kafka를 Docker로 설치하고,  
Producer → 메시지 전송 → Consumer → 메시지 수신의 흐름을 실제로 체험해봤습니다.

초보자도 터미널 하나만으로 순서대로 따라 할 수 있게 구성했으며,  
이제 Kafka가 어떤 구조로 동작하는지 기본 감을 잡으셨을 거예요.

다음 장에서는 **Kafka를 실제 운영 환경에서 어떻게 설계하고 사이징할지**를 다룹니다.