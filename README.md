# Raoula_js v1.0 — Suivi du cycle et de la fertilité

Application web (PWA) confidentielle : calcul de cycle, fenêtre fertile, journal du jour, historique, analyses, rappels avec alarme et conseils.
Créée par **SAMUEL · SAMVICdev** — plus d'infos : **+228 97 90 67 11**

Les données (cycles, symptômes, humeurs, température) sont stockées **dans IndexedDB du navigateur**. Elles ne partent pas sur un serveur, sauf si tu cliques **Me conseiller** : alors seule la **phase du cycle** (jour, retard, fertilité estimée) est envoyée à Gemini.

## Fonctionnalités v1.0

- 📊 **Suivi de cycle** : onboarding ultra-simple (1 question), compteurs temps réel, roue du cycle, phases et fertilité
- 📅 **Calendrier** : règles (réelles/prévues), fenêtre fertile, ovulation, journées notées
- 📝 **Journal du jour** : flux, humeur (emojis), symptômes en 3 taps ; options avancées repliées (température, glaire, intimité, pilule, notes)
- 📈 **Analyses** : courbe des cycles, courbe de température avec détection automatique du décalage d'ovulation, symptômes fréquents, alertes santé
- 🔔 **Rappels + alarme** : notifications J-3, J-1, retard, journal — avec sonnerie synthétisée et vibration (activables)
- 🔒 **Mode discret** : code PIN à 4 chiffres (haché, local)
- 🌙 **Thème clair / sombre / automatique** (sombre 20h–7h)
- 💾 **Sauvegarde** : export/import JSON, bilan médical imprimable
- 🩺 **Conseils** : 6 guides santé + conseil IA opt-in (Gemini, phase du cycle seulement, repli local sans clé)
- 📱 **PWA installable** : plein écran, hors-ligne

## Lancer en local

Prérequis : [Node.js](https://nodejs.org/) (LTS).

```bash
cd C:\Users\ADN\Desktop\raoula_js
npm install
copy .env.example .env.local
```

Ouvre `.env.local` et, si tu veux l'IA, mets ta clé [Google AI Studio](https://aistudio.google.com/apikey) :

```
GEMINI_API_KEY=ta_cle
VITE_GEMINI_API_KEY=ta_cle
```

Sans clé, l'app fonctionne : le bouton **Me conseiller** utilise un texte local.

```bash
npm run dev
```

Ouvre **http://localhost:3000**.

## Documentation

| Fichier | Rôle |
|---|---|
| `guide-utilisation.md` | **Guide d'utilisation pour les utilisatrices** |
| `procedure.md` | Procédures (comme sur tes autres projets) |
| `historique.md` | Journal des changements |
| `guide-developpeur.md` | Où toucher le code |
| `deploiement.md` | Mettre l'app en ligne (Vercel, prêt : `vercel.json` inclus) |

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur Vite (port 3000) |
| `npm run build` | Build de production (+ service worker PWA) |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Vérification TypeScript |

## Confidentialité

- Carnet : 100 % local.
- Rappels : notifications du navigateur, uniquement si tu les actives dans **Réglages**.
- Code PIN : haché, stocké sur l'appareil.
- Gemini : opt-in, pas de notes intimes dans la requête.
