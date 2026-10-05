import { db } from "@/db";
import { playlists } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string") update.name = body.name;
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.sortOrder === "number") update.sortOrder = body.sortOrder;

  const [row] = await db
    .update(playlists)
    .set(update)
    .where(eq(playlists.id, Number(id)))
    .returning();
  return Response.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(playlists).where(eq(playlists.id, Number(id)));
  return Response.json({ ok: true });
}
