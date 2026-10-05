import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// Playlists shown as tabs in the Playlists modal (e.g. DURGA PUJA, MAHALAYA)
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Songs belonging to a playlist
export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id")
    .references(() => playlists.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  artist: text("artist").default("").notNull(),
  duration: text("duration").default("0:00").notNull(),
  audioUrl: text("audio_url").default("").notNull(),
  coverUrl: text("cover_url").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// People shown in the "Made with bhalobasha by" credits modal
export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url").default("").notNull(),
  linkedinUrl: text("linkedin_url").default("").notNull(),
  instagramUrl: text("instagram_url").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

// Single-row site settings (id = 1)
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  heroTitle: text("hero_title").default("পুজো আসছে").notNull(),
  targetDate: timestamp("target_date"),
  heroImageUrl: text("hero_image_url").default("").notNull(),
  onlineCount: integer("online_count").default(125).notNull(),
  spotifyUrl: text("spotify_url").default("").notNull(),
  youtubeUrl: text("youtube_url").default("").notNull(),
  creditHeading: text("credit_heading")
    .default("MADE WITH BHALOBASHA BY")
    .notNull(),
  contactEmail: text("contact_email").default("devipakshaa@gmail.com").notNull(),
});
