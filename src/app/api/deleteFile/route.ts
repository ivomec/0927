
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Helper function to write debug logs to a file in the project root
const writeDebugLog = async (logData: any) => {
  // We are in a serverless function environment, writing files is complex.
  // We will rely on console.log and the user checking the terminal output.
  // This function will just format and log to console.
  console.log("--- DEBUG LOG ---");
  console.log(JSON.stringify(logData, null, 2));
  console.log("--- END DEBUG LOG ---");
};


// Helper function to initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: 'chart0927-64ec7.firebasestorage.app',
    });
    return admin.app();
  } catch (error: any) {
    console.error('[CRITICAL] Firebase Admin initialization error:', error.message);
    // Log initialization failure
    writeDebugLog({ step: 'initializeFirebaseAdmin', status: 'FAILED', error: error.message });
    return null;
  }
};

export async function POST(request: Request) {
  const app = initializeFirebaseAdmin();

  if (!app) {
    return NextResponse.json({ success: false, error: 'Server configuration error. Firebase Admin SDK failed to initialize.' }, { status: 500 });
  }

  const requestBody = await request.json();
  const { patientId, collectionName, fileId, storagePath } = requestBody;

  const logPayload = {
    timestamp: new Date().toISOString(),
    requestBody: requestBody,
    steps: [] as { step: string; status: string; path?: string; error?: string }[],
  };

  try {
    if (!patientId || !collectionName || !fileId || !storagePath) {
      logPayload.steps.push({ step: 'validation', status: 'FAILED', error: 'Missing required parameters' });
      await writeDebugLog(logPayload);
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }
    
    logPayload.steps.push({ step: 'validation', status: 'SUCCESS' });

    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    // --- Critical Step: Delete the Firestore document first ---
    const fileDocRef = db.collection('patients').doc(patientId).collection(collectionName).doc(fileId);
    
    try {
        await fileDocRef.delete();
        logPayload.steps.push({ step: 'firestoreDelete', status: 'SUCCESS', path: fileDocRef.path });
    } catch (firestoreError: any) {
        logPayload.steps.push({ step: 'firestoreDelete', status: 'FAILED', path: fileDocRef.path, error: firestoreError.message });
        await writeDebugLog(logPayload);
        throw new Error(`Firestore document deletion failed: ${firestoreError.message}`);
    }

    // --- Secondary Step: Attempt to delete the file from storage ---
    try {
      const file = bucket.file(storagePath);
      await file.delete();
      logPayload.steps.push({ step: 'storageDelete', status: 'SUCCESS', path: storagePath });
    } catch (storageError: any) {
      if (storageError.code === 404) {
        logPayload.steps.push({ step: 'storageDelete', status: 'NOT_FOUND', path: storagePath, error: 'File not in storage, which is acceptable.' });
      } else {
        logPayload.steps.push({ step: 'storageDelete', status: 'WARNING', path: storagePath, error: storageError.message });
      }
    }

    await writeDebugLog(logPayload);
    return NextResponse.json({ success: true, message: 'File record deleted. See server logs for details.' });

  } catch (error: any) {
    logPayload.steps.push({ step: 'overallCatch', status: 'CRITICAL_FAILURE', error: error.message });
    await writeDebugLog(logPayload);
    return NextResponse.json({ success: false, error: `Critical failure: ${error.message}` }, { status: 500 });
  }
}
