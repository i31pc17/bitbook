## 📘 POSIX 개념서

---

### 1장. POSIX란 무엇인가?

#### 1.1 POSIX의 정의

**POSIX (Portable Operating System Interface)** 는
**유닉스 계열 운영체제들이 공통으로 따라야 하는 인터페이스 규격**입니다.
주로 시스템 호출, 셸 명령어, 파일 시스템 구조 등을 정의하며,
운영체제 간의 **호환성**, **이식성**, **일관성**을 보장하는 것이 목적입니다.

#### 1.2 왜 POSIX가 필요한가?

운영체제마다 내부 구조는 다르지만,
프로그래머는 동일한 방식으로 파일을 읽고, 프로세스를 생성하고, 데이터를 처리할 수 있어야 합니다.
→ POSIX는 이처럼 **공통 인터페이스의 최소한의 규칙**을 정의합니다.

#### 1.3 누가 만들었는가?

* 미국 전기전자학회(IEEE)에서 만든 표준입니다.
* 공식 명칭: **IEEE 1003 시리즈**
* ISO 국제 표준으로도 등록됨: ISO/IEC 9945

#### 1.4 POSIX를 따르는 운영체제

| 운영체제                | 설명                    |
| ------------------- | --------------------- |
| Linux               | POSIX 호환 (공식 인증은 아님)  |
| macOS               | POSIX 공식 인증 (UNIX 03) |
| FreeBSD, NetBSD     | 대부분 POSIX 호환          |
| AIX, HP-UX, Solaris | POSIX 기반 상용 유닉스 OS    |

---

### # 2장. POSIX 핵심 기능 요약

#### 2.1 파일 및 디렉터리 작업

| 함수                          | 설명       |
| --------------------------- | -------- |
| `open(path, flags)`         | 파일 열기    |
| `read(fd, buffer, size)`    | 파일 읽기    |
| `write(fd, buffer, size)`   | 파일 쓰기    |
| `close(fd)`                 | 파일 닫기    |
| `lseek(fd, offset, whence)` | 파일 위치 이동 |
| `stat(path)`                | 파일 정보 조회 |
| `unlink(path)`              | 파일 삭제    |
| `mkdir(path, mode)`         | 디렉터리 생성  |
| `rmdir(path)`               | 디렉터리 삭제  |
| `chmod(path, mode)`         | 권한 변경    |
| `chown(path, uid, gid)`     | 소유자 변경   |

---

#### 2.2 프로세스 제어

| 함수                     | 설명                  |
| ---------------------- | ------------------- |
| `fork()`               | 현재 프로세스를 복제 (자식 생성) |
| `exec*()`              | 새 프로그램 실행           |
| `wait()` / `waitpid()` | 자식 프로세스 종료 대기       |
| `getpid()`             | 현재 PID 조회           |
| `getppid()`            | 부모 PID 조회           |
| `kill(pid, sig)`       | 시그널 전송              |

---

#### 2.3 스레드 (POSIX Threads, pthread)

| 함수                  | 설명            |
| ------------------- | ------------- |
| `pthread_create()`  | 새 스레드 생성      |
| `pthread_join()`    | 스레드 종료 대기     |
| `pthread_mutex_*()` | 뮤텍스 잠금/해제     |
| `pthread_cond_*()`  | 조건 변수로 대기/깨우기 |

---

#### 2.4 시그널 처리

| 함수                        | 설명              |
| ------------------------- | --------------- |
| `signal(signum, handler)` | 시그널 핸들러 설정      |
| `sigaction()`             | 시그널 제어 고급 설정    |
| `raise(signum)`           | 현재 프로세스에 시그널 발생 |
| `sigprocmask()`           | 시그널 블록/해제       |

---

#### 2.5 표준 입출력 및 터미널 제어

| 함수                           | 설명             |
| ---------------------------- | -------------- |
| `isatty(fd)`                 | 터미널 여부 확인      |
| `tcgetattr()`, `tcsetattr()` | 터미널 속성 가져오기/설정 |

---

#### 2.6 시간 및 타이머

| 함수                       | 설명           |
| ------------------------ | ------------ |
| `time()`                 | 현재 시간 (초 단위) |
| `gettimeofday()`         | 마이크로초 시간     |
| `sleep()`, `nanosleep()` | 정지/대기        |
| `clock_gettime()`        | 정밀 시간 측정     |

---

#### 2.7 환경 변수 및 프로세스 환경

| 함수                    | 설명       |
| --------------------- | -------- |
| `getenv(name)`        | 환경 변수 읽기 |
| `setenv(name, value)` | 환경 변수 설정 |
| `unsetenv(name)`      | 환경 변수 제거 |

---

### ✨ 부록. POSIX 유틸리티 예시

| 명령어                             | 설명                |
| ------------------------------- | ----------------- |
| `sh`                            | POSIX 셸 (기본 셸 명세) |
| `ls`, `cat`, `cp`, `mv`, `echo` | 표준 명령어들           |
| `find`, `grep`, `awk`, `sed`    | 텍스트 처리 필수 도구들     |

---

### POSIX 표준 명령어 줄임말 해설

| 명령어      | 의미 / 어원                                   | 설명                     |
| -------- | ----------------------------------------- | ---------------------- |
| `ls`     | **list**                                  | 현재 디렉터리의 파일 목록 출력      |
| `cd`     | **change directory**                      | 디렉터리 이동                |
| `cp`     | **copy**                                  | 파일이나 디렉터리 복사           |
| `mv`     | **move**                                  | 파일이나 디렉터리 이동 또는 이름 변경  |
| `rm`     | **remove**                                | 파일 또는 디렉터리 삭제          |
| `rmdir`  | **remove directory**                      | 빈 디렉터리 삭제              |
| `pwd`    | **print working directory**               | 현재 디렉터리 경로 출력          |
| `cat`    | **concatenate**                           | 파일 내용을 이어서 출력          |
| `echo`   | 그대로 발음: **echo** (되울림)                    | 문자열을 그대로 출력            |
| `man`    | **manual**                                | 명령어 매뉴얼 보기             |
| `grep`   | **global regular expression print**       | 정규표현식 기반 문자열 검색        |
| `find`   | **find**                                  | 파일 및 디렉터리 찾기           |
| `awk`    | 창시자 이름 약자: **Aho, Weinberger, Kernighan** | 텍스트 분석 도구              |
| `sed`    | **stream editor**                         | 텍스트 스트림 편집기            |
| `sh`     | **shell**                                 | POSIX 셸 인터프리터          |
| `kill`   | **kill process**                          | 프로세스 종료 (시그널 전송)       |
| `ps`     | **process status**                        | 현재 실행 중인 프로세스 목록 보기    |
| `top`    | **top processes**                         | 실시간으로 프로세스 보기          |
| `df`     | **disk free**                             | 디스크 사용량 정보             |
| `du`     | **disk usage**                            | 파일/디렉터리 별 디스크 사용량      |
| `tar`    | **tape archive**                          | 파일 아카이브 도구 (백업용으로 시작됨) |
| `chmod`  | **change mode**                           | 파일 권한 변경               |
| `chown`  | **change owner**                          | 소유자 변경                 |
| `uname`  | **unix name**                             | 시스템 정보 출력              |
| `touch`  | **touch timestamp**                       | 빈 파일 생성 또는 수정 시간 갱신    |
| `head`   | **head**                                  | 파일의 처음 몇 줄 출력          |
| `tail`   | **tail**                                  | 파일의 마지막 몇 줄 출력         |
| `tee`    | **T형 파이프** 모양에서 유래                        | 출력을 파일과 화면에 동시에        |
| `env`    | **environment**                           | 환경 변수 출력 또는 설정         |
| `who`    | **who is logged in**                      | 로그인된 사용자 확인            |
| `uptime` | **up time**                               | 시스템이 켜져 있는 시간          |

---

#### ✨ 참고 팁

* POSIX 명령어는 보통 **짧고**, **기능 중심**, **영어 단어 축약형**입니다.
* 대부분은 **영어 단어 앞글자**를 따온 단순한 규칙이지만,
  `awk`처럼 사람 이름에서 따온 특이한 경우도 있습니다.

---