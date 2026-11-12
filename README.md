# 별빛 트리 광장

눈 내리는 밤, 광장의 모닥불에 여러 명이 둘러앉고 트리에 소원을 걸 수 있는 three.js 장면이에요.

## 할 수 있는 것

- **모닥불에 둘러앉기**: 모닥불 하나에 24명까지 앉아요. 가득 차 있으면 옆 모닥불로 안내해요(최대 8곳, 192명).
- **소원 적기**: 버튼을 누르고 소원이나 걱정을 적어 보내면, 내 캐릭터가 일어나 종이를 들고 트리까지 걸어가요.
  종이를 걸고 손을 흔든 뒤 돌아와 앉아요. 걸린 종이를 누르면 누가 무엇을 적었는지 보여요.
- **인사**: 자유 채팅은 없어요. 손 흔들기와 정해진 인사말 세 가지만 주고받아요.
- 이름과 동물 모자는 들어올 때마다 무작위로 정해져요.

## 연결 방식

| 무엇 | 어떻게 |
|---|---|
| 같이 앉아 있는 사람 | Trystero(P2P). 공개 Nostr 릴레이로 서로를 찾은 뒤 WebRTC로 직접 연결해요. 같은 모닥불 사람끼리만 연결돼요. |
| 트리에 걸린 소원 | Firebase Firestore. 나중에 들어온 사람, 다른 모닥불 사람도 볼 수 있어요. |

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

## 내 컴퓨터에서 시험하기

`crypto.subtle` 때문에 https 주소나 `localhost` 에서 열어야 함께 보기가 켜져요.

```bash
python3 -m http.server 8000
```

브라우저 탭 두 개로 http://localhost:8000 을 열면 같은 모닥불에 둘이 앉아요.

## 알아 둘 점

- 방화벽이 엄격한 네트워크에서는 WebRTC 직접 연결이 막혀 TURN 서버가 필요할 수 있어요(Trystero `turnConfig`).
- 에셋 출처는 `CREDITS.md`, 함께 넣은 라이브러리 라이선스는 `THIRD_PARTY_LICENSES.txt` 에 있어요.
