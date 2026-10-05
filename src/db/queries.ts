import { db } from "@/db";
import { playlists, songs, credits, settings } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type SongRow = typeof songs.$inferSelect;
export type PlaylistRow = typeof playlists.$inferSelect;
export type CreditRow = typeof credits.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;

export type PlaylistWithSongs = PlaylistRow & { songs: SongRow[] };

const DEFAULT_SETTINGS: SettingsRow = {
  id: 1,
  heroTitle: "পুজো আসছে",
  targetDate: null,
  heroImageUrl: "/images/hero-pandal.jpg",
  onlineCount: 125,
  spotifyUrl: "https://open.spotify.com/playlist/4rIH4jRR8IlCFAzM0SPgZM?si=jwoiZTDeSd6dWjxe9NCnSA&utm_source=copy-link&pi=Lpq4pq2EQuKvT",
  youtubeUrl: "",
  creditHeading: "MADE DURGA PUJO SONGS BY",
  contactEmail: "apusarkar20230@gmail.com",
};

export async function getSettings(): Promise<SettingsRow> {
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  if (rows.length === 0) {
    await db.insert(settings).values(DEFAULT_SETTINGS).onConflictDoNothing();
    return DEFAULT_SETTINGS;
  }
  return rows[0];
}

export async function getPlaylistsWithSongs(): Promise<PlaylistWithSongs[]> {
  const pls = await db
    .select()
    .from(playlists)
    .orderBy(asc(playlists.sortOrder), asc(playlists.id));

  const allSongs = await db
    .select()
    .from(songs)
    .orderBy(asc(songs.sortOrder), asc(songs.id));

  return pls.map((p) => ({
    ...p,
    songs: allSongs.filter((s) => s.playlistId === p.id),
  }));
}

export async function getCredits(): Promise<CreditRow[]> {
  return db
    .select()
    .from(credits)
    .orderBy(asc(credits.sortOrder), asc(credits.id));
}
