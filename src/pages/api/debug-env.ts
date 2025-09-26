import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined',
  });
}
