# Déployer Raoula_js en ligne (Vercel — gratuit)

L'app est une **PWA 100 % statique** : une fois déployée, les données des utilisatrices restent sur *leur* appareil (IndexedDB). Aucune donnée intime ne transite par le serveur.

> ⚠️ La clé Gemini est **côté navigateur** dans ce projet (`VITE_GEMINI_API_KEY`). Si tu la mets en variable d'environnement Vercel, elle sera visible dans le bundle — acceptable pour un usage personnel ; pour un vrai déploiement public, passe par une fonction serveur (proxy) pour la cacher.

## Étapes (10 minutes)

1. **Crée un repo GitHub** pour ce dossier (si pas déjà fait) :
   ```bash
   cd C:\Users\ADN\Desktop\raoula_js
   git init
   git add .
   git commit -m "Raoula_js : version initiale déployable"
   # Puis crée le repo sur github.com et :
   git remote add origin https://github.com/TON_COMPTE/raoula.git
   git push -u origin main
   ```

2. **Va sur [vercel.com](https://vercel.com)** → inscription gratuite avec GitHub.

3. **Add New… → Project** → sélectionne le repo `raoula`.

4. Vercel détecte Vite automatiquement (grâce à `vercel.json`). Avant de cliquer **Deploy** :
   - Ouvre **Environment Variables**
   - Ajoute `VITE_GEMINI_API_KEY` = ta clé (optionnel : sans elle, les conseils restent locaux)

5. **Deploy** → après ~1 minute tu obtiens une URL du type `https://raoula.vercel.app`.

6. **Installer sur téléphone** : ouvre l'URL sur mobile → menu du navigateur → **Ajouter à l'écran d'accueil**. L'app s'ouvre en plein écran, hors-ligne, comme une vraie application. 🎉

## Après le déploiement

- Chaque `git push` sur `main` redéploie automatiquement.
- Les mises à jour du service worker sont automatiques (`registerType: 'autoUpdate'`).
- Pour un nom de domaine personnel : **Settings → Domains** dans Vercel.

## Alternative Netlify

```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```
