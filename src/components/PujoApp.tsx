"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type {
  PlaylistWithSongs,
  SongRow,
  CreditRow,
  SettingsRow,
} from "@/db/queries";
import {
  PlayIcon,
  PauseIcon,
  PrevIcon,
  NextIcon,
  ShuffleIcon,
  RepeatIcon,
  DhakIcon,
  ListIcon,
  ChevronDown,
  CloseIcon,
  PeopleIcon,
  CoffeeIcon,
  SpotifyIcon,
  YoutubeIcon,
  LinkedinIcon,
  InstagramIcon,
  CopyIcon,
} from "@/components/icons";

type Props = {
  initialPlaylists: PlaylistWithSongs[];
  credits: CreditRow[];
  settings: SettingsRow;
};

function parseDuration(d: string): number {
  const parts = d.split(":").map((n) => parseInt(n, 10));
  if (parts.length === 2 && !parts.some(isNaN))
    return parts[0] * 60 + parts[1];
  return 0;
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Cover({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={title} className={className} />;
  }
  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-amber-700 via-orange-800 to-rose-900`}
    >
      <span className="text-lg">🎵</span>
    </div>
  );
}

export default function PujoApp({
  initialPlaylists,
  credits,
  settings,
}: Props) {
  const playlists = initialPlaylists;
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(
    playlists[0]?.id ?? null
  );
  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId) ?? playlists[0],
    [playlists, activePlaylistId]
  );
  const queue: SongRow[] = activePlaylist?.songs ?? [];

  const [currentSongId, setCurrentSongId] = useState<number | null>(
    queue[0]?.id ?? null
  );
  const currentSong = useMemo(
    () => queue.find((s) => s.id === currentSongId) ?? queue[0] ?? null,
    [queue, currentSongId]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(
    currentSong ? parseDuration(currentSong.duration) : 0
  );

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [dhakActive, setDhakActive] = useState(false);

  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasAudio = !!currentSong?.audioUrl;

  const clearSim = () => {
    if (simTimer.current) {
      clearInterval(simTimer.current);
      simTimer.current = null;
    }
  };

  const playNext = useCallback(
    (auto = false) => {
      if (queue.length === 0) return;
      if (repeat && auto) {
        setCurrentTime(0);
        setIsPlaying(true);
        return;
      }
      let idx = queue.findIndex((s) => s.id === currentSongId);
      if (shuffle) {
        idx = Math.floor(Math.random() * queue.length);
      } else {
        idx = idx === -1 ? 0 : (idx + 1) % queue.length;
      }
      setCurrentSongId(queue[idx].id);
      setCurrentTime(0);
      setIsPlaying(true);
    },
    [queue, repeat, shuffle, currentSongId]
  );

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSongId);
    const prev = idx <= 0 ? queue.length - 1 : idx - 1;
    setCurrentSongId(queue[prev].id);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [queue, currentSongId]);

  // When song changes, reset times
  useEffect(() => {
    setCurrentTime(0);
    setTotalTime(currentSong ? parseDuration(currentSong.duration) : 0);
  }, [currentSong]);

  // Real audio handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, hasAudio, currentSong]);

  // Simulated playback when no audio url
  useEffect(() => {
    clearSim();
    if (!isPlaying || hasAudio) return;
    simTimer.current = setInterval(() => {
      setCurrentTime((t) => {
        if (t + 1 >= totalTime) {
          clearSim();
          // defer next to avoid state update conflicts
          setTimeout(() => playNext(true), 0);
          return repeat ? 0 : totalTime;
        }
        return t + 1;
      });
    }, 1000);
    return clearSim;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, hasAudio, totalTime, repeat]);

  const togglePlay = () => {
    if (!currentSong) return;
    setIsPlaying((p) => !p);
  };

  const selectSong = (id: number) => {
    setCurrentSongId(id);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowPlaylists(false);
  };

  const onSeek = (val: number) => {
    setCurrentTime(val);
    if (hasAudio && audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(settings.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  // Countdown
  const countdownText = useMemo(() => {
    let target = settings.targetDate ? new Date(settings.targetDate) : null;
    if (!target) {
      // fallback: next Oct 20
      const now = new Date();
      target = new Date(now.getFullYear(), 9, 20);
      if (target.getTime() < now.getTime())
        target = new Date(now.getFullYear() + 1, 9, 20);
    }
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 1) return `${days} days until Durga Pujo`;
    if (days === 1) return `1 day until Durga Pujo`;
    if (days === 0) return `Durga Pujo is here! 🌸`;
    return `Shubho Sharodiya! 🌼`;
  }, [settings.targetDate]);

  const progressPct = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Cover
          src={settings.heroImageUrl}
          title="pandal"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black" />
      </div>

      {/* Hidden audio element */}
      {currentSong?.audioUrl ? (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onLoadedMetadata={(e) =>
            setTotalTime(e.currentTarget.duration || totalTime)
          }
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => playNext(true)}
        />
      ) : null}

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-4 pb-44 pt-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 backdrop-blur-md">
            <span className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-green-400" />
            <span className="text-sm font-medium">
              {settings.onlineCount} online
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2.5 backdrop-blur-md">
              <a
                href={settings.youtubeUrl || "#"}
                target={settings.youtubeUrl ? "_blank" : undefined}
                rel="noreferrer"
                className="text-white/90 hover:text-white"
                aria-label="YouTube"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
              <a
                href={settings.spotifyUrl || "#"}
                target={settings.spotifyUrl ? "_blank" : undefined}
                rel="noreferrer"
                className="text-green-400 hover:text-green-300"
                aria-label="Spotify"
              >
                <SpotifyIcon className="h-5 w-5" />
              </a>
            </div>
            <button
              onClick={() => setShowCredits(true)}
              className="rounded-full bg-white/10 p-2.5 backdrop-blur-md hover:bg-white/20"
              aria-label="Credits"
            >
              <PeopleIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowCredits(true)}
              className="rounded-full bg-white/10 p-2.5 backdrop-blur-md hover:bg-white/20"
              aria-label="Support"
            >
              <CoffeeIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero title */}
        <div className="mt-6 text-center">
          <h1
            className="font-bengali text-6xl font-extrabold leading-tight tracking-wide"
            style={{
              color: "var(--pujo-gold)",
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            {settings.heroTitle}
          </h1>
          <p className="mt-1 text-sm text-white/80">{countdownText}</p>
        </div>

        <div className="flex-1" />

        {/* Playlist selector */}
        <div className="flex justify-center pb-2">
          <button
            onClick={() => setShowPlaylists(true)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold tracking-wider backdrop-blur-md hover:bg-white/20"
          >
            <ListIcon className="h-4 w-4" />
            {activePlaylist?.name ?? "PLAYLIST"}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Player bar */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-md px-3 pb-4">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Cover
                src={currentSong?.coverUrl ?? ""}
                title={currentSong?.title ?? ""}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold leading-tight">
                  {currentSong?.title ?? "No song"}
                </p>
                <p className="truncate text-sm text-white/60">
                  {currentSong?.artist ?? ""}
                </p>
                <div className="mt-2">
                  <input
                    type="range"
                    className="pujo-range w-full"
                    min={0}
                    max={totalTime || 0}
                    value={currentTime}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #fff ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%)`,
                      borderRadius: 9999,
                      height: 4,
                    }}
                  />
                  <div className="mt-1 text-xs text-white/50">
                    {formatTime(currentTime)} / {formatTime(totalTime)}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={playPrev}
                  className="p-1.5 text-white/90 hover:text-white"
                  aria-label="Previous"
                >
                  <PrevIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-105"
                  aria-label="Play/Pause"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-6 w-6" />
                  ) : (
                    <PlayIcon className="h-6 w-6 translate-x-0.5" />
                  )}
                </button>
                <button
                  onClick={() => playNext(false)}
                  className="p-1.5 text-white/90 hover:text-white"
                  aria-label="Next"
                >
                  <NextIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Extra controls */}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-sm">
              <button
                onClick={() => setShuffle((s) => !s)}
                className={`flex items-center justify-center gap-2 rounded-lg py-1.5 transition ${
                  shuffle ? "text-amber-400" : "text-white/70 hover:text-white"
                }`}
              >
                <ShuffleIcon className="h-4 w-4" /> Shuffle
              </button>
              <button
                onClick={() => setRepeat((r) => !r)}
                className={`flex items-center justify-center gap-2 rounded-lg py-1.5 transition ${
                  repeat ? "text-amber-400" : "text-white/70 hover:text-white"
                }`}
              >
                <RepeatIcon className="h-4 w-4" /> Repeat
              </button>
              <button
                onClick={() => {
                  setDhakActive(true);
                  setTimeout(() => setDhakActive(false), 600);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-1.5 transition ${
                  dhakActive
                    ? "scale-110 text-amber-400"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <DhakIcon className="h-4 w-4" /> Dhak
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlists modal */}
      {showPlaylists && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPlaylists(false)}
          />
          <div className="relative z-10 w-full max-w-md">
            <div className="mx-3 mb-3 max-h-[82vh] overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl">
              <div className="flex items-center justify-between px-5 pt-5">
                <h2 className="text-lg font-semibold tracking-[0.2em]">
                  PLAYLISTS
                </h2>
                <button
                  onClick={() => setShowPlaylists(false)}
                  className="text-white/60 hover:text-white"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlaylistId(p.id)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      p.id === activePlaylist?.id
                        ? "bg-white/15 text-white"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <p className="px-5 pt-2 text-sm text-white/40">
                {activePlaylist?.description}
              </p>

              {/* Songs */}
              <div className="mt-2 max-h-[58vh] overflow-y-auto px-3 pb-4 no-scrollbar">
                {queue.length === 0 && (
                  <p className="px-2 py-8 text-center text-sm text-white/40">
                    No songs yet. Add some from the admin panel.
                  </p>
                )}
                {queue.map((s, i) => {
                  const active = s.id === currentSong?.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => selectSong(s.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition ${
                        active ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="w-6 text-center text-sm text-white/40">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <Cover
                        src={s.coverUrl}
                        title={s.title}
                        className="h-11 w-11 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold ${
                            active ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {s.title}
                        </p>
                        <p className="truncate text-xs text-white/50">
                          {s.artist}
                        </p>
                      </div>
                      <span className="text-sm text-white/40">
                        {s.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credits modal */}
      {showCredits && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowCredits(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 shadow-2xl">
            <button
              onClick={() => setShowCredits(false)}
              className="absolute right-5 top-5 text-white/60 hover:text-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <h2 className="text-center text-sm font-semibold tracking-[0.25em] text-white/70">
              {settings.creditHeading}
            </h2>

            <div className="mt-6 space-y-4">
              {credits.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/20 to-transparent p-5 text-center"
                >
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-white/10">
                    <Cover
                      src={c.photoUrl}
                      title={c.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-lg font-semibold">{c.name}</p>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    {c.linkedinUrl && (
                      <a
                        href={c.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/10 p-2.5 text-white/80 hover:bg-white/20"
                      >
                        <LinkedinIcon className="h-4 w-4" />
                      </a>
                    )}
                    {c.instagramUrl && (
                      <a
                        href={c.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/10 p-2.5 text-white/80 hover:bg-white/20"
                      >
                        <InstagramIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-white/50">Want to get in touch?</p>
              <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <span className="text-sm text-white/80">
                  {settings.contactEmail}
                </span>
                <button
                  onClick={copyEmail}
                  className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
