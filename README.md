# Team Aqua Project

> Projet full-stack avec authentification, gestion de rôles et architecture Docker

## 📑 Table des matières

- [Présentation](#présentation)
- [Installation](#installation)
- [Architecture](#architecture)
- [Authentification](#authentification)
- [Rôles](#rôles)
- [Commandes utiles](#commandes-utiles)
- [Configuration](#configuration)

---

## 🎯 Présentation

Projet web moderne avec :
- **Frontend** : Next.js 16 + TailwindCSS + Better Auth
- **Backend** : Express + Prisma + PostgreSQL
- **Authentification** : Better Auth avec gestion de sessions
- **Gestion de rôles** : Système admin/utilisateur
- **Containerisation** : Docker Compose pour l'environnement complet

### Fonctionnalités

- ✅ Inscription et connexion sécurisées
- ✅ Dashboard administrateur avec liste des utilisateurs
- ✅ Page d'accueil pour utilisateurs standards
- ✅ Système de rôles (admin/user)
- ✅ Base de données PostgreSQL persistante
- ✅ API REST avec Express

---

## 🚀 Installation

### Prérequis

- [Docker](https://www.docker.com/) et Docker Compose
- Ports disponibles : 3000 (frontend), 4000 (backend), 5432 (database)

### Démarrage rapide

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd team-aqua-project
```

1.1 **Installation de paquet locaux**
```bash
npm install --save-dev @types/react @types/react-dom
```

2. **Lancer les services**
```bash
docker compose up --build -d
```

3. **Accéder à l'application**
- Frontend : [http://localhost:3000](http://localhost:3000)
- Backend API : [http://localhost:4000/health](http://localhost:4000/health)

4. **Créer votre compte**
- Ouvrez http://localhost:3000
- Cliquez sur "S'inscrire"
- Remplissez le formulaire

### Vérification de l'installation

```bash
# Vérifier que tous les services sont actifs
docker compose ps

# Voir les logs
docker compose logs -f

# Tester le backend
curl http://localhost:4000/health
```

---

## 🏗️ Architecture

```
team-aqua-project/
├── frontend/          # Next.js 16 (port 3000)
│   ├── app/
│   │   ├── page.tsx           # Page de login
│   │   ├── dashboard/         # Dashboard admin
│   │   ├── home/              # Page utilisateur
│   │   └── api/               # API routes Next.js
│   └── lib/
│       ├── auth.ts            # Configuration Better Auth
│       └── auth-client.ts     # Client Better Auth
├── backend/           # Express + Prisma (port 4000)
│   ├── src/
│   │   └── index.ts           # API REST
│   ├── lib/
│   │   └── prisma.ts          # Client Prisma
│   └── prisma/
│       └── schema.prisma      # Schéma base de données
├── db/                # PostgreSQL (port 5432)
└── game-engine/       # Service placeholder (port 5000)
```

### Services Docker

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 3000 | Application Next.js |
| `backend` | 4000 | API Express |
| `db` | 5432 | PostgreSQL 16 |
| `game-engine` | 5000 | Service en attente |

---

## 🔐 Authentification

Le projet utilise **Better Auth** pour gérer l'authentification :

- Inscription avec email/mot de passe/nom
- Connexion avec sessions sécurisées
- Déconnexion
- Protection des routes

### Tables de la base de données

Better Auth crée automatiquement les tables :
- `user` - Utilisateurs
- `session` - Sessions actives
- `account` - Comptes liés (OAuth future)
- `verification` - Tokens de vérification

### Utilisateur de test

```
Email: test@example.com
Password: password123
Rôle: admin
```

---

## 👥 Rôles

Le système distingue deux types d'utilisateurs :

### Admin
- Accès au **dashboard** (`/dashboard`)
- Peut voir tous les utilisateurs
- Peut voir les rôles de chaque utilisateur

### Utilisateur standard
- Accès à la page **home** (`/home`)
- Accès refusé au dashboard

### Promouvoir un utilisateur en admin

```bash
docker compose exec db psql -U postgres -d aqua_temp -c \
  "UPDATE \"user\" SET role = 'admin' WHERE email = 'email@example.com';"
```

### Rétrograder un admin en utilisateur

```bash
docker compose exec db psql -U postgres -d aqua_temp -c \
  "UPDATE \"user\" SET role = 'user' WHERE email = 'email@example.com';"
```

### Voir tous les utilisateurs et leurs rôles

```bash
docker compose exec db psql -U postgres -d aqua_temp -c \
  "SELECT name, email, role, \"createdAt\" FROM \"user\" ORDER BY \"createdAt\";"
```

---

## 🛠️ Commandes utiles

### Docker

```bash
# Démarrer les services
docker compose up -d

# Rebuild et redémarrer
docker compose up --build -d

# Arrêter les services
docker compose down

# Voir les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs frontend -f
docker compose logs backend -f

# Redémarrer un service
docker compose restart backend
```

### Base de données

```bash
# Accéder à PostgreSQL
docker compose exec db psql -U postgres -d aqua_temp

# Voir les tables
docker compose exec db psql -U postgres -d aqua_temp -c "\dt"

# Sauvegarder la base
docker compose exec db pg_dump -U postgres aqua_temp > backup.sql

# Restaurer la base
docker compose exec -T db psql -U postgres -d aqua_temp < backup.sql
```

### Backend (Prisma)

```bash
# Ouvrir Prisma Studio
docker compose exec backend pnpm prisma:studio

# Pousser le schéma vers la DB
docker compose exec backend pnpm prisma:push

# Générer le client Prisma
docker compose exec backend pnpm prisma generate
```

### Frontend (Better Auth)

```bash
# Exécuter les migrations Better Auth
docker compose exec frontend pnpm auth:migrate

# Installer les dépendances
docker compose exec frontend pnpm install
```

---

## ⚙️ Configuration

### Variables d'environnement

#### Frontend (docker-compose.yml)
```yaml
BETTER_AUTH_URL: http://localhost:3000
BETTER_AUTH_SECRET: dev-secret-change-me-please-at-least-32-characters
BETTER_AUTH_DATABASE_URL: postgres://postgres:postgres@db:5432/aqua_temp
```

#### Backend (docker-compose.yml)
```yaml
DATABASE_URL: postgresql://postgres:postgres@db:5432/aqua_temp
PORT: 4000
```

### Ports utilisés

- **3000** : Frontend Next.js
- **4000** : Backend Express
- **5000** : Game engine
- **5432** : PostgreSQL

---

## 📚 Documentation additionnelle

// WIP

---

## 🧹 Nettoyage

```bash
# Arrêter et supprimer tous les conteneurs
docker compose down

# Supprimer aussi les volumes (⚠️ efface la base de données)
docker compose down -v

# Nettoyer les caches locaux
rm -rf frontend/node_modules frontend/.next frontend/.pnpm-store
rm -rf backend/node_modules backend/.pnpm-store backend/dist

# Nettoyer les images Docker
docker system prune -a
```

---

## 📝 License

MIT
