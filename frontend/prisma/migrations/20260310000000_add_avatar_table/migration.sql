-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "user" ADD COLUMN "avatarId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SeedAvatars
INSERT INTO "Avatar" ("id", "name", "url") VALUES
('avatar_alder',      'Alder',         'https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png'),
('avatar_cynthia',    'Cynthia',        'https://archives.bulbagarden.net/media/upload/8/83/Spr_B2W2_Cynthia.png?20230903232805'),
('avatar_n',          'N',              'https://archives.bulbagarden.net/media/upload/2/2c/Spr_B2W2_N.png'),
('avatar_red',        'Red',            'https://archives.bulbagarden.net/media/upload/9/9a/Spr_B2W2_Red.png'),
('avatar_ace_f',      'Ace Trainer F',  'https://archives.bulbagarden.net/media/upload/0/08/Spr_B2W2_Ace_Trainer_F.png?20120803140814'),
('avatar_ace_m',      'Ace Trainer M',  'https://archives.bulbagarden.net/media/upload/3/3a/Spr_B2W2_Ace_Trainer_M.png?20120803140906'),
('avatar_artist',     'Artist',         'https://archives.bulbagarden.net/media/upload/8/8b/Spr_B2W2_Artist.png?20120803140942'),
('avatar_backers_f',  'Backers F',      'https://archives.bulbagarden.net/media/upload/1/1d/Spr_B2W2_Backers_F.png?20120803141026'),
('avatar_backers_m',  'Backers M',      'https://archives.bulbagarden.net/media/upload/c/c8/Spr_B2W2_Backers_M.png?20120803141141'),
('avatar_backpacker', 'Backpacker',     'https://archives.bulbagarden.net/media/upload/7/7c/Spr_B2W2_Backpacker_F.png?20120804041232'),
('avatar_baker',      'Baker',          'https://archives.bulbagarden.net/media/upload/2/26/Spr_B2W2_Baker.png?20120804041716'),
('avatar_battle_girl','Battle Girl',    'https://archives.bulbagarden.net/media/upload/5/5a/Spr_B2W2_Battle_Girl.png?20120804041754'),
('avatar_biker',      'Biker',          'https://archives.bulbagarden.net/media/upload/e/e3/Spr_B2W2_Biker.png?20120804041833'),
('avatar_benga',      'Benga',          'https://archives.bulbagarden.net/media/upload/f/f7/Spr_B2W2_Benga.png?20120730113241'),
('avatar_bianca',     'Bianca',         'https://archives.bulbagarden.net/media/upload/f/f0/Spr_B2W2_Bianca.png?20120815030804'),
('avatar_blaine',     'Blaine',         'https://archives.bulbagarden.net/media/upload/1/11/Spr_B2W2_Blaine.png?20120730113411'),
('avatar_hilda',      'Hilda',          'https://archives.bulbagarden.net/media/upload/7/78/Spr_B2W2_Hilda.png?20120731133300'),
('avatar_fantina',    'Fantina',        'https://archives.bulbagarden.net/media/upload/5/5d/Spr_B2W2_Fantina.png?20120730120504'),
('avatar_hoopster',   'Hoopster',       'https://archives.bulbagarden.net/media/upload/a/a6/Spr_B2W2_Hoopster.png?20120804043508'),
('avatar_lady',       'Lady',           'https://archives.bulbagarden.net/media/upload/e/e0/Spr_B2W2_Lady.png?20120804043704')
ON CONFLICT ("id") DO NOTHING;
