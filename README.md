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
- **websockets** : Express + Prisma + PostgreSQL
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
- Ports disponibles : 3000 (frontend), 4001 (websockets), 5432 (database)

### Démarrage rapide

**Option 1 : Script de développement interactif (recommandé)**
```bash
./dev.sh
```

Menu interactif avec toutes les commandes :
- 🚀 Démarrer/redémarrer/arrêter
- 📊 Logs en temps réel
- 🔍 Statut des services
- 👤 Gestion des admins
- 🗄️ Accès base de données

**Option 2 : Commandes manuelles**

1. **Cloner le projet**
```bash
git clone git@github.com:xHemera/team-aqua-project.git
cd team-aqua-project
```

1.1. **Installation de paquet locaux**
```bash
npm install --save-dev @types/react @types/react-dom
```

2. **Lancer les services**
```bash
docker compose up --build -d
```

3. **Accéder à l'application**
- Frontend : [http://localhost:3000](http://localhost:3000)
- websockets API : [http://localhost:4001/health](http://localhost:4001/health)

4. **Créer votre compte**
- Ouvrez http://localhost:3000
- Cliquez sur "S'inscrire"
- Remplissez le formulaire

### Vérification rapide

```bash
# Vérifier tous les services
docker compose ps

# Tester le websockets
curl http://localhost:4001/health

# Tester le frontend
open http://localhost:3000  # ou visitez dans votre navigateur
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
├── websockets/           # Express + Prisma (port 4001)
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
| `websockets` | 4001 | API Express |
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

Un utilisateur admin de test est créé automatiquement au démarrage :

```
Email: test@example.com
Password: password123
Rôle: admin
```

⚠️ **Note** : Cet utilisateur est recréé automatiquement à chaque fois que vous démarrez Docker Compose avec une base de données vide (après `docker compose down -v` ou `docker system prune`).

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

### Script de développement

```bash
./dev.sh  # Menu interactif complet
```

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
docker compose logs websockets -f

# Redémarrer un service
docker compose restart websockets
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

### websockets (Prisma)

```bash
# Ouvrir Prisma Studio
docker compose exec websockets pnpm prisma:studio

# Pousser le schéma vers la DB
docker compose exec websockets pnpm prisma:push

# Générer le client Prisma
docker compose exec websockets pnpm prisma generate
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

### Optimisations

Le projet inclut plusieurs optimisations :
- ⚡ **Healthcheck optimisé** : Base de données prête en ~4s (au lieu de 10s)
- 🔄 **Restart policies** : Redémarrage automatique en cas d'erreur
- 📦 **Volumes persistés** : node_modules et pnpm store mis en cache
- 📄 **Logs optimisés** : Messages clairs et concis
- ⏱️ **Temps de démarrage** : Initialisation réduite de 30s à 20s

### Variables d'environnement

#### Frontend (docker-compose.yml)
```yaml
BETTER_AUTH_URL: http://localhost:3000
BETTER_AUTH_SECRET: dev-secret-change-me-please-at-least-32-characters
BETTER_AUTH_DATABASE_URL: postgres://postgres:postgres@db:5432/aqua_temp
```

#### websockets (docker-compose.yml)
```yaml
DATABASE_URL: postgresql://postgres:postgres@db:5432/aqua_temp
PORT: 4001
```

### Ports utilisés

- **3000** : Frontend Next.js
- **4001** : websockets Express
- **5000** : Game engine
- **5432** : PostgreSQL

---

## 📚 Documentation additionnelle

- [OPTIMIZATIONS.md](OPTIMIZATIONS.md) - Détails des optimisations (performances, nettoyage)
- [BEST_PRACTICES.md](BEST_PRACTICES.md) - Guide des bonnes pratiques de développement
- [AUTH_README.md](AUTH_README.md) - Guide d'authentification détaillé (Better Auth)
- [ROLES_README.md](ROLES_README.md) - Documentation complète du système de rôles
- [setup-roles.sql](setup-roles.sql) - Scripts SQL de gestion des rôles
- [test-auth.sh](test-auth.sh) - Script de test d'authentification

---

## 🧹 Nettoyage

```bash
# Arrêter et supprimer tous les conteneurs
docker compose down

# Supprimer aussi les volumes (⚠️ efface la base de données)
docker compose down -v

# Nettoyer les caches locaux
rm -rf frontend/node_modules frontend/.next frontend/.pnpm-store
rm -rf websockets/node_modules websockets/.pnpm-store websockets/dist

# Nettoyer les images Docker
docker system prune -a
```

---

## 📝 License

MIT
