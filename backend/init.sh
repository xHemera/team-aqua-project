#!/bin/sh

# Installer les dépendances
echo "Installation des dépendances..."
pnpm install --prefer-offline

# Générer le client Prisma
echo "Génération du client Prisma..."
pnpm prisma generate

# Attendre Better Auth (tables user, account, session, verification)
echo "Attente de Better Auth"
sleep 20

# Ajouter la colonne role
echo "Configuration de la colonne role..."
PGPASSWORD=postgres psql -h db -U postgres -d aqua_temp -f prisma/add-role-column.sql > /dev/null 2>&1

# Lancer le serveur
echo "Backend démarré sur le port 4000"
pnpm tsx src/index.ts
