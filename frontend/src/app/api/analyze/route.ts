import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save to the worker directory
    const workerDir = path.resolve(process.cwd(), '../worker');
    const filename = `upload_${Date.now()}.csv`;
    const filepath = path.join(workerDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Run python pipeline
    const pythonExecutable = path.join(workerDir, 'venv', 'Scripts', 'python.exe');
    const scriptPath = path.join(workerDir, 'run_pipeline.py');
    
    const command = `"${pythonExecutable}" "${scriptPath}" "${filename}"`;
    
    console.log(`Executing pipeline: ${command}`);
    await execAsync(command, { cwd: workerDir, maxBuffer: 10 * 1024 * 1024 });
    
    // Read the results
    const resultsPath = path.join(workerDir, 'synthesis_results.json');
    const resultsData = await readFile(resultsPath, 'utf8');
    const synthesisResults = JSON.parse(resultsData);
    
    return NextResponse.json({
      success: true,
      message: 'Pipeline executed successfully',
      data: synthesisResults
    });
    
  } catch (error: any) {
    console.error("Pipeline Error:", error);
    return NextResponse.json({ error: error.message || 'Unknown error during analysis' }, { status: 500 });
  }
}
