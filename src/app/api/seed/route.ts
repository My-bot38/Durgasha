import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSettings } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSettings();
  return Response.json(data);
}

export async function PUT(request: Request) {
  const body = await request.json();
  await getSettings(); // ensure row exists

  const update: Record<string, unknown> = {};
  if (typeof body.heroTitle === "string") update.heroTitle = body.heroTitle;
  if (typeof body.heroImageUrl === "string")
    update.heroImageUrl = body.heroImageUrl;
  if (typeof body.onlineCount === "number")
    update.onlineCount = body.onlineCount;
  if (typeof body.spotifyUrl === "string") update.spotifyUrl = body.spotifyUrl;
  if (typeof body.youtubeUrl === "string") update.youtubeUrl = body.youtubeUrl;
  if (typeof body.creditHeading === "string")
    update.creditHeading = body.creditHeading;
  if (typeof body.contactEmail === "string")
    update.contactEmail = body.contactEmail;
  if (body.targetDate === null) update.targetDate = null;
  else if (typeof body.targetDate === "string")
    update.targetDate = new Date(body.targetDate);

  await db.update(settings).set(update).where(eq(settings.id, 1));
  const data = await getSettings();
  return Response.json(data);
}
