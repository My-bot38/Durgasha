import { db } from "@/db";
import { credits } from "@/db/schema";
import { getCredits } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCredits();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || typeof body.name !== "string") {
    return Response.json({ error: "name is required" }, { status: 400 });
  }
  const [row] = await db
    .insert(credits)
    .values({
      name: body.name,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : "",
      linkedinUrl: typeof body.linkedinUrl === "string" ? body.linkedinUrl : "",
      instagramUrl:
        typeof body.instagramUrl === "string" ? body.instagramUrl : "",
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : Date.now() % 100000,
    })
    .returning();
  return Response.json(row);
}
