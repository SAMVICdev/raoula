# Historique — Raoula_js

## 2026-09-27 — Revoir le tutoriel (Réglages)

- **Option « Revoir le tutoriel »** ajoutée dans Réglages (carte « Découvrir l’application ») : réaffiche le tutoriel 4 écrans à la demande via un état `tutorialReplay` dans App.tsx ; au premier lancement, le tutoriel reste automatique. Prop `onReplayTutorial` optionnel sur PrivacySettingsView. Typecheck + build verts.
## 2026-09-27 — Tutoriel au premier lancement

- **Tutoriel 4 écrans** (`src/components/TutorialView.tsx`) affiché avant l’onboarding, une seule fois : bienvenue/confidentialité, journal, cycle, rappels/PIN. Boutons « Suivant » / « Passer », progression animée, transitions motion, vibration haptique. Marque `tutorialCompleted` dans UserSettings (défaut false dans `db.ts`), aucune donnée créée. Typecheck + build verts.
## 2026-09-27 — Guide & politiques (AD)

- **AD.** Section « **Politiques** » ajoutée au `guide-utilisation.md` : politique de confidentialité (7 engagements), conditions d'utilisation (usage non médical, limites, âge, responsabilité des sauvegardes), politique de support (ce que SAMVICdev peut/ne peut pas faire, contacts appel + WhatsApp).
  - Déclinée **dans l'app** : bloc repliable « Politique de confidentialité & conditions d'utilisation » dans Réglages, avec boutons d'appel et WhatsApp. Vérifié navigateur.

## 2026-09-27 — Bouton WhatsApp (AC)

- **AC.** Lien WhatsApp (`wa.me/22897906711`) ajouté à côté du téléphone : pied de page (vert, icône message), carte créateur dans Réglages (boutons **Appeler** rose + **WhatsApp** vert côte à côte), écran PIN. Ouverture dans un nouvel onglet (`noopener`).

## 2026-09-27 — Contact créateur (AB)

- **AB.** Contact **SAMVICdev · +228 97 90 67 11** ajouté : pied de page de l'app (lien cliquable), écran de verrouillage PIN, carte créateur dans Réglages (lien d'appel direct), README et guide-utilisation.

## 2026-09-27 — Animations & feedback (AA)

- **AA.** L'app devient vive — la librairie `motion` (déjà installée) est enfin utilisée :
  - `src/utils/animation.ts` : variants partagés (cascade, fondu d'écran, pop), haptique légère/succès.
  - `src/components/ConfettiBurst.tsx` : confettis de célébration (≈1,2 s) à la validation du journal.
  - Tableau de bord : cartes en cascade, **roue du cycle qui se dessine** (motion.circle, 1,1 s), badge % + icône de phase en spring, boutons whileTap.
  - Journal : modale **qui glisse depuis le bas** (spring, style natif mobile), emoji d'humeur qui rebondit à la sélection, vibration légère à chaque tap, vibration de succès + confettis à l'enregistrement.
  - App.tsx : **transition fondu entre onglets** (AnimatePresence mode="wait").
  - Typecheck + build verts, testé navigateur (modale glissante, roue animée, éléments motion actifs).

## 2026-09-27 — Version 1.0 (Z)

- **Z.** Sortie de la **version 1.0.0** :
  - `package.json` : version 1.0.0 ; titre de page « Raoula_js v1.0 ».
  - Nettoyage : import dynamique inutile de `pin.ts` dans PrivacySettingsView (warning de build résolu) — build 100 % sans avertissement.
  - Vérification complète navigateur : les 6 onglets (Accueil, Calendrier, Conseils, Suivi, Analyses, Réglages) sans erreur, modale journal OK, simulateur OK, console propre.
  - Typecheck + build production verts (PWA générée, 16 entrées précache).
  - `README.md` et `guide-developpeur.md` mis à jour pour la v1.0 (récapitulatif des fonctionnalités, architecture complète).

### Récapitulatif v1.0

Suivi de cycle (onboarding 1 question, compteurs temps réel, roue du cycle) · Calendrier coloré · Journal 2 niveaux avec humeurs emoji · Analyses (courbes cycles + température avec détection d'ovulation, alertes santé) · Rappels J-3/J-1/retard avec sonnerie + vibration · Mode PIN · Thème clair/sombre/auto · Export/import JSON + bilan médical · 6 guides santé + conseil IA opt-in · PWA installable hors-ligne.

## 2026-09-27 — Documentation utilisatrice (Y)

- **Y.** `guide-utilisation.md` : guide complet pour les utilisatrices (démarrage, journal, calendrier, analyses, rappels/alarme, PIN, sauvegarde, confidentialité, FAQ). Référencé dans le README.

## 2026-09-27 — Sonnerie d'alarme (X)

- **X.** Alarme sonore + vibration (`src/services/alarm.ts`) : mélodie synthétisée Web Audio (arpège do-mi-sol-do, 3 répétitions) — aucun fichier externe, fonctionne hors-ligne. Vibration du téléphone si supportée.
  - Jouée avec les notifications de rappel (J-3, J-1, retard) mais pas pour le rappel journal (trop intrusif).
  - Réglages : case « Sonnerie des rappels » (activée par défaut, `alarmSound` dans UserSettings) + bouton « Tester l'alarme ».
  - Testé navigateur : son joué, message de confirmation, persistance on/off en IndexedDB.

## 2026-09-27 — Thème sombre (W)

- **W.** Thème sombre avec 3 modes : **Clair**, **Sombre**, **Automatique** (sombre de 20h à 7h, vérifié toutes les 5 min et au retour sur l'onglet).
  - `src/index.css` : variante `dark` manuelle (Tailwind v4 `@custom-variant`) + inversion globale des variables de couleur sous `.dark` — toute l'interface bascule sans toucher aux composants.
  - `src/utils/theme.ts` : application (classe `.dark` + meta `theme-color`) et watcher du mode auto.
  - Réglages → carte **Apparence** : sélection immédiate, persistée dans UserSettings (`themeMode`, défaut `auto`).
  - Testé navigateur : mode sombre actif (cartes stone-900, textes clairs, barre système noire), persistance après navigation, retour en auto OK.

## 2026-09-27 — Fonctionnalités avancées (R–V)

- **R.** Rappels étendus (`src/services/reminders.ts`) : notification aussi à J-3 (3 jours avant les règles prévues), en plus de J-1/J, retard et journal.
- **S.** Vue Analyses (`src/components/InsightsView.tsx`) : graphique des durées de cycle (SVG, zone de régularité ±3 j), courbe de température basale avec détection du décalage thermique (hausse ≥ 0,2 °C sur 3 jours = ovulation probable), symptômes fréquents, alertes santé (cycles <21 j ou >35 j, règles >8 j, variance >9 j). Nouvel onglet desktop et mobile.
- **T.** Mode discret PIN (`src/components/LockScreen.tsx`, `src/utils/pin.ts`) : code 4 chiffres hashé en local, demandé à chaque nouvelle session. Activation/désactivation dans Réglages.
- **U.** Préparation déploiement : `vercel.json` (SPA rewrites, cache SW) + `deploiement.md` (guide Vercel/Netlify pas à pas).
- **V.** Testé en navigateur : PIN activé → écran de verrouillage au rechargement → mauvais code refusé → bon code 1234 ouvre l'app. Analyses et températures OK. Typecheck + build verts.

## 2026-09-27 — Simplification pour la facilité d'utilisation (M–Q)

- **M.** Navigation : 5 onglets partout (le Calculateur devient une section repliée dans Historique). Réglages désormais accessible sur mobile.
- **N.** Onboarding : une seule question obligatoire (date des dernières règles). Durées par défaut, ajustables dans Réglages.
- **O.** Journal du jour : niveau 1 simple (flux, humeur en emojis, symptômes), options avancées repliées (température, glaire, intimité, pilule, notes). La section s'ouvre automatiquement si un champ avancé est déjà rempli.
- **P.** Tableau de bord épuré : carte « Installer » retirée (bouton déjà dans l'en-tête), 4 cartes de navigation retirées (doublon des onglets). Bouton « Mes règles débutent aujourd'hui » mis en avant.
- **Q.** Testé dans le navigateur : onboarding → tableau de bord → journal → historique → réglages OK. Typecheck et build verts.

## 2026-09-27 — Finalisation (H–L)

- **H.** `package.json` : nom `raoula-js` (au lieu de `react-example`).
- **I.** `vite.config.ts` : `import.meta.dirname` au lieu de `__dirname` (warning Vite résolu).
- **J.** `src/services/gemini.ts` : SDK `@google/genai` chargé à la demande (dynamic import). Bundle principal : 728 kB → 360 kB. Le repli local est inchangé.
- **K.** Typecheck (`npm run lint`) et build (`npm run build`) verts, PWA générée.
- **L.** Retrait des dépendances inutilisées du template : `express`, `dotenv`, `@types/express`.

## 2026-09-27 — Continuer le projet téléchargé (A–G)

- **A.** Documentation de lancement (`README.md` français).
- **B.** Conseils Gemini opt-in : `src/services/gemini.ts`, `src/components/PersonalizedAdviceCard.tsx` ; repli local sans clé.
- **C.** Suppression des cycles d’exemple dans `src/services/db.ts` ; accueil `src/components/OnboardingView.tsx`.
- **D.** Rappels navigateur : `src/services/reminders.ts` + case dans `PrivacySettingsView.tsx`.
- **E.** `README.md` réécrit en français.
- **F.** `procedure.md`, `guide-developpeur.md`, ce fichier.
- **G.** Prénom local, thème conseils selon la phase, texte confidentialité ajusté.

Vite : `envPrefix` pour `GEMINI_*` dans `vite.config.ts`.
