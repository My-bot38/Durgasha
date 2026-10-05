import { db } from "@/db";
import { credits } from "@/db/schema";
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
  if (typeof body.photoUrl === "string") update.photoUrl = body.photoUrl;
  if (typeof body.linkedinUrl === "string") update.linkedinUrl = body.linkedinUrl;
  if (typeof body.instagramUrl === "string")
    update.instagramUrl = body.instagramUrl;
  if (typeof body.sortOrder === "number") update.sortOrder = body.sortOrder;

  const [row] = await db
    .update(credits)
    .set(update)
    .where(eq(credits.id, Number(id)))
    .returning();
  return Response.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(credits).where(eq(credits.id, Number(id)));
  return Response.json({ ok: true });
}
