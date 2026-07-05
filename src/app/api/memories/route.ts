import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch('http://localhost:4000/api/smi/nodes');
    if (!res.ok) {
      throw new Error('Failed to fetch nodes from local SML');
    }
    const data = await res.json();
    
    // Map local SQLite nodes to the format expected by MemoryHistory.tsx
    const memories = (data.nodes || []).map((node: any) => ({
      id: node.id,
      content: node.content,
      source: node.provenance?.appName || 'saule-terminal',
      createdAt: node.createdAt, // is a timestamp number
      workspaceId: node.spaceId,
      packageId: node.spaceId // group under the spaceId/packageId node
    }));

    return NextResponse.json({ success: true, memories });
  } catch (error: any) {
    console.error('GET memories error:', error);
    return NextResponse.json({ error: "Internal Error", message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const res = await fetch(`http://localhost:4000/api/smi/nodes/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete node from local SML');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE memory error:', error);
    return NextResponse.json({ error: "Internal Error", message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Simple stub returning success as we manage node editing through recall and ingestion updates
  return NextResponse.json({ success: true });
}
