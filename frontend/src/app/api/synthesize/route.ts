import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    const res = await fetch(`${API_URL}/api/synthesize`, {
      method: 'POST',
      headers: {
        'Bypass-Tunnel-Reminder': 'true'
      }
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'FastAPI synthesis failed');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("Synthesis API Route Error:", error);
    return NextResponse.json({ error: error.message || 'Unknown error during synthesis' }, { status: 500 });
  }
}
