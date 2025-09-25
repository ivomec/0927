import admin from 'firebase-admin';

// 서버가 시작되거나 재사용될 때, admin 앱이 아직 초기화되지 않았을 경우에만 실행합니다.
if (!admin.apps.length) {
  try {
    // 모든 설정을 포함하여 (가장 중요: storageBucket) Admin SDK를 초기화합니다.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // 이곳에 복제할 프로젝트의 정확한 Firebase Storage 버킷 주소를 입력해야 합니다.
      storageBucket: "chart0927-64ec7.firebasestorage.app", 
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

// 이미 초기화된 admin 인스턴스에서 firestore와 storage 객체를 생성합니다.
const firestore = admin.firestore();
const storage = admin.storage();

// 다른 파일에서 이 객체들을 가져와 사용할 수 있도록 내보냅니다.
export { admin, firestore, storage };