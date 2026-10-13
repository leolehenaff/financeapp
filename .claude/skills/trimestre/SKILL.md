---
name: trimestre
description: Revue trimestrielle du patrimoine (janvier, avril, juillet, octobre). Checklist de docs/revues.md, puis recherche approfondie sur chaque titre vif pour décider conserver ou vendre sur catalyseur daté, avec réinvestissement en ETF selon l'écart géo. Propose, Léo valide, l'agent écrit les actions datées et le journal.
---

# /trimestre

Décisions de vente : jamais sur le cours, toujours sur une date ou un catalyseur (`docs/strategie.md`, principe 7). Règle d'or : « si je partais de zéro avec ce montant en cash, est-ce que je l'achèterais aujourd'hui ? » Non = on vend. L'agent propose, Léo tranche ligne par ligne, l'agent enregistre.

## 1. Lire

```bash
npm run etat 2>&1 | grep -v -i deprecat
```

Puis `docs/strategie.md`, `docs/actions.md`, les trois dernières entrées de `docs/journal.md`, et la section « Revue trimestrielle » de `docs/revues.md`.

## 2. Checklist mécanique (revues.md)

1. Écarts aux cibles type et géo : noter les trois plus gros.
2. Virements automatiques : apports des trois derniers mois contre plan (`getMonthProgress` pour chaque mois). Signaler tout mois sous le plan.
3. `docs/actions.md` : lister ce qui est dû, demander à Léo ce qui est fait, cocher ou reporter avec raison.
4. Valorisations périmées : demander les chiffres (start-up, PEE, AV), écrire une ligne `prices` par chiffre reçu.
5. Ligne > 10 % du patrimoine : signal de revue hors calendrier, à traiter au point 3.

## 3. Titres vifs : recherche approfondie

Pour chaque ligne de la section « Titres vifs » de `npm run etat` qui n'a pas déjà une action de vente datée en base, lancer un sous-agent par titre, en parallèle, avec ce brief :

> Titre : <nom, ticker>. Position : <valeur, gain, % du patrimoine>. Date du jour : <date>. Recherche web sourcée et datée, exclure tout résultat d'une autre année que l'année en cours et la précédente. Rendre, en 15 lignes maximum : (a) derniers résultats publiés et réaction du marché ; (b) prochain catalyseur daté (publication, AG, détachement de dividende, cession, procès) ; (c) consensus analystes et valorisation actuelle contre historique 5 ans ; (d) la thèse d'achat initiale tient-elle encore ; (e) réponse à la règle d'or avec une phrase de justification. Chaque fait avec sa source et sa date.

Déclencheurs de vente, dans l'ordre :

1. Règle d'or : non.
2. Ligne > 10 % du patrimoine : vente par tiers sur trois catalyseurs successifs (modèle Capgemini en base).
3. Thèse cassée (changement de direction, de marché, de régulation).
4. Fiscalité : PEA de plus de 5 ans, pas de frottement, aucune raison fiscale de différer.

Conserver = par défaut. Une ligne conservée reçoit quand même son prochain catalyseur daté en action « revoir <titre> après <événement> » si l'agent a un doute.

Réinvestissement : toujours en ETF, réparti au prorata des gaps géo positifs hors France (même règle que `/mois`), sur le compte d'origine. Jamais une nouvelle ligne de titre vif.

## 4. Proposer, puis écrire

Tableau à Léo : titre, valeur, verdict (conserver, vendre le <date> sur <catalyseur>, revoir le <date>), raison en une ligne, source datée. Attendre sa validation ligne par ligne.

Pour chaque ligne validée : une action section `Calendrier des ventes et achats`, échéance = date du catalyseur, titre au format des actions existantes : « vendre <titre> (<n> titres, ≈<montant> €) après <catalyseur>. Réinvestir en <ETF> ». Insertion comme dans `/mois`.

Puis :

- `docs/journal.md` : un paragraphe daté « Revue trimestrielle <mois année> » avec les écarts, les décisions et leur raison.
- `docs/strategie.md` : colonne « Réel au <date> » des deux tableaux de cibles.
- `docs/actions.md` : coches et reports du point 2.3.
- Si une cible ou une hypothèse change : `allocation_objectives` ou `hypotheses` en base, et `strategie.md`.

## 5. Rendre compte

Première ligne : nombre de lignes revues, nombre de ventes proposées, montant total. Puis le tableau. Terminer par une seule prochaine action.

## 6. Envoyer le récap

Après l'écriture du point 4, récap en Markdown dans le scratchpad (écarts aux cibles, tableau des décisions validées avec dates, valorisations rafraîchies, prochaine action), puis :

```bash
npm run mail -- "Patrimoine : revue trimestrielle <mois année>" < /chemin/recap.md
```

Destinataires dans `MAIL_TO` (Léo et Julie). Si la commande échoue, le dire en fin de réponse, ne pas réessayer.
