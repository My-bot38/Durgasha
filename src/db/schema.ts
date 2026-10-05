CREATE TABLE IF NOT EXISTS playlists (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS songs (
  id serial PRIMARY KEY,
  playlist_id integer NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '0:00',
  audio_url text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credits (
  id serial PRIMARY KEY,
  name text NOT NULL,
  photo_url text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1,
  hero_title text NOT NULL DEFAULT 'পুজো আসছে',
  target_date timestamp,
  hero_image_url text NOT NULL DEFAULT '',
  online_count integer NOT NULL DEFAULT 125,
  spotify_url text NOT NULL DEFAULT '',
  youtube_url text NOT NULL DEFAULT '',
  credit_heading text NOT NULL DEFAULT 'MADE WITH BHALOBASHA BY',
  contact_email text NOT NULL DEFAULT 'devipakshaa@gmail.com'
);
