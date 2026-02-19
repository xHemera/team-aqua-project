# team-aqua-project
ft_transcendance at 42 le Havre. Made with love

## Docker (3 conteneurs)

La stack Docker démarre 3 services:

- `frontend` (Next.js) sur le port `3000`
- `backend` sur le port `4001` (conteneur `4000`)
- `game-engine` sur le port `5000`

### Lancer

```bash
docker compose up --build
```

Pour forcer un autre port backend côté hôte:

```bash
BACKEND_PORT=4010 docker compose up --build
```

### Démarrer en arrière-plan

```bash
docker compose up --build -d
```

### Logs

```bash
docker compose logs -f
```

### Arrêter

```bash
docker compose down
```

> `backend` et `game-engine` restent actifs même si les dossiers sont vides.
> Dès qu'un `package.json` est ajouté dans ces dossiers, le conteneur tentera de lancer automatiquement `pnpm dev`/`pnpm start` (ou `npm run dev`/`npm start`).
