# Deployment Guide - Feast AI

This guide covers deployment of Feast AI to production environments.

## Prerequisites

- Node.js 18+ installed locally
- Docker (for containerized deployment)
- Git account (for CI/CD)
- Vercel account (for serverless deployment) or Docker hosting (for self-hosted)

## Environment Configuration

### 1. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - At least 32 characters for JWT signing
- `ANTHROPIC_API_KEY` - API key from Anthropic

Optional variables:
- `SENTRY_DSN` - Error tracking (recommended for production)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `ENABLE_RATE_LIMITING` - Enable request rate limiting

### 2. Validate Configuration

The app validates environment variables at build time. All required variables must be present:

```bash
npm run build
```

If validation fails, check `.env.example` for required variables.

## Deployment Options

### Option 1: Vercel (Recommended for Serverless)

**Advantages:**
- Zero-configuration deployment
- Automatic CI/CD
- Built-in monitoring
- Global CDN
- Free tier available

**Steps:**

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel Settings → Environment Variables
4. Vercel automatically deploys on push

**Monitoring:**
- Health check: `GET /api/health`
- Logs: Vercel Analytics Dashboard
- Errors: Integration with Sentry (optional)

### Option 2: Docker (Self-Hosted)

**Advantages:**
- Full control over infrastructure
- Can run on any cloud (AWS, GCP, Azure, etc.)
- Reproducible deployments

**Build and Run Locally:**

```bash
# Build Docker image
docker build -t feast-ai:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e ANTHROPIC_API_KEY="your-key" \
  feast-ai:latest
```

**Deploy to Cloud:**

1. **AWS ECS/Fargate:**
   ```bash
   # Push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag feast-ai:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/feast-ai:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/feast-ai:latest
   ```

2. **Google Cloud Run:**
   ```bash
   gcloud builds submit --tag gcr.io/project-id/feast-ai
   gcloud run deploy feast-ai --image gcr.io/project-id/feast-ai --platform managed
   ```

3. **Azure Container Instances:**
   ```bash
   az acr build --registry <registry-name> --image feast-ai:latest .
   az container create --resource-group <group> --name feast-ai --image <registry>.azurecr.io/feast-ai:latest
   ```

### Option 3: Traditional VPS (Self-Hosted)

**Requirements:**
- Ubuntu/Debian server with Node.js 18+
- Nginx or Apache as reverse proxy
- PM2 or systemd for process management

**Steps:**

1. Clone repository
2. Install dependencies: `npm ci --only=production`
3. Build: `npm run build`
4. Start with PM2: `pm2 start npm --name "feast-ai" -- start`
5. Configure Nginx reverse proxy to port 3000
6. Set up SSL with Let's Encrypt

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run: `npm run db:push`
- [ ] Build succeeds: `npm run build`
- [ ] Health check accessible: `GET /api/health`
- [ ] HTTPS enabled
- [ ] Security headers configured (done via middleware)
- [ ] Rate limiting enabled
- [ ] Error tracking configured (Sentry)
- [ ] Logging configured
- [ ] Database backups scheduled
- [ ] Monitoring alerts set up
- [ ] Database connection pooling configured (for high traffic)

## Monitoring & Observability

### Health Check Endpoint

```bash
curl https://your-app.com/api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": { "status": "connected" },
  "memory": { "heapUsed": "XX MB" }
}
```

### Logging

Structured logs are written to stdout. For production, integrate with:
- **Vercel**: Automatic logging
- **Docker**: Use Docker logging drivers (splunk, awslogs, gcplogs)
- **VPS**: Use systemd journal or rsyslog

### Error Tracking

Set `SENTRY_DSN` environment variable to automatically report errors to Sentry.

## Performance Optimization

### Image Optimization

Images are automatically optimized via Next.js Image component. Configure CDN:

```javascript
// next.config.js
images: {
  minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
}
```

### Database Optimization

For production with high traffic:

```javascript
// prisma/schema.prisma
// Use connection pooling
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Supabase automatically includes connection pooling.

### API Routes Caching

Add cache headers to API responses in `next.config.js`:

```javascript
headers: [
  {
    source: '/api/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, s-maxage=60'
      }
    ]
  }
]
```

## Database Backups

### Supabase Automatic Backups

Supabase includes:
- Daily backups (retain 7 days)
- Point-in-time recovery
- Automated restore testing

For production: Enable Point-in-Time Recovery (PITR) in Supabase dashboard.

### Manual Backup

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Troubleshooting

### Build Fails - Missing Environment Variables

```bash
Error: Missing required environment variables: JWT_SECRET, ANTHROPIC_API_KEY
```

**Solution:** Add all variables from `.env.example` to your deployment platform.

### Database Connection Error

```bash
Error: ECONNREFUSED - Connection refused
```

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database server is running
- Verify network/firewall allows connection

### Health Check Fails

```bash
GET /api/health => 503 Unhealthy
```

**Solution:**
- Check database connection
- Review application logs
- Check memory usage

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use your platform's secret management
   - Rotate secrets regularly

2. **Database**
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access
   - Regular backups

3. **API Security**
   - Rate limiting enabled (100 requests/15 min)
   - JWT token validation on protected routes
   - Password hashing with bcrypt
   - CORS properly configured

4. **Monitoring**
   - Set up alerts for errors
   - Monitor database performance
   - Track API response times
   - Monitor error rates

## Support & Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/orm/prisma-client/deployment)
