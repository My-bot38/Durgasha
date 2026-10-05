import { db } from "@/db";
import { songs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.artist === "string") update.artist = body.artist;
  if (typeof body.duration === "string") update.duration = body.duration;
  if (typeof body.audioUrl === "string") update.audioUrl = body.audioUrl;
  if (typeof body.coverUrl === "string") update.coverUrl = body.coverUrl;
  if (typeof body.sortOrder === "number") update.sortOrder = body.sortOrder;
  if (body.playlistId) update.playlistId = Number(body.playlistId);

  const [row] = await db
    .update(songs)
    .set(update)
    .where(eq(songs.id, Number(id)))
    .returning();
  return Response.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(songs).where(eq(songs.id, Number(id)));
  return Response.json({ ok: true });
}
