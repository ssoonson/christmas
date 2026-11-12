// Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹)에 나오는 설정 객체를 그대로 옮기면 돼요.
export default {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000',
  // 내 컴퓨터의 Firebase 에뮬레이터로 시험할 때만 넣어요(올릴 때는 지워요).
  // emulatorHost: '127.0.0.1',
};
