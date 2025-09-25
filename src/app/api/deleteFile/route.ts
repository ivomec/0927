import { NextResponse } from 'next/server';
// 1. 중앙 모듈에서 이미 초기화된 객체를 직접 import 합니다.
import { storage, firestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  let data;
  try {
    data = await request.json();
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { storagePath, patientId, collectionName, fileId } = data;
  
  if (!storagePath || !patientId || !collectionName || !fileId) {
    return new NextResponse(JSON.stringify({ message: 'Missing required parameters' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // 2. 이미 준비된 객체를 바로 사용합니다. 초기화 코드가 완전히 사라졌습니다.
  const bucket = storage.bucket(); 
  const fileRef = bucket.file(storagePath);
  const docRef = firestore.collection('patients').doc(patientId).collection(collectionName).doc(fileId);

  try {
    // Promise.allSettled를 사용하여 스토리지와 파이어스토어 삭제를 동시에 시도합니다.
    const [storageResult, firestoreResult] = await Promise.allSettled([
      fileRef.delete(),
      docRef.delete()
    ]);

    const errors = [];
    if (storageResult.status === 'rejected') {
      // 스토리지 파일이 이미 없는 경우(404)는 성공으로 간주합니다.
      if ((storageResult.reason as any).code !== 404) {
        errors.push(`Storage deletion failed: ${storageResult.reason.message}`);
      }
    }
    if (firestoreResult.status === 'rejected') {
      errors.push(`Firestore deletion failed: ${firestoreResult.reason.message}`);
    }

    if (errors.length > 0) {
      // 일부 작업이 실패했더라도, 심각한 오류로 간주하고 로그를 남깁니다.
      console.error('Partial failure during deletion:', errors.join('; '));
      return new NextResponse(JSON.stringify({ success: false, message: `Partial failure: ${errors.join('; ')}` }), { status: 500 });
    }

    return new NextResponse(JSON.stringify({ success: true, message: 'File and document deleted successfully.' }), { status: 200 });
    
  } catch (e: any) {
    console.error('Critical error during file deletion process:', e.message);
    return new NextResponse(JSON.stringify({ success: false, message: `An unexpected error occurred: ${e.message}` }), { status: 500 });
  }
}
