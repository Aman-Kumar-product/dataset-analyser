import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    // Forward the form data to FastAPI
    const res = await fetch(`${API_URL}/api/cluster`, {
      method: 'POST',
      headers: {
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: formData,
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'FastAPI clustering failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Clustering completed successfully'
    });
    
  } catch (error: any) {
    console.error("Clustering Error:", error);
    return NextResponse.json({ error: error.message || 'Unknown error during clustering' }, { status: 500 });
  }
}
