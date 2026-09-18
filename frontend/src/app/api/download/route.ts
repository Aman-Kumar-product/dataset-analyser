import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const workerDir = path.resolve(process.cwd(), '../worker');
    const filePath = path.join(workerDir, 'filtered_clusters.csv');
    
    const fileBuffer = await readFile(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="filtered_clusters.csv"',
        'Content-Type': 'text/csv',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'File not found. Please run clustering first.' }, { status: 404 });
  }
}
