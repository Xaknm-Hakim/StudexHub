# StudexHub App

This directory contains the main StudexHub Next.js application.

## Structure

```text
app/
├── app/             # App Router pages and API routes
├── components/      # Shared UI components
├── prisma/          # Prisma schema, migrations, and seed
├── public/          # Static assets
├── scripts/         # Operational helper scripts
├── src/lib/         # Shared auth, Prisma, domain, notification, and type logic
└── Dockerfile       # Production container build
```

## Commands

Run commands from this directory unless a document says otherwise.

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Key Files

- `app/app/page.tsx` - public landing page
- `app/app/api` - API routes
- `app/src/lib/auth.ts` - session helpers
- `app/src/lib/prisma.ts` - Prisma client setup
- `app/src/lib/types` - shared TypeScript types
- `app/prisma/schema.prisma` - database schema
- `app/Dockerfile` - application image build

## Documentation

- [Project Documentation](../docs/README.md)
- [API Documentation](../docs/api-docs)
- [API Documentation Template](../docs/api-docs/templates.md)
- [Docker Setup](../docs/infra-docs/docker.md)
- [Network Configuration](../docs/infra-docs/network.md)

Historical API documents are archived under [../docs/api-docs/legacy](../docs/api-docs/legacy/). Prefer current route implementation and current API docs when legacy docs conflict.
