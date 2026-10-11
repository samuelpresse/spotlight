## Lancer en local

```bash
npm install
npm run seed
npm run dev
```

Sans configuration, les données sont stockées dans `.data/` (base JSON + fichiers).

---

## Déploiement (Vercel)

1. Importer le dépôt GitHub dans Vercel.
2. **Storage → Neon** : plan Free, région Washington D.C., préfixe `DATABASE`.
3. **Storage → Blob** : accès **Public**, connecté au projet.
4. **Environments → Production** : ajouter `ADMIN_PASSWORD` (et `AUTH_SECRET`).
5. **Deployments → Redeploy**.

Les tables se créent toutes seules au premier lancement. Chaque `git push` sur `main` redéploie le site.

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

### Magazines

À l'envoi d'un PDF, les pages sont converties en images dans le navigateur de l'admin. Le lecteur ne charge que les pages proches de celle affichée ; le PDF sert au téléchargement.

Un magazine créé avant cette conversion utilise encore le lecteur PDF. Pour le convertir : **Admin → Modifier → Optimiser la lecture → Enregistrer**.
