
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined',
  });
}
