# AWS로 이해하는 클라우드 컴퓨팅 기초

온프레미스에서 출발해 AWS 위에서  
실전 마이크로서비스를 운영할 수 있는 수준까지  
초보자의 호흡으로 차근차근 쌓아 올리는 책.

---

## 이 책의 척추 — 우리가 만들어 갈 구조

이 책의 모든 장은 아래 구조의 어느 한 점에 속한다.

```text
사용자
  ↓ DNS (Route 53)
CloudFront
  ↓
API Gateway
  ↓
ALB
  ↓
ECS (Fargate) — 마이크로서비스들
  ↓
RDS · DynamoDB · ElastiCache
```

각 장은 시작에서 "이 장이 척추의 어디에 해당하는가" 를 짚고 들어간다.

---

## 매 장의 골격

1. 이 장에서 말하고자 하는 것
2. 개념 본문 — 단계별 설명
3. 우리 서비스에서는 어디에 쓰이나 — 척추 그림에 점 찍기
4. 직접 확인해보기 — CLI / 콘솔
5. 코드로는 이렇게 생겼다 — Terraform 스니펫
6. 이렇게 쓰면 망한다 — 안티패턴
7. 한 줄로 정리
8. 이 장의 핵심 정리

---

## 목차

### 1부. 클라우드란 무엇인가

- [x] 1장. 온프레미스와 클라우드의 이해
- [x] 2장. 클라우드는 어떻게 서버를 제공하는가
- [x] 3장. 클라우드 서비스 모델의 이해
- [x] 4장. 클라우드 책임 공유 모델의 이해
- [x] 5장. 클라우드의 과금 구조 이해하기
- [x] 6장. 확장성과 가용성의 이해
- [x] 7장. 리전과 가용 영역의 이해

### 2부. 서버와 네트워크의 기초

- [x] 8장. 서버 아키텍처의 기초 이해
- [x] 9장. 상태와 무상태의 이해
- [x] 10장. 서버와 네트워크의 연결 이해
- [x] 11장. 트래픽과 접근 제어의 이해

### 3부. EC2 — 첫 서버 띄우기

- [x] 12장. EC2란 무엇인가
- [x] 13장. 인스턴스 타입 이해하기
- [x] 14장. EC2 스토리지 구성 이해하기
- [x] 15장. AMI와 이미지 기반 배포
- [x] 16장. EC2 접속과 권한 — 키 페어 · Session Manager · IAM Role
- [x] 17장. EBS 스냅샷과 백업 전략
- [x] 18장. EC2 요금 모델 — On-Demand · Spot · RI · Savings Plans

### 4부. VPC — 네트워크를 직접 설계하기

- [x] 19장. 서버는 어디에 연결되는가
- [x] 20장. IP 주소 범위와 CIDR 이해하기
- [x] 21장. 서브넷 (Subnet)
- [x] 22장. 퍼블릭 서브넷과 프라이빗 서브넷
- [x] 23장. 인터넷 게이트웨이 (Internet Gateway)
- [x] 24장. 라우팅 테이블 (Route Table)
- [x] 25장. NAT Gateway
- [x] 26장. 보안 그룹 (Security Group)
- [x] 27장. NACL (Network ACL)
- [x] 28장. 운영 환경을 위한 VPC 디자인

### 5부. 도메인과 인증서 — 사용자가 들어오는 길

- [x] 29장. 도메인이 서버까지 도달하기까지 — DNS의 이해
- [x] 30장. Route 53 — AWS의 DNS
- [x] 31장. HTTPS는 어디에서 끝나는가 — TLS 종료의 이해
- [x] 32장. ACM — 인증서를 어디에 다는가

### 6부. 트래픽 분산과 자동 확장

- [x] 33장. Elastic Load Balancer 지형 — ALB · NLB · GWLB
- [x] 34장. ALB의 라우팅 — 리스너 · 규칙 · 타깃 그룹
- [x] 35장. 경로 · 호스트 기반 라우팅으로 서비스 쪼개기
- [x] 36장. NLB는 언제 쓰는가
- [x] 37장. Auto Scaling Group과 스케일링 정책

### 7부. 엣지 계층 — CDN과 보안

- [x] 38장. CloudFront — 사용자에 가까운 곳에서 응답하기
- [x] 39장. CloudFront의 Origin · 캐시 · OAC
- [x] 40장. WAF — 엣지에서 걸러내는 보안

### 8부. 컨테이너로 옮겨 가기

- [x] 41장. 왜 컨테이너인가 — VM과의 차이
- [x] 42장. 도커 기초 — 이미지 · 컨테이너 · 레이어
- [x] 43장. ECR — 컨테이너 이미지 저장소
- [x] 44장. ECS의 구조 — Cluster · Task · Service
- [x] 45장. Task Definition 깊게 보기
- [x] 46장. EC2 vs Fargate — 어느 쪽에서 돌릴까
- [x] 47장. ECS Service와 ALB 연결하기
- [x] 48장. ECS Service Discovery — Cloud Map
- [x] 49장. ECS 배포 전략 — Rolling · Blue-Green
- [x] 50장. EKS는 언제 고려하는가 — 개념 한 줄 이해
- [x] 51장. 통합 흐름 — 우리 서비스를 ECS 위로 올려보기

### 9부. API 진입점

- [x] 52장. API Gateway — REST API vs HTTP API
- [x] 53장. API Gateway의 인증 — IAM · Cognito · Lambda Authorizer
- [x] 54장. CloudFront → API Gateway → ALB 의 역할 분담

### 10부. 스토리지

- [x] 55장. 블록 · 파일 · 객체 스토리지의 차이
- [x] 56장. S3 — 객체 스토리지의 기본
- [x] 57장. S3 스토리지 클래스와 수명 주기 — 비용 설계 관점
- [x] 58장. 사전 서명 URL과 권한 모델
- [x] 59장. CloudFront + S3로 정적 콘텐츠 서비스하기
- [x] 60장. EFS · FSx — 공유 파일 시스템

### 11부. 데이터 계층 — 서비스별로 나누고 운영하기

- [x] 61장. AWS 데이터베이스 지형 한눈에 보기
- [x] 62장. RDS — 관리형 관계형 DB의 구조
- [x] 63장. Multi-AZ — 장애 대비의 기본
- [x] 64장. Read Replica — 읽기를 어떻게 늘릴까
- [x] 65장. Aurora — 클라우드 네이티브 RDS
- [x] 66장. DynamoDB의 사고방식 — Key-Value · 파티션 키
- [x] 67장. DynamoDB 인덱스 — LSI · GSI
- [x] 68장. DynamoDB의 용량 모델과 비용
- [x] 69장. ElastiCache (Redis) — 캐시 계층의 이해
- [x] 70장. Database per Service — 서비스별 DB 분리 패턴
- [x] 71장. 백업 · 복구 · 재해 복구 전략
- [x] 72장. 통합 흐름 — 데이터 계층을 우리 서비스에 끼우기

### 12부. 서비스 간 통신

- [x] 73장. 동기 vs 비동기 — 무엇을 어디에 쓰는가
- [x] 74장. SQS — 큐로 결합도 낮추기
- [x] 75장. SNS — 팬아웃 패턴
- [x] 76장. EventBridge — 이벤트 기반 아키텍처
- [x] 77장. Saga 패턴 맛보기 — 분산 트랜잭션의 현실

### 13부. 권한 · 시크릿 · 암호화

- [x] 78장. IAM 기본 — User · Group · Role · Policy
- [x] 79장. IAM Role 활용 — EC2 · ECS Task Role · Execution Role
- [x] 80장. 최소 권한 설계
- [x] 81장. KMS — 데이터 암호화
- [x] 82장. Secrets Manager와 Parameter Store

### 14부. 관측성 — MSA의 절반

- [x] 83장. CloudWatch 메트릭과 알람
- [x] 84장. CloudWatch Logs와 Logs Insights
- [x] 85장. 컨테이너 로깅 — FireLens · awslogs 드라이버
- [x] 86장. X-Ray — 분산 트레이싱
- [x] 87장. CloudTrail — 변경 추적

### 15부. 여러 VPC와 외부 연결

- [x] 88장. VPC Endpoint — VPC 안에서 외부 서비스 접근
- [x] 89장. VPC Peering
- [x] 90장. Transit Gateway
- [x] 91장. AWS Site-to-Site VPN
- [x] 92장. AWS Direct Connect

### 16부. 자동화와 배포

- [x] 93장. IaC — CloudFormation · Terraform 개요
- [x] 94장. 이미지 빌드 자동화 — CodeBuild · GitHub Actions
- [x] 95장. 배포 자동화 — CodePipeline · CodeDeploy
- [x] 96장. 배포 전략 — Blue-Green · Canary

### 17부. 실전 종합 — 풀 스택 한 바퀴

- [x] 97장. 도메인 설계 — 3개 서비스로 쪼개기
- [x] 98장. CF → APIGW → ALB → ECS → RDS/DynamoDB 통합 흐름
- [x] 99장. 운영 체크리스트 — 보안 · 비용 · 관측성
- [x] 100장. 다음 단계 — 기초 이후 어디로 갈 것인가
