## Lancer en local

```bash
npm install
npm run seed
npm run dev
```

---

### Variables d'environnement

| Variable                | Rôle                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `ADMIN_PASSWORD`        | Mot de passe de `/admin`                                             |
| `DATABASE_URL`          | Postgres Neon (Vercel)                                               |
| `BLOB_STORE_ID`         | Vercel Blob en mode OIDC (Vercel)                                    |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob par jeton, prioritaire sur le mode OIDC s'il est défini  |
| `AUTH_SECRET`           | Optionnel : clé du cookie de session (sinon dérivée du mot de passe) |

---
