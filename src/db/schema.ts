-- PLAYLISTS
CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- SONGS
CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '' NOT NULL,
  duration TEXT DEFAULT '0:00' NOT NULL,
  audio_url TEXT DEFAULT '' NOT NULL,
  cover_url TEXT DEFAULT '' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- CREDITS
CREATE TABLE credits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT DEFAULT '' NOT NULL,
  linkedin_url TEXT DEFAULT '' NOT NULL,
  instagram_url TEXT DEFAULT '' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL
);

-- SETTINGS
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hero_title TEXT DEFAULT 'পুজো আসছে' NOT NULL,
  target_date TIMESTAMP,
  hero_image_url TEXT DEFAULT '' NOT NULL,
  online_count INTEGER DEFAULT 125 NOT NULL,
  spotify_url TEXT DEFAULT '' NOT NULL,
  youtube_url TEXT DEFAULT '' NOT NULL,
  credit_heading TEXT DEFAULT 'MADE DURGA PUJA SONGS BY' NOT NULL,
  contact_email TEXT DEFAULT 'apusarkar20230@gmail.com' NOT NULL
);

-- Default settings row
INSERT INTO settings (id) VALUES (1);
