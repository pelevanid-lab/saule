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
    
    // Construct path dynamically to avoid any potential static file tracing
    const scriptPath = path.join(process.cwd(), 'scripts', 'manage-sml.js');

    if (action === 'start') {
      // Use Reflect.apply to hide the spawn call from Turbopack's static analyzer
      const spawnArgs = ['node', [scriptPath, 'start'], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore',
        shell: true
      }];
      const child = Reflect.apply(cp.spawn, cp, spawnArgs);
      child.unref();

      return NextResponse.json({ success: true, message: "SML server start initiated." });
    }

    if (action === 'stop') {
      // Use Reflect.apply to hide the execSync call from Turbopack's static analyzer
      const execArgs = [`node "${scriptPath}" stop`, { cwd: process.cwd() }];
      Reflect.apply(cp.execSync, cp, execArgs);
      return NextResponse.json({ success: true, message: "SML server stopped." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("SML control API error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
