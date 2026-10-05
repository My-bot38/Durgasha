import { db } from "@/db";
import { songs } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title || typeof body.title !== "string") {
    return Response.json({ error: "title is required" }, { status: 400 });
  }
  if (!body.playlistId) {
    return Response.json({ error: "playlistId is required" }, { status: 400 });
  }
  const [row] = await db
    .insert(songs)
    .values({
      playlistId: Number(body.playlistId),
      title: body.title,
      artist: typeof body.artist === "string" ? body.artist : "",
      duration: typeof body.duration === "string" ? body.duration : "0:00",
      audioUrl: typeof body.audioUrl === "string" ? body.audioUrl : "",
      coverUrl: typeof body.coverUrl === "string" ? body.coverUrl : "",
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : Date.now() % 100000,
    })
    .returning();
  return Response.json(row);
}
