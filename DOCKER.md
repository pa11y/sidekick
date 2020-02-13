# Docker workflow

```bash
docker-compose up -d
```

When the services is up and running, run db migrations:

```bash
docker-compose exec sidekick make db-migrate-up
```

Then you could start using pa11y sidekick at url localhost:8082


