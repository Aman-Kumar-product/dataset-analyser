import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const clusterId = url.searchParams.get('id');

    if (!clusterId) {
      return NextResponse.json({ error: 'Cluster ID is required' }, { status: 400 });
    }

    const workerDir = path.resolve(process.cwd(), '../worker');
    const filePath = path.join(workerDir, `cluster_${clusterId}.csv`);
    
    const fileBuffer = await readFile(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="cluster_${clusterId}.csv"`,
        'Content-Type': 'text/csv',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Cluster file not found. Ensure synthesis has completed.' }, { status: 404 });
  }
}
