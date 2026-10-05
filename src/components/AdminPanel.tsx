"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  PlaylistWithSongs,
  CreditRow,
  SettingsRow,
  SongRow,
} from "@/db/queries";
import ImageField from "@/components/ImageField";

type Tab = "songs" | "credits" | "settings";

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

const emptySong = {
  title: "",
  artist: "",
  duration: "",
  audioUrl: "",
  coverUrl: "",
};

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("songs");
  const [playlists, setPlaylists] = useState<PlaylistWithSongs[]>([]);
  const [credits, setCredits] = useState<CreditRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [activePl, setActivePl] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const [pl, cr, st] = await Promise.all([
      api("/api/playlists", "GET"),
      api("/api/credits", "GET"),
      api("/api/settings", "GET"),
    ]);
    setPlaylists(pl);
    setCredits(cr);
    setSettings(st);
    setActivePl((prev) => prev ?? pl[0]?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const seed = async () => {
    await api("/api/seed", "POST");
    await reload();
  };

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-white/60">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span style={{ color: "var(--pujo-gold)" }}>পুজো</span> Admin
          </h1>
          <Link
            href="/"
            className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            ← View Site
          </Link>
        </div>
        <p className="mt-1 text-sm text-white/50">
          Easily add songs, photos and update your Durga Puja site here.
        </p>

        {playlists.length === 0 && (
          <button
            onClick={seed}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
          >
            Load starter content (demo songs)
          </button>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-white/10">
          {(["songs", "credits", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold capitalize transition ${
                tab === t
                  ? "border-amber-400 text-white"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {t === "songs" ? "Songs & Playlists" : t}
            </button>
          ))}
        </div>

        {tab === "songs" && (
          <SongsTab
            playlists={playlists}
            activePl={activePl}
            setActivePl={setActivePl}
            reload={reload}
          />
        )}
        {tab === "credits" && (
          <CreditsTab credits={credits} reload={reload} />
        )}
        {tab === "settings" && settings && (
          <SettingsTab settings={settings} reload={reload} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Songs & Playlists ---------------- */

function SongsTab({
  playlists,
  activePl,
  setActivePl,
  reload,
}: {
  playlists: PlaylistWithSongs[];
  activePl: number | null;
  setActivePl: (id: number) => void;
  reload: () => Promise<void>;
}) {
  const [newPlaylist, setNewPlaylist] = useState("");
  const current = playlists.find((p) => p.id === activePl) ?? playlists[0];
  const [form, setForm] = useState({ ...emptySong });
  const [editId, setEditId] = useState<number | null>(null);

  const addPlaylist = async () => {
    if (!newPlaylist.trim()) return;
    await api("/api/playlists", "POST", { name: newPlaylist.trim() });
    setNewPlaylist("");
    await reload();
  };

  const deletePlaylist = async (id: number) => {
    if (!confirm("Delete this playlist and all its songs?")) return;
    await api(`/api/playlists/${id}`, "DELETE");
    await reload();
  };

  const saveSong = async () => {
    if (!current) {
      alert("Create a playlist first.");
      return;
    }
    if (!form.title.trim()) {
      alert("Song title is required.");
      return;
    }
    if (editId) {
      await api(`/api/songs/${editId}`, "PUT", form);
    } else {
      await api("/api/songs", "POST", { ...form, playlistId: current.id });
    }
    setForm({ ...emptySong });
    setEditId(null);
    await reload();
  };

  const editSong = (s: SongRow) => {
    setEditId(s.id);
    setForm({
      title: s.title,
      artist: s.artist,
      duration: s.duration,
      audioUrl: s.audioUrl,
      coverUrl: s.coverUrl,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSong = async (id: number) => {
    if (!confirm("Delete this song?")) return;
    await api(`/api/songs/${id}`, "DELETE");
    await reload();
  };

  return (
    <div className="mt-5">
      {/* Playlist selector */}
      <div className="flex flex-wrap items-center gap-2">
        {playlists.map((p) => (
          <div key={p.id} className="flex items-center">
            <button
              onClick={() => setActivePl(p.id)}
              className={`rounded-l-full px-4 py-1.5 text-sm font-semibold ${
                p.id === current?.id
                  ? "bg-amber-500 text-black"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {p.name}
            </button>
            <button
              onClick={() => deletePlaylist(p.id)}
              className={`rounded-r-full px-2 py-1.5 text-sm ${
                p.id === current?.id
                  ? "bg-amber-600 text-black"
                  : "bg-white/5 text-white/40"
              }`}
              title="Delete playlist"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={newPlaylist}
          onChange={(e) => setNewPlaylist(e.target.value)}
          placeholder="New playlist name (e.g. MAHALAYA)"
          className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
        />
        <button
          onClick={addPlaylist}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
        >
          + Playlist
        </button>
      </div>

      {/* Add / edit song form */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 font-semibold">
          {editId ? "Edit song" : "Add a song"}
          {current ? (
            <span className="text-white/40"> → {current.name}</span>
          ) : null}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Song title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Artist
            </label>
            <input
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Duration (m:ss)
            </label>
            <input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="3:20"
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <ImageField
            label="Song audio (URL or upload mp3)"
            value={form.audioUrl}
            onChange={(v) => setForm({ ...form, audioUrl: v })}
            placeholder="https://…/song.mp3"
          />
          <div className="sm:col-span-2">
            <ImageField
              label="Cover photo (URL or upload image)"
              value={form.coverUrl}
              onChange={(v) => setForm({ ...form, coverUrl: v })}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={saveSong}
            className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400"
          >
            {editId ? "Save changes" : "Add song"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({ ...emptySong });
              }}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Song list */}
      <div className="mt-6 space-y-2">
        {current?.songs.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2"
          >
            <span className="w-6 text-center text-sm text-white/40">
              {i + 1}
            </span>
            {s.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.coverUrl}
                alt=""
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-md bg-white/10">
                🎵
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.title}</p>
              <p className="truncate text-xs text-white/50">
                {s.artist} {s.audioUrl ? "· 🔊" : ""}
              </p>
            </div>
            <span className="text-xs text-white/40">{s.duration}</span>
            <button
              onClick={() => editSong(s)}
              className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            >
              Edit
            </button>
            <button
              onClick={() => deleteSong(s.id)}
              className="rounded-md bg-rose-500/20 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/30"
            >
              Delete
            </button>
          </div>
        ))}
        {current && current.songs.length === 0 && (
          <p className="py-6 text-center text-sm text-white/40">
            No songs in this playlist yet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Credits ---------------- */

function CreditsTab({
  credits,
  reload,
}: {
  credits: CreditRow[];
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    photoUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  const save = async () => {
    if (!form.name.trim()) {
      alert("Name required");
      return;
    }
    if (editId) await api(`/api/credits/${editId}`, "PUT", form);
    else await api("/api/credits", "POST", form);
    setForm({ name: "", photoUrl: "", linkedinUrl: "", instagramUrl: "" });
    setEditId(null);
    await reload();
  };

  const edit = (c: CreditRow) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      photoUrl: c.photoUrl,
      linkedinUrl: c.linkedinUrl,
      instagramUrl: c.instagramUrl,
    });
  };

  const del = async (id: number) => {
    if (!confirm("Delete this person?")) return;
    await api(`/api/credits/${id}`, "DELETE");
    await reload();
  };

  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 font-semibold">
          {editId ? "Edit person" : "Add person to credits"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <ImageField
            label="Photo (URL or upload)"
            value={form.photoUrl}
            onChange={(v) => setForm({ ...form, photoUrl: v })}
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              LinkedIn URL
            </label>
            <input
              value={form.linkedinUrl}
              onChange={(e) =>
                setForm({ ...form, linkedinUrl: e.target.value })
              }
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Instagram URL
            </label>
            <input
              value={form.instagramUrl}
              onChange={(e) =>
                setForm({ ...form, instagramUrl: e.target.value })
              }
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={save}
            className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400"
          >
            {editId ? "Save" : "Add"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({
                  name: "",
                  photoUrl: "",
                  linkedinUrl: "",
                  instagramUrl: "",
                });
              }}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {credits.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2"
          >
            {c.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.photoUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                👤
              </div>
            )}
            <span className="flex-1 text-sm font-semibold">{c.name}</span>
            <button
              onClick={() => edit(c)}
              className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            >
              Edit
            </button>
            <button
              onClick={() => del(c.id)}
              className="rounded-md bg-rose-500/20 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/30"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */

function SettingsTab({
  settings,
  reload,
}: {
  settings: SettingsRow;
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    heroTitle: settings.heroTitle,
    heroImageUrl: settings.heroImageUrl,
    onlineCount: settings.onlineCount,
    spotifyUrl: settings.spotifyUrl,
    youtubeUrl: settings.youtubeUrl,
    creditHeading: settings.creditHeading,
    contactEmail: settings.contactEmail,
    targetDate: settings.targetDate
      ? new Date(settings.targetDate).toISOString().slice(0, 10)
      : "",
  });
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await api("/api/settings", "PUT", {
      ...form,
      onlineCount: Number(form.onlineCount) || 0,
      targetDate: form.targetDate ? form.targetDate : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    await reload();
  };

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">
            Hero title (Bengali)
          </label>
          <input
            value={form.heroTitle}
            onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">
            Durga Puja date (for countdown)
          </label>
          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">
            Online count
          </label>
          <input
            type="number"
            value={form.onlineCount}
            onChange={(e) =>
              setForm({ ...form, onlineCount: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
        <div className="sm:col-span-2">
          <ImageField
            label="Hero background image (URL or upload)"
            value={form.heroImageUrl}
            onChange={(v) => setForm({ ...form, heroImageUrl: v })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">
            Spotify URL
          </label>
          <input
            value={form.spotifyUrl}
            onChange={(e) => setForm({ ...form, spotifyUrl: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">
            YouTube URL
          </label>
          <input
            value={form.youtubeUrl}
            onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">
            Credits heading
          </label>
          <input
            value={form.creditHeading}
            onChange={(e) =>
              setForm({ ...form, creditHeading: e.target.value })
            }
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">
            Contact email
          </label>
          <input
            value={form.contactEmail}
            onChange={(e) =>
              setForm({ ...form, contactEmail: e.target.value })
            }
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
      </div>
      <button
        onClick={save}
        className="mt-4 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400"
      >
        {saved ? "Saved ✓" : "Save settings"}
      </button>
    </div>
  );
}
