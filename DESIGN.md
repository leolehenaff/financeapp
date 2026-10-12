---
name: Carnet de bord
description: Cockpit patrimonial chaleureux et lisible, papier chaud, encre brune, une couleur par poche.
colors:
  paper: "oklch(97.5% 0.008 80)"
  paper-surface: "oklch(99.2% 0.005 85)"
  paper-sunken: "oklch(95% 0.012 80)"
  ink: "oklch(25% 0.02 60)"
  ink-soft: "oklch(46% 0.02 60)"
  ink-faint: "oklch(62% 0.015 65)"
  rule: "oklch(89% 0.012 75)"
  rule-strong: "oklch(80% 0.015 75)"
  focus-ochre: "oklch(70% 0.14 80)"
  gain-sage: "oklch(52% 0.11 150)"
  loss-terracotta: "oklch(54% 0.15 30)"
  pocket-stock-ochre: "oklch(70% 0.14 80)"
  pocket-startup-terracotta: "oklch(62% 0.15 35)"
  pocket-crypto-burnt-orange: "oklch(68% 0.17 55)"
  pocket-livret-sage: "oklch(68% 0.10 150)"
  pocket-cash-slate: "oklch(62% 0.08 240)"
typography:
  display:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
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
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.table}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-sunken}"
  field:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "36px"
  panel:
    backgroundColor: "{colors.paper-surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  date-chip:
    backgroundColor: "{colors.paper-sunken}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  date-chip-late:
    backgroundColor: "{colors.loss-terracotta}"
    textColor: "{colors.paper}"
  check:
    backgroundColor: "{colors.paper-surface}"
    rounded: "{rounded.pill}"
    size: "24px"
  check-done:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: Carnet de bord

## 1. Overview

**Creative North Star: "Le carnet de bord"**

Un carnet qu'on ouvre le 1er du mois à la table de la cuisine : du papier chaud, une encre brune plutôt que noire, des chiffres qu'on lit à bout de bras, et cinq couleurs de crayon, une par poche, qui ne changent jamais de page en page. Le carnet raconte le chemin parcouru et pointe le prochain pas. Il ne vend rien, il ne crie pas, il ne décore pas.

Le système sert un cockpit d'exécution (registre produit) : la hiérarchie est faite par la taille et le poids de la typographie, jamais par l'ornement. Les surfaces sont plates, séparées par des filets fins et des tons de papier légèrement différents. La couleur est réservée aux données : poches, gains et pertes, cible atteinte ou non. Le thème clair est le défaut (cuisine, lumière du jour, iPhone) ; le thème sombre suit le système pour les revues du soir sur Mac et garde la même teinte chaude dans ses neutres.

Le système rejette explicitement : l'ancienne v1 « Midnight Luxe » (noir, or, lueurs, animations d'entrée), l'app de banque (chrome marketing, cartes partout, chiffres noyés), le tableur ou Grafana (grille brute sans hiérarchie), l'app crypto (néon sur noir, casino) et le gabarit SaaS « gros chiffre, petit label, dégradé ».

**Key Characteristics:**
- Papier chaud (oklch 97.5 % 0.008 80) et encre brune (oklch 25 % 0.02 60) : jamais de blanc pur ni de noir pur.
- Cinq couleurs de poche, stables partout : ocre, terracotta, orange brûlé, sauge, ardoise.
- Une seule famille typographique, Instrument Sans, chiffres tabulaires sur toute valeur numérique.
- Élévation plate : filets 1 px et tons de papier, zéro ombre portée.
- Le progrès est une forme : barre épaisse arrondie, case ronde qui se remplit d'encre, repère noir de cible.
- Dense sur Mac, une colonne sur iPhone, sans changement de vocabulaire.

## 2. Colors: La palette du carnet

Des neutres tous teintés vers le jaune-brun (teinte 60 à 85), une encre brune, cinq crayons de couleur, et deux couleurs sémantiques sourdes pour gain et perte.

### Primary
- **Encre brune** (`{colors.ink}`): texte principal, titres, bouton primaire, repère de cible, case cochée. C'est l'accent du système : il n'y en a pas d'autre. Les actions principales sont en encre pleine, pas en couleur.
- **Ocre de focus** (`{colors.focus-ochre}`): anneau de focus des champs et boutons (3 px à 30 % d'opacité), identique à l'ocre de la poche Actions. Jamais utilisé en remplissage de bouton.

### Secondary: les cinq poches
- **Ocre, Actions** (`{colors.pocket-stock-ochre}`): la poche principale, aussi la couleur de remplissage du graphique de patrimoine (15 % d'opacité).
- **Terracotta, Start-up** (`{colors.pocket-startup-terracotta}`).
- **Orange brûlé, Crypto** (`{colors.pocket-crypto-burnt-orange}`).
- **Sauge, Livrets** (`{colors.pocket-livret-sage}`).
- **Ardoise, Cash** (`{colors.pocket-cash-slate}`): sert aussi aux barres géographiques, qui n'ont pas de poche propre.

Chaque poche garde sa couleur sur la pastille de 10 px devant son nom, sa barre de progression, son segment de la bande de composition et sa ligne dans les tableaux. Une ligne de tableau sans pastille n'existe pas.

### Tertiary: sémantique
- **Sauge profonde, gain** (`{colors.gain-sage}`) et **terracotta profonde, perte** (`{colors.loss-terracotta}`): uniquement sur du texte signé (+13,9 %, −4 614 €) et sur la puce de date en retard. Jamais sur une surface entière, jamais sans le signe.

### Neutral
- **Papier** (`{colors.paper}`): fond de page.
- **Surface** (`{colors.paper-surface}`): panneaux, champs, en-tête.
- **Papier enfoncé** (`{colors.paper-sunken}`): fond de barre vide, survol de ligne, ligne de total, puce de date.
- **Encre douce** (`{colors.ink-soft}`) : texte secondaire, sous-titres de section, libellés de formulaire.
- **Encre pâle** (`{colors.ink-faint}`) : en-têtes de tableau, dates de valorisation, métadonnées, versement déjà fait.
- **Filet** (`{colors.rule}`) et **filet fort** (`{colors.rule-strong}`) : séparateurs de lignes, bordure des panneaux, bordure des champs au repos.

Thème sombre : mêmes teintes, lightness inversée (papier 17 %, encre 93 %), poches éclaircies de 6 à 8 points pour garder le contraste AA sur fond sombre.

### Named Rules
**La règle du crayon unique.** Une poche, une couleur, partout. Interdit d'utiliser une couleur de poche pour autre chose que sa poche, et interdit de donner deux couleurs à une même poche sur deux écrans.

**La règle du signe.** Aucune information portée par la couleur seule. Gain et perte portent toujours + ou − ; l'écart à la cible porte toujours son montant ; la cible est un trait, pas une teinte.

**La règle de l'encre.** L'accent du système est l'encre. Les boutons primaires, la cible, la case cochée, la ligne du graphique sont en encre. Si un élément interactif est coloré, c'est une erreur.

## 3. Typography

**Display Font:** Instrument Sans (avec ui-sans-serif, system-ui)
**Body Font:** Instrument Sans
**Label/Mono Font:** aucune. Les chiffres utilisent `font-variant-numeric: tabular-nums lining-nums` partout, ce qui donne l'alignement d'une mono sans sa froideur.

**Character:** une humaniste légèrement condensée, chaleureuse sans être ronde, qui tient la densité d'un tableau et la taille d'un total. Une seule famille, quatre graisses (400, 500, 600, 700), ratio d'échelle 1,2.

### Hierarchy
- **Display** (600, 34 px, 1.15, −0.02em): le total du patrimoine, une fois par écran au plus.
- **Headline** (600, 28 px, 1.2, −0.02em): la phrase d'ouverture de l'écran, toujours une phrase avec un verbe (« Il reste 3 700 € à verser. »), jamais un label.
- **Title** (600, 17 px, 1.3, −0.01em): titres de section, avec un aparté à droite en 13 px encre douce.
- **Body** (400, 15 px, 1.45): prose, limitée à 65ch.
- **Table** (400, 14 px, 1.4): tableaux, listes, formulaires. Valeur principale en 500, secondaires en encre douce.
- **Label** (500, 12 px, 1.3, +0.01em): en-têtes de tableau, libellés de champ, puce de date, métadonnées. Jamais en capitales.

### Named Rules
**La règle de la phrase.** Un écran s'ouvre sur une phrase qui dit quoi faire, en Headline, précédée d'un surtitre 13 px (le mois, la date). Pas de « gros chiffre, petit label ».

**La règle tabulaire.** Tout nombre, même dans une phrase, porte la classe `tnum`. Tout nombre dans une colonne porte `num` (aligné à droite, sans retour à la ligne).

## 4. Elevation

Système plat. Aucune ombre portée, nulle part. La profondeur est tonale : papier (page) sous surface (panneau) sous papier enfoncé (barre vide, survol, total). Les panneaux ont un filet de 1 px en `rule` et un rayon de 14 px. Les lignes de tableau sont séparées par un filet, le survol teinte la ligne en papier enfoncé en 180 ms. L'en-tête collant est la seule surface translucide (surface à 80 % plus flou de 4 px) et c'est purement structurel.

### Named Rules
**La règle du papier.** Si un élément a besoin d'une ombre pour se détacher, c'est qu'il n'a pas le bon ton de papier. Changer le ton, pas ajouter l'ombre.

**La règle du panneau unique.** Un panneau n'en contient jamais un autre. Les listes dans un panneau sont séparées par des filets, pas par des sous-cartes.

## 5. Components

Vocabulaire court, identique sur les trois écrans. Tout élément interactif a ses états repos, survol, focus, actif, désactivé.

### Buttons
- **Shape:** coins légèrement arrondis (6 px), hauteur 36 px (30 px en `btn-sm`), padding 0 14 px, texte 14 px en 500.
- **Primary:** encre pleine, texte papier. Survol : encre éclaircie de 8 points. Un seul par formulaire.
- **Ghost:** transparent, filet fort, texte encre. Survol : papier enfoncé. Pour OK, Créer, Ajouter.
- **Hover / Focus:** transitions 180 ms sur fond et bordure, enfoncement de 1 px au clic (120 ms), anneau de focus ocre 3 px à 40 %.
- **Disabled:** opacité 0,5, curseur par défaut.

### Check (case d'action)
- **Style:** cercle de 24 px, filet fort 1,5 px, surface. Survol : bordure encre et agrandissement de 6 %. Cochée : encre pleine, coche papier, désactivée.
- Une action se coche d'un geste, sans confirmation, sans modal.

### Chips
- **Puce de date:** 12 px en 500, chiffres tabulaires, papier enfoncé sur encre douce, coins 6 px, padding 2 px 6 px. Devant chaque action datée.
- **Puce en retard:** même forme, fond terracotta profonde, texte papier. La seule surface colorée du système.

### Panels (containers)
- **Corner Style:** 14 px.
- **Background:** surface.
- **Shadow Strategy:** aucune (voir Elevation).
- **Border:** 1 px filet.
- **Internal Padding:** 20 px pour un formulaire ou un bloc de progression, 0 pour un panneau qui contient un tableau ou une liste (les lignes portent leur propre padding 9 à 12 px).
- Un panneau sert à grouper un formulaire, une progression ou un tableau. Les sections de page ne sont pas des panneaux : un titre, un aparté, un filet.

### Fields
- **Style:** hauteur 36 px, surface, filet fort 1 px, coins 6 px, texte 14 px, placeholder encre pâle. Libellé au-dessus en 12 px encre douce, jamais de placeholder en guise de libellé.
- **Hover:** bordure encre pâle. **Focus:** bordure ocre et anneau ocre 3 px à 30 %.
- **Select:** même enveloppe, chevron inline de 12 px en encre douce, groupes d'options par poche.
- **Error:** texte 13 px terracotta profonde sous le champ, `role="alert"`.

### Navigation
- **Style:** barre collante en surface translucide, filet dessous. Marque « Carnet de bord » en 15 px 600 (masquée sous 640 px), trois onglets texte 14 px, « Sortir » en encre pâle à droite.
- **States:** repos encre douce, survol encre, actif encre en 500 avec un filet de 2 px en encre sous l'onglet (`aria-current="page"`).
- **Mobile:** mêmes onglets, la marque disparaît, les onglets gardent 44 px de hauteur tactile.

### Progress bar (signature)
Barre arrondie de 10 px de haut (12 px pour le total du mois, 6 px pour une ligne), fond papier enfoncé, remplissage dans la couleur de la poche, animation de largeur 400 ms en ease-out. Sur les cibles d'allocation, un trait vertical en encre de 2 px marque la cible ; le réel se lit par rapport au trait, l'écart signé en € se lit à droite.

### Composition strip (signature)
Bande de 12 px, segments contigus séparés de 1 px, un par poche, largeur proportionnelle, légende en dessous avec pastille, nom et pourcentage. C'est le portrait du patrimoine en un regard.

### Tables
En-têtes 12 px encre pâle avec filet dessous, cellules 14 px, padding 9 px 10 px, pastille de poche devant chaque instrument, colonnes numériques à droite en tabulaire, ligne de total en 600 sur papier enfoncé. Débordement horizontal autorisé sur mobile dans le panneau ; les listes éditables (valorisations) sont des lignes flexibles qui replient le formulaire sous le nom.

### Empty state
Texte 14 px encre douce, centré, dans un cadre en pointillés de 10 px. Dit ce qui se passera quand il y aura quelque chose (« Rien à échéance. Les prochaines actions sont dans le Journal. »).

## 6. Do's and Don'ts

### Do:
- **Do** ouvrir chaque écran sur une phrase d'action en 28 px 600 (« Il reste 3 700 € à verser. »), précédée du mois ou de la date en 13 px.
- **Do** mettre une pastille de poche de 10 px devant tout instrument, partout, dans la couleur exacte de sa poche.
- **Do** écrire le signe devant toute variation (+13,9 %, −4 614 €) et le montant à côté de tout écart.
- **Do** utiliser l'encre pour tout élément interactif principal : bouton primaire, case cochée, trait de cible, ligne de graphique.
- **Do** séparer les lignes par un filet de 1 px en `rule` et teinter le survol en papier enfoncé.
- **Do** garder les chiffres tabulaires (`tnum` ou `num`) sans exception.
- **Do** respecter `prefers-reduced-motion` : toutes les transitions tombent à zéro.
- **Do** montrer un état vide qui dit ce qui apparaîtra ici.

### Don't:
- **Don't** reproduire l'ancienne v1 « Midnight Luxe » : fond noir, or, lueurs, dégradés, animations d'entrée, mot « wealth ».
- **Don't** faire une app de banque : promos, cartes en grille, icônes décoratives, chiffres noyés dans le chrome.
- **Don't** faire un tableur ou Grafana : un tableau nu sans titre de section, sans pastille, sans hiérarchie.
- **Don't** faire une app crypto : néon, graphiques en chandeliers, rouge et vert saturés.
- **Don't** utiliser le gabarit « gros chiffre, petit label, stats de soutien » ni une grille de cartes identiques.
- **Don't** utiliser `#000`, `#fff`, ni un gris sans teinte. Tout neutre est teinté entre 60 et 85.
- **Don't** mettre une ombre portée, un flou décoratif, un dégradé, un `border-left` coloré de plus de 1 px, un texte en dégradé.
- **Don't** imbriquer un panneau dans un panneau.
- **Don't** colorer un bouton avec une couleur de poche ni réutiliser une couleur de poche pour une autre donnée.
- **Don't** ouvrir un modal : la saisie est inline, le cochage est direct, la création d'instrument est un `details` replié.
- **Don't** écrire de libellé en capitales, ni de tiret cadratin dans l'interface.
