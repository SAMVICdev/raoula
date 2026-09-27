# Procédures — Raoula_js

Liste des procédures du projet. À mettre à jour à chaque nouvelle procédure.

Historique daté : `historique.md`.  
Orientation code : `guide-developpeur.md`.

---

## P00 — Règles à chaque intervention

1. Travailler dans `C:\Users\ADN\Desktop\raoula_js` (projet distinct de Potovi).
2. Commenter en **français** le rôle des fichiers sensibles (données, IA, rappels).
3. Ne jamais committer `.env.local` ni une clé Gemini.
4. Mettre à jour `historique.md`.

---

## P01 — Lancer l’app

```bash
npm install
npm run dev
```

URL : http://localhost:3000

---

## P02 — Premier démarrage (onboarding)

Sans cycle enregistré et sans `onboardingCompleted`, l’écran d’accueil demande le premier jour des dernières règles. Aucun cycle d’exemple n’est injecté.

Pour revoir l’accueil : **Espace privé → Effacer tout**, ou vider IndexedDB `raoula_js_db` dans les outils développeur.

---

## P03 — Conseils Gemini

1. Copier `.env.example` vers `.env.local`.
2. Renseigner `GEMINI_API_KEY` et `VITE_GEMINI_API_KEY`.
3. Relancer Vite.
4. Onglet **Conseils** → **Me conseiller**.

Sans clé : repli local (`src/services/gemini.ts`).

---

## P04 — Rappels navigateur

**Espace privé** → cocher les rappels → autoriser les notifications → **Mettre à jour mes réglages**.

Les notifications partent à l’**ouverture** de l’app (le web ne réveille pas l’app toute seule).

---

## P06 — Vérifier l’état du projet

```bash
npm run lint    # typecheck TypeScript (doit passer sans erreur)
npm run build   # build production + service worker PWA
npm run preview # tester le build sur http://localhost:4173
```

Le bundle principal reste sous ~400 kB grâce au chargement à la demande du SDK Gemini.

---

## P07 — Mode discret (code PIN)

**Réglages → Mode discret · Code PIN** → Activer → saisir 2 fois le code.
À chaque nouvelle ouverture de l'app, l'écran « Espace protégé » demande le code.
Désactivation dans le même endroit (code actuel requis).

### Sonnerie des rappels

**Réglages → Paramètres physiologiques → Sonnerie des rappels** : case activée par défaut.
Bouton « Tester l'alarme » pour l'écouter. Le son ne part que si l'onglet a déjà reçu une interaction (règle des navigateurs) — un clic suffit.

**Réglages → Mode discret · Code PIN** → Activer → saisir 2 fois le code.
À chaque nouvelle ouverture de l'app, l'écran « Espace protégé » demande le code.
Désactivation dans le même endroit (code actuel requis).

---

## P08 — Déploiement en ligne

Voir `deploiement.md` (Vercel recommandé, gratuit). En résumé : repo GitHub → import Vercel → variable `VITE_GEMINI_API_KEY` optionnelle → Deploy.

---

## P05 — Sauvegarde

Export / import JSON dans **Espace privé**. Fichier type : `raoula_mon_carnet_AAAA-MM-JJ.json`.
