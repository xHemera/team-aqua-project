#!/bin/bash

# Script de développement Team Aqua Project

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Vérifier que Docker est en cours d'exécution
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker n'est pas en cours d'exécution"
        exit 1
    fi
    print_success "Docker est prêt"
}

# Menu principal
show_menu() {
    print_header "🌊 Team Aqua Project - Dev Tools"
    echo "1. 🚀 Démarrer tous les services"
    echo "2. 🔄 Redémarrer tous les services"
    echo "3. 🛑 Arrêter tous les services"
    echo "4. 🗑️  Arrêter et nettoyer (volumes inclus)"
    echo "5. 📊 Afficher les logs"
    echo "6. 🔍 Vérifier le statut"
    echo "7. 🗄️  Accéder à la base de données"
    echo "8. 👤 Créer un admin"
    echo "9. 🧪 Tester les services"
    echo "0. 🚪 Quitter"
    echo ""
    read -p "Choix: " choice
}

# Démarrer les services
start_services() {
    print_header "Démarrage des services"
    docker compose up --build -d
    print_success "Services démarrés"
    print_info "Frontend: http://localhost:3000"
    print_info "websockets: http://localhost:4001/health"
    print_info "Application des migrations Prisma..."
    docker compose -f docker-compose.yml exec frontend npx prisma migrate dev --name init --url "postgresql://postgres:postgres@db:5432/aqua_temp"
    print_success "Migrations Prisma appliquées"
}

# Redémarrer les services
restart_services() {
    print_header "Redémarrage des services"
    docker compose restart

        print_info "Application des migrations Prisma..."
        docker compose -f docker-compose.yml exec frontend npx prisma migrate dev --name init --url "postgresql://postgres:postgres@db:5432/aqua_temp"
        print_success "Migrations Prisma appliquées"

    print_success "Services redémarrés"
}

# Arrêter les services
stop_services() {
    print_header "Arrêt des services"
    docker compose down
    print_success "Services arrêtés"
}

# Nettoyer complètement
clean_all() {
    print_header "Nettoyage complet"
    read -p "⚠️  Cela supprimera tous les volumes (base de données). Continuer? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        docker compose down -v
        print_success "Nettoyage terminé"
    else
        print_info "Annulé"
    fi
}

# Afficher les logs
show_logs() {
    print_header "Logs des services"
    echo "1. Tous"
    echo "2. Frontend"
    echo "3. Websockets"
    echo "4. Database"
    read -p "Service: " service_choice
    
    case $service_choice in
        1) docker compose logs -f ;;
        2) docker compose logs frontend -f ;;
        3) docker compose logs websockets -f ;;
        4) docker compose logs db -f ;;
        *) print_error "Choix invalide" ;;
    esac
}

# Vérifier le statut
check_status() {
    print_header "Statut des services"
    docker compose ps
    echo ""
    
    # Tester les endpoints
    print_info "Test du websockets..."
    if curl -s http://localhost:4001/health > /dev/null 2>&1; then
        print_success "websockets: OK"
    else
        print_error "websockets: KO"
    fi
    
    print_info "Test du frontend..."
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend: OK"
    else
        print_error "Frontend: KO"
    fi
}

# Accéder à la base de données
access_db() {
    print_header "Accès PostgreSQL"
    docker compose exec db psql -U postgres -d aqua_temp
}

# Créer un admin
create_admin() {
    print_header "Création d'un administrateur"
    read -p "Email: " email
    
    if [ -z "$email" ]; then
        print_error "Email requis"
        return
    fi
    
    docker compose exec db psql -U postgres -d aqua_temp -c \
        "UPDATE \"user\" SET role = 'admin' WHERE email = '$email';"
    
    print_success "Utilisateur $email promu admin"
}

# Tester les services
test_services() {
    print_header "Test des services"
    
    echo "websockets Health:"
    curl -s http://localhost:4001/health | jq '.' 2>/dev/null || curl -s http://localhost:4001/health
    
    echo ""
    echo "Utilisateurs (premiers 3):"
    curl -s http://localhost:4001/api/users | jq '.[0:3]' 2>/dev/null || curl -s http://localhost:4001/api/users
}

# Boucle principale
main() {
    check_docker
    
    while true; do
        echo ""
        show_menu
        
        case $choice in
            1) start_services ;;
            2) restart_services ;;
            3) stop_services ;;
            4) clean_all ;;
            5) show_logs ;;
            6) check_status ;;
            7) access_db ;;
            8) create_admin ;;
            9) test_services ;;
            0) print_success "Au revoir!"; exit 0 ;;
            *) print_error "Choix invalide" ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

main
