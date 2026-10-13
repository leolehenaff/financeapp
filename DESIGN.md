---
name: Remco
description: Cockpit patrimonial clair et coloré, blanc sur gris très pâle, une couleur vive par poche, formes rondes.
colors:
  page: "oklch(97.5% 0.006 250)"
  surface: "oklch(100% 0 0)"
  surface-sunken: "oklch(95.5% 0.008 250)"
  ink: "oklch(22% 0.03 265)"
  ink-soft: "oklch(48% 0.025 262)"
  ink-faint: "oklch(64% 0.02 260)"
  rule: "oklch(92% 0.008 250)"
  rule-strong: "oklch(84% 0.012 250)"
  accent-indigo: "oklch(55% 0.21 275)"
  accent-indigo-soft: "oklch(94% 0.04 275)"
  gain-green: "oklch(58% 0.17 150)"
  gain-green-soft: "oklch(94% 0.06 150)"
  loss-red: "oklch(58% 0.19 25)"
  loss-red-soft: "oklch(94% 0.05 25)"
  pocket-stock-indigo: "oklch(58% 0.2 270)"
  pocket-startup-pink: "oklch(64% 0.22 345)"
  pocket-crypto-orange: "oklch(72% 0.18 55)"
  pocket-livret-green: "oklch(66% 0.17 155)"
  pocket-cash-teal: "oklch(66% 0.13 215)"
typography:
  display:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  table:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent-indigo}"
    textColor: "#ffffff"
    typography: "{typography.table}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-soft:
    backgroundColor: "{colors.accent-indigo-soft}"
    textColor: "{colors.accent-indigo}"
    typography: "{typography.table}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  nav-tabs:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.pill}"
    padding: "4px"
  date-chip:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  date-chip-late:
    backgroundColor: "{colors.loss-red-soft}"
    textColor: "{colors.loss-red}"
  check:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    size: "26px"
  check-done:
    backgroundColor: "{colors.gain-green}"
    textColor: "#ffffff"
---

# Design System: Remco

## 1. Overview

**Creative North Star: « Clair, joli, un peu fun »**

Un cockpit qu'on ouvre le 1er du mois sur iPhone, dans la cuisine, puis le soir sur Mac : du blanc posé sur un gris très pâle, des cartes rondes qui flottent à peine, et cinq couleurs franches, une par poche, qui ne changent jamais d'écran en écran. La couleur fait le fun, la typographie fait la hiérarchie, les barres épaisses font voir le progrès. Référence assumée : Copilot Money pour la couleur par catégorie et les barres, Mercury pour le calme des chiffres.

Thème clair uniquement : pas de mode sombre. La v2 « papier et encre brune » du 12/10/2026 et la v1 « Midnight Luxe » sont toutes deux rejetées : trop ternes, trop sombres. Le système reste un registre produit : aucune décoration, la couleur est toujours une donnée (poche, gain, perte, action primaire).

**Key Characteristics:**
- Page gris bleuté très pâle, cartes blanches avec une ombre douce, jamais de filet autour d'une carte.
- Cinq couleurs de poche saturées : indigo, rose, orange, vert, bleu canard.
- Un accent indigo pour l'action primaire, les boutons doux et la barre du total.
- Instrument Sans, titres en 700 serrés, chiffres tabulaires partout.
- Tout ce qui se clique est une pilule : boutons, onglets, puces, cases rondes.
- Saisie inline sur l'écran même : « Versé » sous chaque flux, prix sous chaque valorisation, case à cocher devant chaque action.

## 2. Colors

Stratégie **palette complète** : neutres teintés vers le bleu (teinte 250 à 265), un accent indigo, deux couleurs sémantiques (gain, perte) chacune avec une version douce pour les fonds, et cinq couleurs de poche. Tout en OKLCH.

- **Page** `oklch(97.5% 0.006 250)`, **Surface** blanc pur autorisé ici (seule exception), **Surface enfoncée** `oklch(95.5% 0.008 250)` pour les pistes de barres, les onglets et les puces.
- **Encre** `oklch(22% 0.03 265)`, **douce** 48 %, **pâle** 64 %. Contraste AA respecté : encre pâle réservée aux textes de 12 à 13 px non essentiels.
- **Accent indigo** `oklch(55% 0.21 275)` : bouton primaire, focus, barre du total du mois. Version douce `oklch(94% 0.04 275)` pour le bouton doux.
- **Gain** `oklch(58% 0.17 150)`, **perte** `oklch(58% 0.19 25)` : texte des variations, toujours avec le signe. Versions douces pour les fonds de puce (retard = fond rouge doux, texte rouge).
- **Poches** : Actions indigo `oklch(58% 0.2 270)`, Start-up rose `oklch(64% 0.22 345)`, Crypto orange `oklch(72% 0.18 55)`, Livrets vert `oklch(66% 0.17 155)`, Cash bleu canard `oklch(66% 0.13 215)`. Une poche garde sa couleur sur la pastille, la barre, la bande de composition et le graphique.
- Règle **crayon unique** : une couleur de poche ne colore jamais un bouton ni une autre donnée.

## 3. Typography

Instrument Sans seule. Chiffres tabulaires (`tnum`, `num`) sur toute valeur numérique, sans exception.

- **Display 38/700/-0.03em** : le total du patrimoine, une fois par écran.
- **Headline 30/700/-0.025em** : la phrase d'ouverture, avec un verbe (« Il reste 3 700 € à verser. »).
- **Title 18/700/-0.015em** : titres de section, aparté en 13 px encre douce à droite.
- **Body 15/400** : prose, 65ch maximum.
- **Table 14/400** : tableaux, listes, champs, boutons (600 pour les boutons).
- **Label 12/600/0.02em** : en-têtes de tableau en capitales, libellés de champ, puces.

## 4. Elevation & Depth

Deux niveaux seulement.
- **Page** : fond gris pâle, sections séparées par 40 px d'espace et un titre, jamais par un filet.
- **Carte** (`.panel`) : blanc, coins 18 px, ombre douce `0 1px 2px 5 %` + `0 6px 20px 6 %` en encre. Pas de bordure. Une carte ne contient jamais une autre carte.
- Les lignes à l'intérieur d'une carte sont séparées par un filet 1 px `rule`, survol en surface enfoncée.
- L'onglet actif de la navigation porte la même ombre douce : il « sort » du rail gris.

## 5. Components

### Buttons
- **Primaire** : pilule 40 px, indigo plein, texte blanc 600. Survol indigo un peu plus foncé, pression `scale(0.97)`, focus anneau indigo 4 px à 25 %. Un seul par formulaire.
- **Doux** : pilule indigo doux sur texte indigo. Pour les actions secondaires fréquentes (« Versé », « OK »).
- **Ghost** : pilule blanche, filet fort 1,5 px. Pour annuler ou déplier.
- **Petit** : 32 px, 13 px, padding 12 px.

### Check (action)
Case ronde 26 px, filet fort 2 px. Survol : bordure verte, `scale(1.08)`. Cochée : fond vert, coche blanche, désactivée. Un geste, sans confirmation.

### Chips
Pilule 24 px, 12 px 600, chiffres tabulaires. Date à venir : surface enfoncée sur encre douce. En retard : fond rouge doux, texte rouge.

### Panels
Blanc, 18 px, ombre douce. Padding 20 px pour un formulaire ou une progression, 0 quand la carte contient un tableau ou une liste.

### Fields
40 px, blanc, filet fort 1,5 px, coins 10 px, texte 14 px. Libellé au-dessus en 12 px. Focus : bordure indigo et anneau 4 px à 18 %. Erreur : 13 px rouge sous le champ, `role="alert"`. Les classes `.field`, `.btn`, `.panel` vivent dans `@layer components` pour que les utilitaires Tailwind (largeur, hauteur) les surchargent.

### Navigation
Rail en pilule gris pâle avec trois onglets ; l'actif est blanc, 600, avec l'ombre douce. Sous 640 px, le rail laisse place à une barre d'onglets fixée en bas (icône et libellé, actif en indigo sur pastille indigo pâle, marge de safe area). Marque à gauche : portrait de Remco, un renard à lunettes et écharpe indigo (34 px, rond, `public/remco-renard.png`), « Remco » en 16 px 700 et « Le CGP de Julie & Léo » en 12 px encre pâle, « Sortir » en encre pâle à droite. Barre collante sur fond page translucide.

### Progress bar (signature)
Pilule de 12 px (14 px pour le total du mois, 6 px pour une ligne), piste en surface enfoncée, remplissage couleur de la poche (indigo accent pour le total), largeur animée 400 ms. Sur les cibles d'allocation, un trait vertical en encre de 2 px marque la cible, l'écart signé en € à droite.

### Inline entry (signature)
Sous un flux non versé : champ 32 px pré-rempli du reste à verser et bouton doux « Versé », alignés à droite. Un flux sans instrument renvoie vers le Journal. Sous une valorisation périmée : champ prix et bouton doux « OK ». Jamais de modal.

### Composition strip
Bande de 12 px, segments contigus séparés de 1 px, un par poche, légende en dessous avec pastille, nom, pourcentage.

### Tables
En-têtes 12 px 600 capitales encre pâle, cellules 14 px padding 10 px 12 px, pastille devant chaque instrument, colonnes numériques à droite, total en 600 sur surface enfoncée.

### Empty state
14 px encre douce, centré, cadre en pointillés 14 px, dit ce qui apparaîtra ici.

## 6. Do's and Don'ts

### Do:
- **Do** ouvrir chaque écran sur une phrase d'action en 30 px 700, précédée du mois ou de la date en 13 px.
- **Do** mettre une pastille de 10 px devant tout instrument, dans la couleur exacte de sa poche.
- **Do** écrire le signe devant toute variation et le montant à côté de tout écart.
- **Do** permettre la saisie là où le chiffre s'affiche : champ et bouton doux sous la ligne, jamais une autre page.
- **Do** réserver l'indigo plein à une action par écran et aux totaux.
- **Do** garder les chiffres tabulaires et respecter `prefers-reduced-motion`.

### Don't:
- **Don't** revenir au sombre, au brun ou à l'or : ni « Midnight Luxe », ni « papier et encre brune ».
- **Don't** faire une app de banque, un tableur, Grafana ou une app crypto (néon, chandeliers).
- **Don't** entourer une carte d'un filet, ni imbriquer deux cartes, ni poser une ombre sur autre chose qu'une carte ou l'onglet actif.
- **Don't** mettre un dégradé, un texte en dégradé, un `border-left` coloré, un flou décoratif.
- **Don't** colorer un bouton avec une couleur de poche.
- **Don't** ouvrir un modal ni renvoyer vers une autre page pour une saisie d'une ligne.
- **Don't** écrire de tiret cadratin dans l'interface.
