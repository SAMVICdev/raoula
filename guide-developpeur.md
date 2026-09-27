# Guide développeur — Raoula_js v1.0

Stack : React 19, Vite 8, TypeScript, Tailwind 4 (variante `dark` manuelle), PWA (vite-plugin-pwa), IndexedDB.

## Arborescence

| Chemin | Rôle |
|---|---|
| `src/App.tsx` | Onglets, chargement, onboarding, écran PIN, thème |
| `src/components/` | Écrans et modales (voir ci-dessous) |
| `src/services/db.ts` | IndexedDB `raoula_js_db` (cycles, journaux, réglages) |
| `src/services/gemini.ts` | Conseil IA opt-in + repli local (SDK chargé à la demande) |
| `src/services/reminders.ts` | Notifications à l'ouverture (J-3, J-1, retard, journal) |
| `src/services/alarm.ts` | Sonnerie Web Audio + vibration (aucun fichier externe) |
| `src/utils/cycleCalculations.ts` | Phases, fertilité, stats, prévisions |
| `src/utils/theme.ts` | Thème clair/sombre/auto (20h–7h) |
| `src/utils/pin.ts` | Hash PIN, session déverrouillée |
| `src/types/index.ts` | Modèles (Cycle, DailyLog, UserSettings…) |

## Composants

| Composant | Rôle |
|---|---|
| `OnboardingView` | Premier démarrage : 1 question (dernières règles) |
| `DashboardView` | Accueil : compteurs, roue du cycle, journal du jour |
| `CalendarView` | Calendrier mensuel coloré |
| `DailyLogModal` | Journal en 2 niveaux (essentiel / avancé replié) |
| `HistoryView` | Historique des cycles + bilan médical imprimable |
| `CalculatorView` | Simulateur 6 mois (replié dans Suivi) |
| `InsightsView` | Analyses : courbes SVG, décalage thermique, alertes |
| `AdviceView` + `PersonalizedAdviceCard` | Guides santé + conseil IA |
| `PrivacySettingsView` | Réglages : thème, PIN, alarme, physiologie, export |
| `LockScreen` | Écran de verrouillage PIN (clavier tactile) |
| `Header` / `MobileNav` | Navigation (desktop / mobile) |
| `LiveCountdown` | Décompte temps réel |
| `PWAInstallModal` / `AddCycleModal` | Installation PWA / saisie de cycle |

## Points d'attention

- **Thème sombre** : implémenté par inversion des variables de couleur Tailwind v4 sous `.dark` dans `src/index.css`. Ne pas ajouter de couleurs codées en dur — utiliser les utilitaires standards (`bg-white`, `text-stone-900`…), ils basculent automatiquement.
- **IA** : ne jamais envoyer `DailyLog` à Gemini. Uniquement des indicateurs de `CalculatedCycleStatus`.
- **PIN** : hashé (djb2 renforcé) dans localStorage, session en sessionStorage. Intimité visuelle, pas du chiffrement fort.
- **Alarme** : Web Audio exige une interaction préalable de l'utilisateur (règle navigateur).
- **Bundle** : `@google/genai` est importé dynamiquement (chunk séparé ~370 kB). Ne pas le réimporter statiquement.

## Données

Base IndexedDB : `raoula_js_db` (stores : `cycles`, `daily_logs`, `settings`).
Réglages : clé `user_preferences` — inclut `themeMode`, `alarmSound`, `reminderConsent`, `onboardingCompleted`.

## Déploiement

`vercel.json` prêt (SPA rewrites, cache SW). Voir `deploiement.md`.

## Potovi

Projet **séparé**. Ne pas mélanger les dossiers.
