# Deployment Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Production Checklist](#production-checklist)
- [Deployment Strategy](#deployment-strategy)
- [Environment Configuration](#environment-configuration)
- [Database Deployment](#database-deployment)
- [WebSocket Deployment](#websocket-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Production Checklist

Before deploying, ensure:

- [ ] Environment variables configured securely
- [ ] Database migrations tested and backed up
- [ ] HTTPS/SSL certificates configured
- [ ] Rate limiting and security headers enabled
- [ ] Error logging and monitoring setup
- [ ] Database connection pooling configured
- [ ] Redis persistence enabled
- [ ] Backup strategy in place
- [ ] WebSocket connection secure (WSS)
- [ ] CORS properly configured for production domain

## Deployment Strategy

### Recommended Architecture

```
┌─────────────────────────────────────┐
│     CloudFlare / CDN / Load          │
│        Balancer (optional)           │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Next.js App │  │ WebSocket    │
│   (port 3000)│  │ Server       │
│              │  │ (port 4001)  │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
        ┌───────┴──────┐
        │              │
        ▼              ▼
    ┌────────┐    ┌────────┐
    │  Postgres   │  Redis │
    │  (Database) │ (Cache)│
    └────────┘    └────────┘
```

**Recommended Deployment Options**:
1. **Heroku/Railway**: Simple push-to-deploy
2. **Docker + Docker Swarm/Kubernetes**: Full control
3. **VPS (AWS EC2, DigitalOcean, Linode)**: Cost-effective
4. **Vercel (Frontend) + Render/Heroku (Backend)**: Managed services

## Environment Configuration

### Production Environment Variables

Create `.env.production.local`:

```env
# Next.js
NODE_ENV=production
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com/socket
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com

# Better Auth
BETTER_AUTH_URL=https://your-domain.com
BETTER_AUTH_SECRET=<generate-secure-random-64-char-string>

# Database
DATABASE_URL=postgresql://user:secure_password@db-host:5432/kyogre_prod

# Redis
REDIS_URL=redis://redis-host:6379

# WebSocket
SOCKET_PORT=4001
SOCKET_URL=ws://websocket-server:4001

# Analytics (optional)
SENTRY_DSN=https://your-sentry-url
```

**Generate BETTER_AUTH_SECRET**:
```bash
openssl rand -hex 32
```

### Secure Secrets Management

- **Never commit `.env.production`** to git
- Use platform secrets management:
  - **Vercel**: Project Settings → Environment Variables
  - **Heroku**: Config Vars
  - **AWS**: Secrets Manager or Parameter Store
  - **Docker**: Use `--env-file` or orchestration secrets

## Database Deployment

### PostgreSQL Setup

**Production Considerations**:
- Enable automatic backups
- Configure connection pooling (min 5, max 20 connections)
- Enable SSL for connections
- Set up monitoring and alerting
- Regular backup and restore testing

**Using Managed PostgreSQL**:
- **AWS RDS**: Managed, backup, monitoring included
- **Heroku Postgres**: Simple, expensive at scale
- **Railway/Render**: Developer-friendly
- **DigitalOcean Managed DB**: Good balance

**Example AWS RDS Connection**:
```env
DATABASE_URL=postgresql://user:password@mydb.region.rds.amazonaws.com:5432/kyogre
```

### Run Migrations

```bash
# SSH into production server
ssh user@production-server

# Navigate to project
cd kyogre

# Run migrations
cd frontend
bun run prisma migrate deploy
```

### Backup Strategy

```bash
# Daily PostgreSQL backup
0 2 * * * pg_dump $DATABASE_URL > /backups/kyogre_$(date +%Y%m%d).sql

# Store backups remotely
# Using s3cmd or similar to S3/cloud storage
s3cmd sync /backups/ s3://my-backup-bucket/

# Keep 30 days of backups
find /backups -mtime +30 -delete
```

## WebSocket Deployment

### Socket.IO on Production

**Configuration** (`websockets/server.js`):

```javascript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server({
  transports: ['websocket', 'polling'],  // WebSocket primary, polling fallback
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL,
    credentials: true
  }
});

// Use Redis for scaling across multiple instances
const pubClient = redis.createClient({
  url: process.env.REDIS_URL
});

const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

io.listen(process.env.SOCKET_PORT || 4001);
```

### WebSocket Security

- **Enable WSS (Secure WebSocket)** in production
- **Configure CORS** properly
- **Validate user sessions** on connection
- **Implement rate limiting** for socket events
- **Monitor connection count** to prevent resource exhaustion

**Example Secure Connection**:
```typescript
// Frontend
export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  secure: true,  // Use WSS
  rejectUnauthorized: true  // Verify SSL cert
});
```

### Scaling Socket.IO

For multiple server instances:

```javascript
// Redis adapter for pub/sub across instances
io.adapter(createAdapter(pubClient, subClient));

// Handles sticky sessions automatically
io.listen(4001);
```

## Frontend Deployment

### Build Optimization

```bash
cd frontend

# Build for production
bun run build

# Check build size
bun run build --analyze

# Test production build locally
bun run start
```

### Next.js Production Settings

In `frontend/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // Performance
  swcMinify: true,          // Use SWC for faster minification
  compress: true,           // Enable gzip compression
  
  // Security
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ]
    }
  ],
  
  // Images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'archives.bulbagarden.net' }
    ],
    minimumCacheTTL: 60 * 60 * 24 * 365  // 1 year cache
  }
};

export default nextConfig;
```

### Docker Deployment

**Dockerfile** (`frontend/Dockerfile`):

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build
COPY . .
RUN bun run build

# Runtime image
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["bun", "run", "start"]
```

**Docker Compose Production** (`docker-compose.yml`):

```yaml
version: '3.8'

services:
  web:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      DATABASE_URL: ${DATABASE_URL}
      NEXT_PUBLIC_SOCKET_URL: ${NEXT_PUBLIC_SOCKET_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  websocket:
    build: ./websockets
    ports:
      - "4001:4001"
    environment:
      SOCKET_PORT: 4001
      REDIS_URL: ${REDIS_URL}
    depends_on:
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: kyogre
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

### Vercel Deployment (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then deploy:
vercel deploy --prod
```

### Render/Railway Deployment

Both platforms support Docker Compose and automatic deployments from git.

**Steps**:
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy automatically on push

## Monitoring & Maintenance

### Error Logging

**Setup Sentry**:

```bash
npm install @sentry/nextjs
```

```typescript
// frontend/app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Database Monitoring

Monitor key metrics:
- Connection pool usage
- Query performance
- Backup completion
- Disk space usage

```sql
-- Check active connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

-- Check slow queries
SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### WebSocket Monitoring

Monitor:
- Active socket connections
- Event throughput
- Memory usage
- Error rate

### Health Checks

Add health check endpoint:

```typescript
// frontend/app/api/health/route.ts
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok' });
  } catch (error) {
    return Response.json({ status: 'error' }, { status: 500 });
  }
}
```

Configure monitoring tool to ping `/api/health` every 60 seconds.

### Regular Maintenance

**Weekly**:
- Review error logs
- Check database disk space
- Monitor API performance

**Monthly**:
- Test backup restoration
- Review security logs
- Update dependencies

**Quarterly**:
- Performance optimization review
- Security audit
- Capacity planning

## Disaster Recovery

### Backup Plan

1. **Database**: Daily automated backups, 30-day retention
2. **Code**: Git repository with protected main branch
3. **Configuration**: Store `.env.production` securely
4. **Assets**: S3 or CDN backup of uploaded files

### Restoration Process

```bash
# 1. Restore database from backup
psql kyogre < backup_2024.sql

# 2. Deploy code to rollback version
git checkout <previous-stable-commit>
docker-compose up --build

# 3. Verify health
curl https://your-domain.com/api/health
```

## Security Considerations

1. **HTTPS/TLS**: Always use HTTPS, get cert from Let's Encrypt
2. **CORS**: Restrict to your domain only
3. **Rate Limiting**: Implement on all APIs
4. **SQL Injection**: Use Prisma (parameterized queries)
5. **XSS Protection**: Sanitize user input
6. **CSRF Protection**: Better Auth handles this
7. **Secrets**: Never commit `.env` files
8. **Updates**: Keep dependencies updated
9. **Monitoring**: Alert on suspicious activity

## Cost Optimization

**Development**:
- Free tier: Vercel, Railway, Render
- PostgreSQL: Heroku Free or hosted option
- Redis: Managed free tier or self-hosted

**Production**:
- Frontend: Vercel ($20/month minimum)
- Backend: Railway/Render ($15-30/month)
- Database: Managed PostgreSQL ($15+/month)
- Redis: Managed Redis ($5+/month)
- **Total**: ~$50-75/month for small deployments

**Cost Reduction Tips**:
- Use self-managed VPS ($5-10/month)
- Scale databases as needed
- Use CDN for static assets
- Monitor resource usage
