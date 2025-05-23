## 제5장. 파일 권한과 사용자 계정 이해하기

### 1. 리눅스의 권한 구조

리눅스는 다중 사용자 환경이기 때문에, **파일과 디렉토리에 대한 권한 설정**이 매우 중요합니다. 권한이란 "누가 무엇을 할 수 있는가"를 정의하는 규칙입니다.

```bash
ls -l hello.txt
```

#### 예시 출력:

```
-rw-r--r-- 1 user user 1234 May 18 10:00 hello.txt
```

| 구분    | 설명                                 |
| ----- | ---------------------------------- |
| `-`   | 파일 종류 (`-`: 일반 파일, `d`: 디렉토리)      |
| `rw-` | 사용자(user)의 권한: 읽기(r), 쓰기(w), 실행(x) |
| `r--` | 그룹(group)의 권한                      |
| `r--` | 기타 사용자(other)의 권한                  |

---

### 2. 권한 변경 (chmod)

파일이나 디렉토리의 권한을 변경하려면 `chmod` 명령어를 사용합니다.

#### 숫자 방식

```bash
chmod 755 hello.txt
```

* 사용자: 읽기(r=4) + 쓰기(w=2) + 실행(x=1) = 7
* 그룹: 읽기 + 실행 = 5
* 기타: 읽기 + 실행 = 5

#### 기호 방식

```bash
chmod u+x hello.txt
```

* 사용자(user)에게 실행 권한(x) 추가

추가 기호:

* `u`: 사용자(user), `g`: 그룹(group), `o`: 기타(other), `a`: 전체(all)
* `+`: 권한 추가, `-`: 권한 제거, `=`: 권한 지정

---

### 3. 소유자와 그룹 변경 (chown, chgrp)

파일은 **소유 사용자**와 **소유 그룹**을 가질 수 있습니다. 이를 변경하려면 `chown`, `chgrp` 명령어를 사용합니다.

```bash
sudo chown newuser:newgroup hello.txt
```

* `hello.txt`의 소유자를 `newuser`, 그룹을 `newgroup`으로 변경

```bash
sudo chgrp newgroup hello.txt
```

* 그룹만 변경할 경우에는 `chgrp` 사용 가능

> 참고: chown 명령은 보통 root 권한이 필요하기 때문에 `sudo`를 붙입니다.

---

### 4. 사용자 계정 정보 확인

리눅스는 사용자 정보를 `/etc/passwd`와 `/etc/group` 파일에 저장합니다.

#### 현재 로그인한 사용자 확인

```bash
whoami
```

#### 현재 사용자의 ID 정보 확인

```bash
id
```

#### 예시 출력

```
uid=1000(user) gid=1000(user) groups=1000(user),27(sudo)
```

* uid: 사용자 ID
* gid: 기본 그룹 ID
* groups: 속한 그룹 목록

#### 모든 사용자 목록 보기

```bash
cat /etc/passwd
```

#### 모든 그룹 목록 보기

```bash
cat /etc/group
```

---

### 5. 사용자 생성 및 비밀번호 설정 (선택 실습)

관리자 권한이 있는 경우, 사용자 계정을 추가하는 명령도 간단히 소개할 수 있습니다.

```bash
sudo useradd newuser
sudo passwd newuser
```

* `useradd`: 새로운 사용자 생성
* `passwd`: 사용자 비밀번호 설정

> 이 실습은 루트 권한이 필요하므로, 개인 테스트 환경에서만 시도하세요.

---

### 정리

이번 장에서는 리눅스의 **파일 권한 구조**와 **사용자 계정 시스템**에 대해 배웠습니다.

* `ls -l`을 통해 파일 권한을 해석하고,
* `chmod`, `chown`, `chgrp`를 통해 권한과 소유자를 조정하며,
* `whoami`, `id`로 사용자 정보를 확인하고 `/etc/passwd` 파일도 확인해보았습니다.

다음 장에서는 프로세스 관리, 실행 중인 프로그램 확인, 종료 명령어 등을 배워보겠습니다.
