import { db } from "@/db";
import { playlists } from "@/db/schema";
import { getPlaylistsWithSongs } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPlaylistsWithSongs();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || typeof body.name !== "string") {
    return Response.json({ error: "name is required" }, { status: 400 });
  }
  const [row] = await db
    .insert(playlists)
    .values({
      name: body.name,
      description: typeof body.description === "string" ? body.description : "",
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : Date.now() % 100000,
    })
    .returning();
  return Response.json(row);
}
