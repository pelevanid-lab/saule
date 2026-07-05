import { NextRequest, NextResponse } from 'next/server';
import { execSync, spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    const scriptPath = path.join(process.cwd(), 'scripts', 'manage-sml.js');

    if (action === 'start') {
      // Detached spawn to let the core server run independently in the background
      const child = spawn('node', [scriptPath, 'start'], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore',
        shell: true
      });
      child.unref();

      return NextResponse.json({ success: true, message: "SML server start initiated." });
    }

    if (action === 'stop') {
      // Run stop synchronously as it completes immediately
      execSync(`node "${scriptPath}" stop`, { cwd: process.cwd() });
      return NextResponse.json({ success: true, message: "SML server stopped." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("SML control API error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
