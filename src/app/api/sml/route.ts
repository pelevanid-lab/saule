import { NextRequest, NextResponse } from 'next/server';
import * as cp from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "SML control is not available in Vercel production deployment." },
        { status: 400 }
      );
    }

    const { action } = await req.json();
    
    // We construct the path using a wrapper function to bypass static tracing of process.cwd()
    const getRoot = () => process.cwd();
    const scriptPath = path.join(getRoot(), 'scripts', 'manage-sml.js');

    if (action === 'start') {
      // Access spawn via bracket notation to prevent Turbopack from tracing the child process targets
      const spawnFn = cp['spawn'];
      const child = spawnFn('node', [scriptPath, 'start'], {
        cwd: getRoot(),
        detached: true,
        stdio: 'ignore',
        shell: true
      });
      child.unref();

      return NextResponse.json({ success: true, message: "SML server start initiated." });
    }

    if (action === 'stop') {
      // Access execSync via bracket notation to prevent Turbopack tracing
      const execSyncFn = cp['execSync'];
      execSyncFn(`node "${scriptPath}" stop`, { cwd: getRoot() });
      return NextResponse.json({ success: true, message: "SML server stopped." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("SML control API error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
