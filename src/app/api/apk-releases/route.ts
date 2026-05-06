import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface ApkRelease {
  name: string;
  fileName: string;
  version: string;
  size: string;
  downloadUrl: string;
  note?: string;
  uploadedAt: string;
  available: boolean;
  locked?: boolean;
}

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'apk-releases.json');
    if (!fs.existsSync(jsonPath)) return NextResponse.json({ releases: [] });
    const releases: ApkRelease[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    return NextResponse.json({ releases });
  } catch (err) {
    console.error('[apk-releases]', err);
    return NextResponse.json({ releases: [] });
  }
}

