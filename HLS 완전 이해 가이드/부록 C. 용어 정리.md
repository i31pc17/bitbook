# 부록 C. 용어 정리

스트리밍 분야는 비슷한 용어가 많다.
이 책에서 사용한 용어들을
**자주 헷갈리는 짝**으로 묶어 정리한다.

---

## C.1 Segment vs Chunk vs Part vs Fragment

가장 자주 헷갈리는 네 단어.

각각 다른 표준에서 비슷한 개념을 부르는 이름이다.

| 용어 | 출처 | 의미 |
|---|---|---|
| **Segment** | HLS / DASH 공통 | 플레이어가 인식하는 재생 단위 (URL 단위) |
| **Fragment** | MP4 / fMP4 | moof + mdat 한 쌍 (컨테이너 내부) |
| **Chunk** | CMAF / DASH | 가장 작은 전송 단위 (CMAF chunk) |
| **Part** | LL-HLS | CMAF chunk와 동일한 개념의 HLS 용어 |

---

### 관계 정리

```
Segment (1~10초)
  └── Fragment (moof+mdat)
        └── Chunk (CMAF) = Part (HLS)
              ↑ 0.2~0.5초
```

**핵심**

* HLS의 **Part**와 CMAF의 **Chunk**는 사실상 같은 것
* MP4의 **Fragment**는 컨테이너 내부 구조 용어
* **Segment**만 표준 간 공통

본문 위치: 4.3, 6.3, 7.5

---

## C.2 Container vs Codec

| 용어 | 의미 | 예 |
|---|---|---|
| **Codec** | 영상/음성을 압축/해제하는 방식 | H.264, AAC, AV1 |
| **Container** | 코덱 결과물을 담는 형식 | MP4, fMP4, TS |

같은 코덱(H.264)을
**여러 컨테이너**에 담을 수 있다.

본문 위치: 4.1

---

## C.3 Playlist vs Manifest

| 용어 | 사용처 | 파일 |
|---|---|---|
| **Playlist** | HLS | m3u8 |
| **Manifest** | DASH | MPD (XML) |

기능은 같다.
**스트림 목록과 메타데이터**를 제공한다.

본문 위치: 1.9, 3.3

---

## C.4 Master / Multivariant Playlist

같은 파일을 가리키는 두 이름.

| 용어 | 출처 |
|---|---|
| **Master Playlist** | 실무 / 구버전 |
| **Multivariant Playlist** | HLS 명세 정식 용어 |

본문에서는 실무에서 익숙한
**Master Playlist**로 부른다.

본문 위치: 3.3

---

## C.5 VOD vs Live vs Event

라이브 스트리밍의 세 가지 모드.

| 모드 | 특징 | 매니페스트 |
|---|---|---|
| **VOD** | 완성된 영상 | 고정, ENDLIST 있음 |
| **Live** | 실시간 송출 | sliding window, ENDLIST 없음 |
| **Event** | 라이브 + 처음부터 재생 가능 | 추가만 가능 |

`EXT-X-PLAYLIST-TYPE`이 이 모드를 표시한다.

본문 위치: 3.5

---

## C.6 ABR / Adaptive Bitrate

| 용어 | 풀네임 | 의미 |
|---|---|---|
| **ABR** | Adaptive Bitrate | 네트워크 상태에 따라 화질을 자동 변경 |
| **Variant** | — | ABR의 각 화질 옵션 (1080p, 720p 등) |
| **Rendition** | — | 각 트랙(비디오/오디오/자막)의 한 버전 |

> Variant는 비디오 화질,
> Rendition은 더 일반적인 트랙 단위.

본문 위치: 2.4~2.6, 3.3

---

## C.7 Push vs Pull

데이터 전송 모델.

| 모델 | 누가 주도 | 예 |
|---|---|---|
| **Push** | 서버 | RTMP, WebRTC, SSE |
| **Pull** | 클라이언트 | HLS, DASH |

HLS는 명확하게 **pull-based**.

다만 LL-HLS의 blocking reload는
"클라이언트가 요청 → 서버가 보낼 때까지 잡고 있음"
형태라 **pull + push의 절충**으로 볼 수 있다.

본문 위치: 3.8, 6.4

---

## C.8 Polling vs Long Polling vs Blocking

요청 응답 패턴.

| 방식 | 동작 |
|---|---|
| **Polling** | 일정 주기로 반복 요청 |
| **Long Polling** | 요청 후 응답을 늦게 보냄 |
| **Blocking** | 특정 조건 만족 시까지 응답 보류 |

HLS는 **Polling**.
LL-HLS는 **Blocking** (사실상 long polling의 일종).

본문 위치: 5.6, 6.4

---

## C.9 Encoding vs Transcoding vs Packaging

미디어 처리 단계.

| 용어 | 의미 |
|---|---|
| **Encoding** | raw 신호 → 압축 (코덱 적용) |
| **Transcoding** | 한 코덱 → 다른 코덱 변환 |
| **Packaging** | 압축된 데이터 → 컨테이너로 묶기 |
| **Transmuxing** | 컨테이너만 변경 (재인코딩 없이) |

ffmpeg는 이 모두를 한다.

**ABR을 위한 멀티 비트레이트 생성**은
encoding + packaging.

**TS → fMP4 변환**은
transmuxing.

---

## C.10 GOP / Keyframe / I-Frame

| 용어 | 의미 |
|---|---|
| **GOP** | Group of Pictures. 한 keyframe부터 다음 keyframe 전까지 |
| **Keyframe** | 독립 디코딩 가능한 프레임 |
| **I-Frame** | Intra-coded Frame. 통상 keyframe과 같음 |
| **P-Frame** | Predicted. 이전 프레임 참조 |
| **B-Frame** | Bidirectional. 양쪽 프레임 참조 |

엄밀히 "I-Frame이 항상 keyframe은 아니다"라는
세부 구분이 있지만,
HLS 맥락에서는 거의 동의어다.

본문 위치: 4.4

---

## C.11 PTS / DTS

타임스탬프 두 종류.

| 용어 | 의미 |
|---|---|
| **PTS** | Presentation Timestamp. 언제 보여줄지 |
| **DTS** | Decoding Timestamp. 언제 디코딩할지 |

B-Frame이 있으면 PTS ≠ DTS.
참조 프레임을 먼저 디코딩하고
순서를 바꿔 보여줘야 하기 때문.

본문 위치: 4.2.3

---

## C.12 CMAF / fMP4 / ISO BMFF

비슷한 듯 다른 세 용어.

| 용어 | 의미 |
|---|---|
| **ISO BMFF** | Base Media File Format (ISO/IEC 14496-12). MP4의 기반 |
| **fMP4** | Fragmented MP4. ISO BMFF 위에서 fragment 사용 |
| **CMAF** | Common Media Application Format. fMP4를 어떻게 쓸지 표준화 |

```
ISO BMFF (기반)
  ↓
fMP4 (fragment 구조)
  ↓
CMAF (사용 규칙 표준화)
```

본문 위치: 4.3, 7.5

---

## C.13 AES-128 / SAMPLE-AES / cenc / cbcs

암호화 관련 용어.

| 용어 | 분류 | 특징 |
|---|---|---|
| **AES-128** | HLS 암호화 | segment 전체 |
| **SAMPLE-AES** | HLS 암호화 | 샘플 단위 |
| **cenc** | CENC 모드 | AES-CTR |
| **cbcs** | CENC 모드 | AES-CBC + 샘플 + 패턴 |

현재 멀티 DRM 환경의 표준은 **cbcs**.

본문 위치: 9.3, 9.4

---

## C.14 DRM 시스템 비교

| 시스템 | 회사 | 주 플랫폼 |
|---|---|---|
| **FairPlay** | Apple | iOS / Safari / tvOS |
| **Widevine** | Google | Chrome / Android |
| **PlayReady** | Microsoft | Edge / Windows / Xbox |
| **ClearKey** | W3C | 테스트용 (실서비스 X) |

EME (Encrypted Media Extensions)는
이들을 브라우저에서 호출하는 **W3C 표준 API**다.

본문 위치: 9.5

---

## C.15 MSE / EME / MMS

브라우저 미디어 API 세 가지.

| API | 풀네임 | 역할 |
|---|---|---|
| **MSE** | Media Source Extensions | 데이터를 buffer에 직접 공급 |
| **EME** | Encrypted Media Extensions | DRM 키 관리 |
| **MMS** | Managed Media Source | MSE의 메모리/배터리 관리형 |

본문 위치: 8.6, 8.11, 9.5

---

## C.16 HLS / LL-HLS / DASH / LL-DASH / WebRTC

스트리밍 프로토콜 비교.

| 프로토콜 | 풀네임 | 일반 지연 | 비고 |
|---|---|---|---|
| **HLS** | HTTP Live Streaming | 6~10초 | Apple, HTTP 기반 |
| **LL-HLS** | Low-Latency HLS | 1~3초 | HLS 확장 |
| **DASH** | Dynamic Adaptive Streaming over HTTP | 5~10초 | ISO 표준 |
| **LL-DASH** | Low-Latency DASH | 1~3초 | DASH 확장 |
| **WebRTC** | Web Real-Time Communication | 0.2~0.5초 | UDP 기반 |
| **SRT** | Secure Reliable Transport | 0.2~1초 | UDP, 송출용 |
| **HESP** | High-Efficiency Streaming Protocol | 0.4~2초 | 신규 표준 |

본문 위치: 1.9, 10.3
