import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: "Missing uid parameter" }, { status: 400 });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    const snapshot = await adminDb.collection('workspaces')
      .where('ownerId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const workspaces: any[] = [];
    snapshot.forEach((doc) => {
      workspaces.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('GET workspaces error:', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, name, description } = await req.json();

    if (!uid || !name) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    const newDoc = await adminDb.collection('workspaces').add({
      ownerId: uid,
      name: name.trim(),
      description: description?.trim() || '',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: newDoc.id });
  } catch (error) {
    console.error('POST workspaces error:', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const uid = searchParams.get('uid');

    if (!id || !uid) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    const docRef = adminDb.collection('workspaces').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (doc.data()?.ownerId !== uid) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // 1. Delete the workspace
    await docRef.delete();

    // 2. (Optional but clean) Disconnect memories associated with this workspace
    const memoriesSnapshot = await adminDb.collection('memories')
      .where('workspaceId', '==', id)
      .get();
      
    const batch = adminDb.batch();
    memoriesSnapshot.forEach((doc) => {
      // We either delete them or set workspaceId to null
      batch.update(doc.ref, { workspaceId: null });
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE workspace error:', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
