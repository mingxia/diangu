PRAGMA foreign_keys=ON;

-- Editorial frequency: 1 rare, 2 uncommon, 3 normal, 4 common, 5 very common.
-- It is deliberately attached to an expression, not its shared origin story.
ALTER TABLE allusions ADD COLUMN frequency_level INTEGER NOT NULL DEFAULT 3 CHECK(frequency_level BETWEEN 1 AND 5);
ALTER TABLE allusions ADD COLUMN frequency_note TEXT NOT NULL DEFAULT '';
CREATE INDEX allusions_frequency_idx ON allusions(frequency_level);

CREATE TABLE allusion_origins(
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  classical_text TEXT NOT NULL DEFAULT '',
  vernacular_story TEXT NOT NULL DEFAULT '',
  story_dynasty TEXT,
  story_period TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN('draft','review','published','archived')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX origins_status_idx ON allusion_origins(status);

CREATE TABLE allusion_origin_links(
  allusion_id TEXT NOT NULL REFERENCES allusions(id) ON DELETE CASCADE,
  origin_id TEXT NOT NULL REFERENCES allusion_origins(id) ON DELETE RESTRICT,
  relation_type TEXT NOT NULL DEFAULT 'derived' CHECK(relation_type IN('derived','variant','related')),
  is_primary INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(allusion_id,origin_id)
);
CREATE INDEX ao_origin_idx ON allusion_origin_links(origin_id);

CREATE TABLE origin_sources(
  id TEXT PRIMARY KEY,
  origin_id TEXT NOT NULL REFERENCES allusion_origins(id) ON DELETE CASCADE,
  work_id TEXT REFERENCES works(id),
  source_type TEXT NOT NULL CHECK(source_type IN('primary','secondary','transmission','related')),
  chapter TEXT,
  original_text TEXT,
  translation TEXT,
  note TEXT,
  reference_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX origin_sources_origin_idx ON origin_sources(origin_id);
CREATE INDEX origin_sources_work_idx ON origin_sources(work_id);
