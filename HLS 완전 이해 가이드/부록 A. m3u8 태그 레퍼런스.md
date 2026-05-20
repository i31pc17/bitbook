# 부록 A. m3u8 태그 레퍼런스

본문에서 다룬 m3u8 태그를
**한 페이지에서 조회**할 수 있도록 정리했다.

각 태그가 등장한 본문 위치도 함께 표기했다.

---

## A.1 기본 태그 (Basic)

| 태그 | 의미 | 본문 |
|---|---|---|
| `#EXTM3U` | playlist 시작 표식 | 3.3 |
| `#EXT-X-VERSION` | 최소 프로토콜 버전 | 3.4.1 |

---

## A.2 Media Segment 태그

각 segment에 적용되는 태그.

| 태그 | 의미 | 본문 |
|---|---|---|
| `#EXTINF` | segment 길이 + URI | 3.4.4 |
| `#EXT-X-BYTERANGE` | 파일 내 바이트 범위 | 3.4.6 |
| `#EXT-X-DISCONTINUITY` | 시퀀스 불연속 | 3.5.3 |
| `#EXT-X-KEY` | 암호화 키 정보 | 9.2 |
| `#EXT-X-MAP` | Initialization Segment | 3.4.5 |
| `#EXT-X-PROGRAM-DATE-TIME` | 실제 시각 매핑 | — |

---

## A.3 Media Playlist 태그

playlist 전체에 적용되는 태그.

| 태그 | 의미 | 본문 |
|---|---|---|
| `#EXT-X-TARGETDURATION` | segment 최대 길이 | 3.4.2 |
| `#EXT-X-MEDIA-SEQUENCE` | 첫 segment 번호 | 3.4.3 |
| `#EXT-X-PLAYLIST-TYPE` | VOD / EVENT | 3.5.1 |
| `#EXT-X-ENDLIST` | playlist 종료 | 3.5.2 |
| `#EXT-X-I-FRAMES-ONLY` | I-Frame만 있는 playlist | — |
| `#EXT-X-INDEPENDENT-SEGMENTS` | 모든 segment 독립 디코딩 | 3.3.5 |
| `#EXT-X-START` | 재생 시작 위치 | — |

---

## A.4 Master Playlist 태그

여러 variant를 묶는 playlist 전용 태그.

| 태그 | 의미 | 본문 |
|---|---|---|
| `#EXT-X-STREAM-INF` | variant 정의 | 3.3.1 |
| `#EXT-X-MEDIA` | 대체 렌디션 (오디오/자막) | 3.3.2 |
| `#EXT-X-I-FRAME-STREAM-INF` | I-Frame 전용 playlist | 3.3.4 |
| `#EXT-X-SESSION-DATA` | 세션 메타데이터 | — |
| `#EXT-X-SESSION-KEY` | 세션 레벨 키 | — |

---

## A.5 LL-HLS 태그

Low-Latency HLS 전용 태그.

| 태그 | 의미 | 본문 |
|---|---|---|
| `#EXT-X-PART` | partial segment 정의 | 6.3.2 |
| `#EXT-X-PART-INF` | part 기본 길이 | 6.3.3 |
| `#EXT-X-SERVER-CONTROL` | blocking reload 등 서버 기능 | 6.4.1 |
| `#EXT-X-PRELOAD-HINT` | 다음 part 미리 알림 | 6.5.1 |
| `#EXT-X-RENDITION-REPORT` | 다른 화질 상태 알림 | 6.5.2 |
| `#EXT-X-SKIP` | skip된 segment 정보 | — |

---

## A.6 자주 쓰는 속성 모음

### EXT-X-STREAM-INF

| 속성 | 예시 | 의미 |
|---|---|---|
| BANDWIDTH | 5000000 | 최대 bps |
| AVERAGE-BANDWIDTH | 4800000 | 평균 bps |
| RESOLUTION | 1920x1080 | 해상도 |
| CODECS | "avc1.640028,mp4a.40.2" | 코덱 식별 |
| FRAME-RATE | 30.000 | fps |
| HDCP-LEVEL | NONE / TYPE-0 / TYPE-1 | 출력 보호 |
| VIDEO-RANGE | SDR / PQ / HLG | 색공간 |
| AUDIO | "aud1" | 오디오 그룹 |
| SUBTITLES | "sub1" | 자막 그룹 |

---

### EXT-X-MEDIA

| 속성 | 예시 | 의미 |
|---|---|---|
| TYPE | AUDIO | 트랙 종류 |
| GROUP-ID | "aud1" | 그룹 식별자 |
| NAME | "Korean" | 표시명 |
| LANGUAGE | "ko" | 언어 (BCP 47) |
| DEFAULT | YES / NO | 기본 선택 |
| AUTOSELECT | YES / NO | 자동 선택 가능 |
| FORCED | YES / NO | 강제 선택 (자막) |
| CHANNELS | "2" | 오디오 채널 수 |
| URI | "audio/ko.m3u8" | playlist 위치 |

---

### EXT-X-KEY

| 속성 | 예시 | 의미 |
|---|---|---|
| METHOD | AES-128 / SAMPLE-AES / NONE | 암호화 방식 |
| URI | "https://.../key" | 키 위치 |
| IV | 0x... | 초기 벡터 |
| KEYFORMAT | "identity" / "com.apple.streamingkeydelivery" 등 | DRM 식별 |
| KEYFORMATVERSIONS | "1" | 포맷 버전 |

---

### EXT-X-PART

| 속성 | 예시 | 의미 |
|---|---|---|
| URI | "seg.0.m4s" | part 위치 |
| DURATION | 0.200 | part 길이 (초) |
| INDEPENDENT | YES / NO | 독립 디코딩 가능 여부 |
| BYTERANGE | "1000@0" | 바이트 범위 |
| GAP | YES | 누락 표시 |

---

### EXT-X-SERVER-CONTROL

| 속성 | 예시 | 의미 |
|---|---|---|
| CAN-BLOCK-RELOAD | YES | blocking reload 지원 |
| HOLD-BACK | 6.0 | 최전선 거리 (초) |
| PART-HOLD-BACK | 0.6 | part 단위 최전선 거리 |
| CAN-SKIP-UNTIL | 12.0 | skip 기능 활성 임계값 |
| CAN-SKIP-DATERANGES | YES | DATERANGE도 skip 가능 |

---

## A.7 한눈에 보는 전체 흐름

```
[Master Playlist]
  #EXTM3U
  #EXT-X-VERSION
  #EXT-X-INDEPENDENT-SEGMENTS
  #EXT-X-MEDIA          (오디오/자막)
  #EXT-X-STREAM-INF     (각 화질)
  #EXT-X-I-FRAME-STREAM-INF (탐색용)

[Media Playlist]
  #EXTM3U
  #EXT-X-VERSION
  #EXT-X-TARGETDURATION
  #EXT-X-MEDIA-SEQUENCE
  #EXT-X-PLAYLIST-TYPE  (VOD / EVENT)
  #EXT-X-MAP            (fMP4)
  #EXT-X-KEY            (암호화)
  #EXT-X-SERVER-CONTROL (LL-HLS)
  #EXT-X-PART-INF       (LL-HLS)

  #EXT-X-PART (LL-HLS)
  #EXTINF + segment URI
  #EXT-X-DISCONTINUITY (필요 시)

  #EXT-X-PRELOAD-HINT (LL-HLS, 끝부분)
  #EXT-X-RENDITION-REPORT (LL-HLS)

  #EXT-X-ENDLIST (VOD/종료)
```

---

## A.8 명세 위치

* HLS 공식 명세: **RFC 8216** (HLS Protocol)
  https://datatracker.ietf.org/doc/html/rfc8216
* LL-HLS 확장: HLS 명세에 통합됨 (2nd Edition draft 등)
* Apple의 공식 문서:
  https://developer.apple.com/streaming/

각 태그의 모든 속성과 제약은
원본 명세를 확인하는 것이 가장 정확하다.
