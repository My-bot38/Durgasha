import Link from "next/link";
import PujoApp from "@/components/PujoApp";
import {
  getPlaylistsWithSongs,
  getCredits,
  getSettings,
} from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [playlists, credits, settings] = await Promise.all([
    getPlaylistsWithSongs(),
    getCredits(),
    getSettings(),
  ]);

  return (
    <>
      <PujoApp
        initialPlaylists={playlists}
        credits={credits}
        settings={settings}
      />
      <Link
        href="/admin"
        className="fixed bottom-2 right-2 z-50 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/40 backdrop-blur hover:text-white/80"
      >
        ⚙ Admin
      </Link>
    </>
  );
}
