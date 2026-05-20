# 부록 B. 자주 쓰는 도구

본문에서 다룬 개념을
**실제로 만들고/확인하고/디버깅**할 때
사용하는 도구들을 정리한다.

---

## B.1 인코딩과 패키징: ffmpeg

가장 강력한 오픈소스 미디어 도구.

HLS / fMP4 / CMAF 생성에 모두 사용된다.

---

### 기본 HLS 생성 (TS)

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -c:a aac \
  -hls_time 2 \
  -hls_list_size 0 \
  -hls_segment_filename "seg%03d.ts" \
  output.m3u8
```

| 옵션 | 의미 |
|---|---|
| `-hls_time` | segment 길이 (초) |
| `-hls_list_size` | playlist에 유지할 segment 수 (0=전부) |
| `-hls_segment_filename` | segment 파일 이름 패턴 |

---

### fMP4 HLS 생성

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -c:a aac \
  -hls_time 2 \
  -hls_segment_type fmp4 \
  -hls_segment_filename "seg%03d.m4s" \
  output.m3u8
```

`-hls_segment_type fmp4`가 핵심.
`init.mp4`가 자동으로 생성된다.

---

### 멀티 비트레이트 (ABR)

```bash
ffmpeg -i input.mp4 \
  -map 0:v:0 -map 0:v:0 -map 0:v:0 -map 0:a:0 \
  -c:v libx264 -c:a aac \
  -b:v:0 5M -s:v:0 1920x1080 \
  -b:v:1 3M -s:v:1 1280x720 \
  -b:v:2 1M -s:v:2 640x360 \
  -var_stream_map "v:0,a:0 v:1,a:0 v:2,a:0" \
  -master_pl_name master.m3u8 \
  -f hls -hls_time 2 \
  "%v/index.m3u8"
```

---

### Keyframe Alignment 강제

```bash
ffmpeg -i input.mp4 \
  -force_key_frames "expr:gte(t,n_forced*2)" \
  -g 60 -keyint_min 60 \
  -sc_threshold 0 \
  ...
```

2초마다 강제 I-Frame.
ABR의 화질 전환을 깨끗하게 만든다.

---

## B.2 플레이어 라이브러리

브라우저에서 HLS를 재생할 때 쓰는 라이브러리.

---

### hls.js

* HLS 전용
* 가장 많이 쓰이는 오픈소스
* MSE 기반 (Safari는 native 사용)
* https://github.com/video-dev/hls.js

```javascript
import Hls from 'hls.js';

const video = document.querySelector('video');

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource('master.m3u8');
  hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = 'master.m3u8';
}
```

**LL-HLS 지원**: lowLatencyMode 옵션.

---

### Shaka Player

* HLS + DASH 모두 지원
* Google이 만듦
* DRM 통합이 강력
* https://github.com/shaka-project/shaka-player

```javascript
const player = new shaka.Player(video);
await player.load('master.m3u8');
```

OTT처럼 멀티 DRM이 필요한 환경에 적합.

---

### Video.js

* UI / 플러그인 중심
* HLS 재생은 플러그인으로 (videojs-http-streaming)
* https://github.com/videojs/video.js

UI 커스터마이징이 많은 서비스에 적합.

---

### dash.js

* DASH 전용 레퍼런스 구현체
* DASH-IF가 직접 관리
* https://github.com/Dash-Industry-Forum/dash.js

---

### 비교

| 라이브러리 | HLS | DASH | DRM | LL-HLS |
|---|---|---|---|---|
| hls.js | ◎ | ✕ | △ (EME) | ◎ |
| Shaka Player | ◎ | ◎ | ◎ | ◎ |
| Video.js | ○ (플러그인) | ○ | ○ | △ |
| dash.js | ✕ | ◎ | ◎ | ◎ |

---

## B.3 디버깅 도구

### mediainfo

파일의 코덱/컨테이너 정보를 빠르게 확인.

```bash
mediainfo input.mp4
mediainfo seg100.ts
```

출력에서 확인할 수 있는 정보:

* 컨테이너 종류
* 비디오/오디오 코덱
* 프로파일/레벨
* 비트레이트
* 프레임레이트
* 트랙 정보

---

### mp4box (GPAC)

fMP4 / MP4의 box 구조를 분석.

```bash
# 전체 구조 트리
mp4box -info init.mp4

# box 단위 dump
mp4box -dump-box seg100.m4s
```

4장에서 본 `ftyp / moov / moof / mdat` 등이
실제로 어떻게 들어있는지 확인 가능.

---

### ffprobe

ffmpeg에 포함된 메타데이터 분석 도구.

```bash
ffprobe -v error -show_streams -show_format input.mp4
ffprobe -show_packets -select_streams v:0 seg100.ts
```

* 각 프레임의 PTS/DTS 확인
* keyframe 위치 확인
* 코덱 파라미터 확인

---

### Wireshark

네트워크 패킷 수준 분석.

* HTTP 요청/응답 흐름 추적
* Chunked Transfer Encoding 확인
* LL-HLS의 blocking reload 동작 검증
* TLS 환경에서는 SSLKEYLOGFILE로 복호화

---

### Chrome DevTools

가장 가까운 도구.

* **Network** 탭
  → m3u8, segment, key 요청 흐름
  → `Transfer-Encoding: chunked` 헤더 확인
  → segment 다운로드 시간 측정
* **Media** 탭
  → 디코더 상태, buffer 잔량
  → MSE 이벤트 흐름
* **Performance** 탭
  → 재생 중 CPU/GPU 사용량

---

### Charles / mitmproxy

HTTPS 트래픽 가로채기 + 변조.

* 다른 디바이스의 HLS 트래픽 캡처
  (Apple TV, 스마트폰 등)
* 응답을 수정해서 동작 검증
* m3u8을 즉석에서 변조

---

## B.4 라이브 스트리밍 송출 도구

### OBS Studio

* 가장 널리 쓰이는 무료 송출 도구
* RTMP / SRT 출력
* HLS 직접 출력은 안 됨 → 서버에서 변환

---

### nginx-rtmp / nginx-vod-module

* RTMP 수신 → HLS 변환
* VOD 파일을 HLS로 즉시 서빙

---

### Wowza / AWS MediaLive

* 상용 라이브 인코더
* 고가용성, 멀티 비트레이트 자동화

---

## B.5 명세와 레퍼런스 자료

* **RFC 8216**: HLS 공식 명세
  https://datatracker.ietf.org/doc/html/rfc8216
* **Apple HLS 페이지**:
  https://developer.apple.com/streaming/
* **DASH-IF**:
  https://dashif.org/
* **CMAF (ISO/IEC 23000-19)**:
  ISO 사이트에서 유료 구매 또는 DASH-IF 문서 참고
* **W3C MSE 명세**:
  https://www.w3.org/TR/media-source/
* **W3C EME 명세**:
  https://www.w3.org/TR/encrypted-media/

---

## B.6 어떤 도구부터 써야 하는가

추천 순서.

```
1. mediainfo / ffprobe로 파일 들여다보기
2. ffmpeg로 직접 HLS 만들어보기
3. hls.js로 웹에서 재생해보기
4. Chrome DevTools로 트래픽 관찰
5. mp4box로 fMP4 box 구조 확인
6. Wireshark로 LL-HLS의 chunked 응답 관찰
```

각 도구는 책의 다음 장과 짝지어진다.

| 도구 | 가장 잘 어울리는 장 |
|---|---|
| ffmpeg | 2~4장 (구조 만들기) |
| mediainfo / ffprobe | 4장 (코덱/컨테이너) |
| mp4box | 4장 (fMP4 box) |
| hls.js / Shaka | 8장 (재생) |
| Chrome DevTools | 5~6장 (지연/LL-HLS 검증) |
| Wireshark | 6장 (chunked transfer) |
