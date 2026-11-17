# 별빛 트리 광장

눈 내리는 밤, 광장의 모닥불에 여러 명이 둘러앉고 트리에 소원을 걸 수 있는 three.js 장면이에요.

## 할 수 있는 것

- **모닥불에 둘러앉기**: 모닥불 하나에 24명까지 앉아요. 가득 차 있으면 옆 모닥불로 안내해요(최대 8곳, 192명).
- **소원 적기**: 버튼을 누르고 소원이나 걱정을 적어 보내면, 내 캐릭터가 일어나 종이를 들고 트리까지 걸어가요.
  종이를 걸고 손을 흔든 뒤 돌아와 앉아요. 걸린 종이를 누르면 누가 무엇을 적었는지 보여요.
- **인사**: 자유 채팅은 없어요. 손 흔들기와 정해진 인사말 세 가지만 주고받아요.
- **걸어 다니기**: 컴퓨터는 방향키·WASD, 휴대폰·태블릿은 왼쪽 아래 조이스틱으로 걸어요. 바닥을 클릭(톡)하면 그곳까지 장애물을 피해 걸어가요.
  "내 자리에 앉기"로 돌아가 앉고, 다른 모닥불 근처에서는 "이 모닥불에 앉기"로 옮겨 앉아요. 서 있을 때 소원을 적으면 그 자리에서 트리로 가요.
- 이름과 동물 모자는 들어올 때마다 무작위로 정해져요.

## 연결 방식

| 무엇 | 어떻게 |
|---|---|
| 같이 앉아 있는 사람 | Trystero(P2P). 공개 Nostr 릴레이로 서로를 찾은 뒤 WebRTC로 직접 연결해요. 같은 모닥불 사람끼리만 연결돼요. |
| 트리에 걸린 소원 | Firebase Firestore. 나중에 들어온 사람, 다른 모닥불 사람도 볼 수 있어요. |
| 직접 연결이 막힐 때 | Cloudflare TURN 중계(선택). 5G/LTE·학교·회사 와이파이처럼 직접 연결이 막히는 곳에서도 연결돼요. 아래 "TURN 중계 켜기" 참고. |

Firebase를 연결하기 전에는 소원이 저장되지 않고, 그 순간 같은 모닥불에 있는 사람들에게만 보여요.

## Firebase 연결하기

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만들고 **웹 앱**을 추가해요.
2. **Authentication → 로그인 방법**에서 **익명**을 켜요.
3. **Firestore Database**를 만들고, **규칙** 탭에 이 폴더의 `firestore.rules` 내용을 붙여 넣어 게시해요.
4. 웹 앱 설정 객체를 `firebase-config.mjs` 의 `null` 자리에 넣어요(`firebase-config.example.mjs` 참고).
5. **Authentication → 설정 → 승인된 도메인**에 GitHub Pages 주소(`<아이디>.github.io`)를 추가해요.

설정 값(apiKey 등)은 브라우저에 그대로 보이는 공개용 값이라 저장소에 올려도 괜찮아요. 실제 보호는 `firestore.rules` 가 맡아요.

### 저장 구조와 무료 한도

- 소원은 `wishBoards` 컬렉션의 "소원판" 문서(`s0-0`, `s2-1` …)에 120개씩 모여요. 동시에 쓰는 사람이 몰리지 않게 4갈래로 나눠 써요.
- 방문할 때마다 최근 소원판 6개만 읽어서, 무료 요금제(하루 읽기 5만 번)로 하루 수천 번 방문해도 충분해요.
- 규칙: 누구나 읽을 수 있고, 익명 로그인한 방문자는 자기 이름으로 60자 이하 소원을 **맨 뒤에 하나씩만** 덧붙일 수 있어요. 남의 소원을 고치거나 지우는 건 막혀 있어요.
- 부적절한 소원은 Firebase 콘솔 → Firestore → `wishBoards` → 해당 문서의 `items` 배열에서 항목을 지우면 돼요.

### 규칙을 내 컴퓨터에서 시험하기 (선택)

[Firebase CLI](https://firebase.google.com/docs/cli)와 Java가 있으면 에뮬레이터로 실제 규칙 그대로 시험할 수 있어요.
`firebase-config.mjs` 에 `emulatorHost: '127.0.0.1'` 을 잠깐 넣고 실행해요.

```bash
firebase emulators:start --only firestore,auth --project demo-plaza
```

## TURN 중계 켜기 (선택, 무료)

같은 모닥불인데도 서로 안 보이면(특히 5G/LTE 휴대폰 ↔ 와이파이), 브라우저끼리 직접 연결이 막힌 거예요.
TURN 서버를 켜면 직접 연결을 먼저 시도하고, 막힐 때만 TURN이 데이터를 대신 전달해요. Cloudflare TURN은 매달 1,000 GB까지 무료예요.

1. **TURN 키 만들기**: Cloudflare 대시보드 → **Realtime**(예전 이름 Calls) → **TURN** 에서 키를 만들고 **Turn Token ID** 와 **API Token** 을 적어 둬요.
2. **Worker 만들기**: **Workers & Pages → Create → Worker** 로 만든 뒤 **Edit code** 에 `cloudflare-worker/worker.js` 내용을 붙여 넣고 **Deploy** 해요.
3. **Worker 설정 → Variables and Secrets** 에 세 개를 넣어요.

   | 이름 | 종류 | 값 |
   |---|---|---|
   | `TURN_KEY_ID` | Text | Turn Token ID |
   | `TURN_KEY_API_TOKEN` | **Secret** | API Token |
   | `ALLOWED_ORIGINS` | Text | `https://ssoonson.github.io` (다른 주소에서도 열면 쉼표로 추가) |

4. 이 저장소의 `turn-config.json` 에 Worker 주소를 넣고 커밋해요.

   ```json
   { "endpoint": "https://plaza-turn.내계정.workers.dev" }
   ```

5. GitHub Pages에 반영되면 광장의 상태 줄 끝에 **"중계 켜짐"** 이 보여요.
   "중계 서버 응답 없음"이면 Worker 주소나 세 가지 설정 값을 다시 확인해요. 그래도 직접 연결은 그대로 시도해요.

TURN API 토큰은 Worker 안에만 있고 페이지에는 4시간짜리 임시 로그인만 전달돼요. `endpoint` 가 비어 있으면 TURN 없이 지금처럼 동작해요.

## 내 컴퓨터에서 시험하기

`crypto.subtle` 때문에 https 주소나 `localhost` 에서 열어야 함께 보기가 켜져요.

```bash
python3 -m http.server 8000
```

브라우저 탭 두 개로 http://localhost:8000 을 열면 같은 모닥불에 둘이 앉아요.

## 알아 둘 점

- 방화벽이 엄격한 네트워크나 5G/LTE에서는 WebRTC 직접 연결이 막힐 수 있어요. 아래 "TURN 중계 켜기"로 해결해요.
- 에셋 출처는 `CREDITS.md`, 함께 넣은 라이브러리 라이선스는 `THIRD_PARTY_LICENSES.txt` 에 있어요.
