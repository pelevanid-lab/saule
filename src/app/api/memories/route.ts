import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateEmbedding } from '@/lib/embeddings';
import { FieldValue } from 'firebase-admin/firestore';

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

    const docRef = adminDb.collection('memories').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    if (doc.data()?.userId !== uid) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE memory error:', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, uid, content, expiresAt } = await req.json();

    if (!id || !uid) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    const docRef = adminDb.collection('memories').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    const data = doc.data()!;
    if (data?.userId !== uid) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const updates: Record<string, any> = {};

    // If content changes, regenerate embedding
    if (content !== undefined && content !== data.content) {
      updates.content = content;
      const embedding = await generateEmbedding(content);
      updates.embedding = FieldValue.vector(embedding);
    }

    if (expiresAt !== undefined) {
      updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await docRef.update(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH memory error:', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
