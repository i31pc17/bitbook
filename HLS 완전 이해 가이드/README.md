# HLS 완전 이해 가이드

## 이 책에 대하여

이 책은 HLS 사용법이 아니라  
HLS가 *왜 이런 선택을 했는지*,  
그리고 *실제로 어떻게 동작하는지*를  
따라가는 책이다.

모든 스트리밍 기술은  
무언가를 얻기 위해 무언가를 포기한  
**트레이드오프의 결과물**이다.

HLS는 잘 만들어진 기술이 아니라  
**안정성과 확장성을 위해  
지연을 의도적으로 감수한 기술**이다.

이 책은 두 가지를 모두 다룬다.

* 개념과 철학
* 구체적인 동작 (태그, 패킷, box 구조, API 수준)

이 책의 모든 장은  
결국 다음 한 문장을 향한다.

> **HLS는 포맷이 아니라 설계 철학이며,  
> 우리가 마주하는 모든 한계는  
> 그 철학의 자연스러운 결과다.**

---

## 이 책이 답하려는 질문

* 왜 HLS는 라이브에서 몇 초씩 늦을까
* m3u8 안의 각 태그는 무엇을 의미하는가
* TS 패킷과 fMP4 box는 실제로 어떻게 생겼는가
* 왜 LL-HLS는 데이터 포맷까지 바꿔야 했을까
* Safari와 Chrome은 왜 같은 영상도 다르게 재생할까
* MSE를 사용하면 실제 코드는 어떤 모습인가
* Low Latency는 결국 무엇을 바꾸는 일인가

---

## 읽는 법

| 장 | 내용 |
|---|---|
| 1~2장 | HLS가 무엇이고 왜 등장했는가 |
| 3~4장 | HLS의 데이터 구조 (playlist와 segment) |
| 5장 | 그 구조가 만드는 한계 (지연) |
| 6~7장 | 한계를 줄이기 위한 변화 (LL-HLS, CMAF) |
| 8장 | 재생 제어권의 이동 (MSE) |
| 9장 | 콘텐츠 보호 (암호화, DRM) |
| 10장 | 트레이드오프로 본 스트리밍 |

각 장은 앞 장을 전제로 한다.
순서대로 읽기를 권장한다.

---

## 목차

### 시작하며. 스트리밍을 바라보는 세 가지 축

* 안정성 ↔ 지연
* 구조의 단순함 ↔ 성능
* 제어권 ↔ 편의성
* 이 책이 따라갈 흐름

---

### 1장. HLS의 정의와 등장 배경

* 1.1 스트리밍의 본질과 초기 방식 (RTMP / RTSP)
* 1.2 기존 스트리밍 구조의 한계
* 1.3 Apple의 문제 정의
* 1.4 HLS의 핵심 아이디어: 연결에서 요청으로
* 1.5 HTTP 기반 설계의 전략적 의미
* 1.6 시장과 기술의 교차점: Apple vs Adobe
* 1.7 스트리밍 패러다임의 전환
* 1.8 HLS의 설계 목표와 구조적 한계
* 1.9 HLS vs MPEG-DASH: 같은 시기, 다른 길

---

### 2장. 왜 동영상을 잘게 나누는가

* 2.1 동영상을 쪼개서 전달한다는 것
* 2.2 잘게 나누는 이유: 전체 실패에서 부분 실패로
* 2.3 HTTP 요청 구조와의 결합
* 2.4 적응형 비트레이트(ABR)의 필요성
* 2.5 ABR이 가능한 이유: 조각의 독립성
* 2.6 ABR 알고리즘의 종류
  * throughput-based
  * buffer-based
  * hybrid
* 2.7 ABR의 실제 동작 흐름

---

### 3장. HLS 구조와 Playlist(m3u8) 완전 해부

* 3.1 HLS의 3대 구성요소
  * Playlist + Segment + Player
* 3.2 실제 HLS 디렉토리 구조
* 3.3 Master Playlist 완전 분석
  * 3.3.1 EXT-X-STREAM-INF의 속성들
  * 3.3.2 EXT-X-MEDIA로 정의하는 대체 렌디션
  * 3.3.3 GROUP-ID로 묶이는 트랙 구조
  * 3.3.4 EXT-X-I-FRAME-STREAM-INF
  * 3.3.5 EXT-X-INDEPENDENT-SEGMENTS
* 3.4 Media Playlist의 주요 태그
  * 3.4.1 EXT-X-VERSION
  * 3.4.2 EXT-X-TARGETDURATION
  * 3.4.3 EXT-X-MEDIA-SEQUENCE
  * 3.4.4 EXTINF
  * 3.4.5 EXT-X-MAP (Initialization Segment)
  * 3.4.6 EXT-X-BYTERANGE
* 3.5 VOD와 Live의 구분
  * 3.5.1 EXT-X-PLAYLIST-TYPE
  * 3.5.2 EXT-X-ENDLIST
  * 3.5.3 EXT-X-DISCONTINUITY
* 3.6 플레이어 동작 흐름
* 3.7 Live Streaming과 Sliding Window
* 3.8 HLS 구조의 본질: pull 기반 클라이언트 주도
* 3.9 이 구조가 만드는 장점과 단점

---

### 4장. 데이터의 실체 — Segment 내부 구조

* 4.1 컨테이너와 코덱의 구분
* 4.2 MPEG-TS 깊이 들여다보기
  * 4.2.1 188바이트 패킷의 구조
  * 4.2.2 PID, PAT, PMT
  * 4.2.3 PES (Packetized Elementary Stream)
  * 4.2.4 왜 TS는 중간부터 재생이 어려운가
* 4.3 fMP4 깊이 들여다보기
  * 4.3.1 MP4의 "Box" 개념
  * 4.3.2 ftyp / moov / mvex
  * 4.3.3 moof / mdat
  * 4.3.4 sidx와 랜덤 액세스
  * 4.3.5 왜 fMP4는 독립 재생이 가능한가
* 4.4 GOP과 Keyframe Alignment
  * 4.4.1 I / P / B 프레임의 차이
  * 4.4.2 왜 segment 경계는 keyframe이어야 하는가
  * 4.4.3 인코더의 segment 경계 처리
* 4.5 코덱 호환성
  * 4.5.1 비디오: H.264 / H.265 / AV1
  * 4.5.2 오디오: AAC / AC-3 / Opus
  * 4.5.3 CODECS 문자열 읽는 법
* 4.6 정리: 왜 TS와 fMP4가 공존하는가

---

### 5장. 왜 HLS는 느릴 수밖에 없는가

* 5.1 라이브인데 왜 늦게 보일까
* 5.2 전체 흐름 한눈에 보기
* 5.3 인코더 측 지연
* 5.4 서버 측 지연: Segment 완성 대기
* 5.5 Playlist 구조에서 오는 간접 지연
* 5.6 Polling 방식의 추가 지연
* 5.7 Player Buffer 지연
* 5.8 지연을 시간으로 다시 보기
* 5.9 이 구조의 본질
* 5.10 핵심 정리: `Latency ≈ encoder + segment + polling + buffer`

---

### 6장. HLS의 한계를 줄이기 위한 변화 — LL-HLS

* 6.1 문제 재정의
* 6.2 첫 번째 시도: Segment를 더 작게
* 6.3 두 번째 변화: 생성 중 전송
  * 6.3.1 Segment와 Part의 역할 구분
  * 6.3.2 EXT-X-PART
  * 6.3.3 EXT-X-PART-INF
* 6.4 세 번째 변화: Polling에서 Blocking으로
  * 6.4.1 EXT-X-SERVER-CONTROL
  * 6.4.2 CAN-BLOCK-RELOAD / HOLD-BACK / PART-HOLD-BACK
  * 6.4.3 Blocking Reload (`_HLS_msn`, `_HLS_part`)
  * 6.4.4 흐름 비교: polling vs blocking
* 6.5 미래를 미리 알려주기
  * 6.5.1 EXT-X-PRELOAD-HINT
  * 6.5.2 EXT-X-RENDITION-REPORT
* 6.6 HTTP Chunked Transfer Encoding
* 6.7 LL-HLS의 한계
* 6.8 한 문장 정리

---

### 7장. Low Latency를 가능하게 하는 데이터 구조 — CMAF

* 7.1 왜 데이터 구조까지 바뀌어야 했는가
* 7.2 TS는 왜 중간 전송이 어려운가
* 7.3 fMP4가 LL-HLS를 가능하게 한 이유
  * 7.3.1 moof + mdat의 독립성
  * 7.3.2 init.mp4와 본체의 분리
* 7.4 fMP4만으로 부족했던 이유
* 7.5 CMAF가 해결한 것 ①: 쪼개는 단위
  * Segment / Fragment / Chunk
* 7.6 CMAF가 해결한 것 ②: 전송 방식
* 7.7 CMAF가 해결한 것 ③: 호환성
* 7.8 Common Encryption (CENC)과 CMAF
* 7.9 전체 흐름 정리

---

### 8장. 재생 제어권의 이동 — Flash에서 MSE까지

* 8.1 시점 전환: 누가 재생을 통제하는가
* 8.2 Flash 시대
* 8.3 전환점: 애플의 선택과 HLS
* 8.4 HTML5 video 시대
* 8.5 Low Latency에서 드러난 한계
* 8.6 MSE: 데이터를 직접 넣는 방식
* 8.7 MSE API 실제 흐름
  * 8.7.1 MediaSource와 SourceBuffer
  * 8.7.2 addSourceBuffer / appendBuffer / updateend
  * 8.7.3 init segment를 먼저 넣는 이유
  * 8.7.4 SourceBuffer mode: segments vs sequence
  * 8.7.5 buffer 제거와 메모리 관리
* 8.8 hls.js는 무엇을 해주는가
* 8.9 Safari는 왜 다른 구조를 가지는가
* 8.10 실무에서 발생하는 차이
* 8.11 Managed Media Source (iOS 17+)
* 8.12 핵심 정리

---

### 9장. 콘텐츠 보호 — 암호화와 DRM

* 9.1 왜 스트리밍은 암호화가 필요한가
* 9.2 EXT-X-KEY 태그 분석
* 9.3 AES-128 (segment 단위 암호화)
* 9.4 SAMPLE-AES (샘플 단위 암호화)
* 9.5 DRM 시스템
  * FairPlay
  * Widevine
  * PlayReady
* 9.6 Common Encryption (CENC)으로 가는 흐름

---

### 10장. 다시 처음으로 — 트레이드오프로 본 스트리밍

* 10.1 우리가 따라온 질문
* 10.2 세 가지 축으로 본 스트리밍
  * 안정성 ↔ 지연
  * 구조의 단순함 ↔ 성능
  * 제어권 ↔ 편의성
* 10.3 HLS / LL-HLS / DASH / WebRTC의 위치
* 10.4 어떤 기술을 언제 선택할 것인가
* 10.5 이 책의 마지막 한 문장

---

## 부록

### A. m3u8 태그 전체 레퍼런스
* 모든 표준 태그를 한 페이지에서 조회
* 카테고리별 정리
  * Basic
  * Media Segment
  * Media Playlist
  * Master Playlist
  * LL-HLS

### B. 자주 쓰는 도구
* ffmpeg로 HLS 만들기 (TS / fMP4)
* hls.js / Shaka Player / Video.js 비교
* 디버깅 도구
  * Wireshark
  * mediainfo
  * mp4box

### C. 용어 정리
* segment vs chunk vs part vs fragment
* container vs codec
* playlist vs manifest
* 그 외 자주 헷갈리는 용어들

---

## 핵심 메시지

> **Low Latency는  
> "데이터를 어떻게 보내느냐"와  
> "누가 재생을 제어하느냐"가  
> 함께 만들어낸 결과다.**

> HLS의 모든 선택은,  
> 안정성·확장성·호환성을 위해  
> 무엇을 포기했는지를 기억할 때  
> 비로소 이해된다.
