-- AlterTable
ALTER TABLE "Avatar"
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN "accent" TEXT NOT NULL DEFAULT '#a8a878',
  ADD COLUMN "accentHover" TEXT NOT NULL DEFAULT '#939364';

-- Seed/Sync avatar catalog to new profile-icons assets
INSERT INTO "Avatar" ("id", "name", "type", "url", "accent", "accentHover") VALUES
('avatar_alder',       'Esper',   'esper',   '/profile-icons/esper_icon.jpg',      '#f85888', '#e24a79'),
('avatar_cynthia',     'Kusa',    'kusa',    '/profile-icons/kusa_icon.jpg',       '#78c850', '#64ae3f'),
('avatar_n',           'Honoh',   'honoh',   '/profile-icons/honoh_icon.jpg',      '#f08030', '#d96f25'),
('avatar_red',         'Mizu',    'mizu',    '/profile-icons/mizu_icon.jpg',       '#6890f0', '#4f79dd'),
('avatar_ace_f',       'Denki',   'denki',   '/profile-icons/denki_icon.jpg',      '#f8d030', '#dfbb27'),
('avatar_ace_m',       'Normal',  'normal',  '/profile-icons/normal_icon.jpg',     '#a8a878', '#939364'),
('avatar_artist',      'Kohri',   'kohri',   '/profile-icons/kohri_icon.jpg',      '#98d8d8', '#80c2c2'),
('avatar_backers_f',   'Iwa',     'iwa',     '/profile-icons/iwa_icon.jpg',        '#b8a038', '#a08b2c'),
('avatar_backers_m',   'Jimen',   'jimen',   '/profile-icons/jimen_icon.jpg',      '#e0c068', '#ccac53'),
('avatar_backpacker',  'Hikoh',   'hikoh',   '/profile-icons/hikoh_icon.jpg',      '#a890f0', '#9178dc'),
('avatar_baker',       'Fairy',   'fairy',   '/profile-icons/fairy_icon.jpg',      '#ee99ac', '#db8599'),
('avatar_battle_girl', 'Mushi',   'mushi',   '/profile-icons/mushi_icon.jpg',      '#a8b820', '#919f16'),
('avatar_biker',       'Doku',    'doku',    '/profile-icons/doku_icon.jpg',       '#a040a0', '#8b318b'),
('avatar_benga',       'Ghost',   'ghost',   '/profile-icons/gohst_icon.jpg',      '#705898', '#5d4684'),
('avatar_bianca',      'Aku',     'aku',     '/profile-icons/aku_icon.jpg',        '#705848', '#5f4839'),
('avatar_blaine',      'Hagane',  'hagane',  '/profile-icons/hagane_icon.jpg',     '#b8b8d0', '#a1a1b8'),
('avatar_hilda',       'Kakutoh', 'kakutoh', '/profile-icons/kakutoh_icon.jpg',    '#c03028', '#ab241d'),
('avatar_fantina',     'Dragon',  'dragon',  '/profile-icons/dragon_icon.jpg',     '#7038f8', '#5f2fe0'),
('avatar_hoopster',    'Rival',   'rival',   '/profile-icons/rivalTeto_icon.jpg',  '#f05060', '#de3f50')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "url" = EXCLUDED."url",
  "accent" = EXCLUDED."accent",
  "accentHover" = EXCLUDED."accentHover";
