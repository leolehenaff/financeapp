---
name: mois
description: Clôture mensuelle du patrimoine, à lancer le 1er du mois. Vérifie les apports du mois passé contre le plan, calcule la répartition PEA du mois sur l'écart aux cibles, pose les actions datées du mois (versements, ticket start-up, cold wallet, relevés), écrit le journal. Pas de recherche sur les titres vifs : c'est /trimestre.
---

# /mois

Tout part de `npm run etat`. Aucun ordre n'est passé : l'agent prépare, Léo exécute, puis l'agent enregistre.

## 1. Lire

```bash
npm run etat 2>&1 | command grep -v -i deprecat
```

Puis `docs/actions.md` (points ouverts, mise en place des flux). Si `docs/releves/<mois précédent>/` existe et que les contributions du mois précédent ne sont pas saisies, saisir d'abord (checklist « Clôture mensuelle » de `docs/revues.md`), puis relancer `npm run etat`.

## 2. Contrôler le mois passé

- Apports du mois précédent < plan de plus de 100 € chez l'un des deux : le dire en première ligne, avec le montant manquant. Cause la plus probable : virement automatique pas encore en place (voir `actions.md`) ou relevés pas déposés. Ne pas créer d'action « rattraper » sans l'accord de Léo.
- Valorisations périmées : une action « relevé <compte> » au 15 du mois pour chacune, si elle n'existe pas déjà.

## 3. Répartition du mois

Règles fixes (`docs/plan-financier.md`, `docs/strategie.md`) :

- Léo 1 850 € = 1 350 PEA + 250 Bitstack (DCA automatique) + 250 lissés pour le ticket start-up.
- PEA Léo : 1 350 € au prorata des gaps géo positifs hors France, arrondis à 50 € (le script le fait). Jamais un euro vers FR, jamais une nouvelle ligne de titre vif.
- Julie 1 850 € : MSCI World (CW8) sur PEA Trade Republic, le reliquat (moins d'une part CW8) en S&P 500 (ESE).
- Si l'action « recharge Livrets » est active (après le mariage, 500 € chacun pendant 6 à 8 mois) : retirer 500 € du flux Stock de chacun vers les Livrets A, jusqu'à 25 k€ cumulés.
- Ticket start-up 1 000 € : dû si le dernier date de 4 mois ou plus.
- Transfert Bitstack vers cold wallet : dû si le dernier date de 6 mois ou plus.
- Une action datée du mois existe déjà en base (créée à la main ou par un mois précédent) : ne pas la dupliquer.

## 4. Écrire

Section `Versements`, échéance le 1er du mois en cours (le 15 pour les relevés), sans demander validation : la règle est actée dans `plan-financier.md`. Une ligne par ordre, titre lisible dans « Ce mois » :

```bash
set -a && source .env.local && set +a && npx tsx -e 'import { db } from "./lib/db"; (async () => {
await db.batch([
  { sql: "INSERT INTO actions (section, title, due_date) VALUES (?, ?, ?)", args: ["Versements", "Léo : PEA 1 350 € = ESE 650, ETZ 400, PAEJ 300", "2026-11-01"] },
  { sql: "INSERT INTO actions (section, title, due_date) VALUES (?, ?, ?)", args: ["Versements", "Julie : 1 850 € MSCI World (CW8), reliquat en ESE", "2026-11-01"] },
]); })();'
```

(Import en tête et `source .env.local` : avec `config()` suivi d'un `import()` dynamique, `tsx -e` ne retrouve pas `db`.)

Ne pas créer d'action pour ce qui est automatique et vérifié le mois suivant par les contributions (DCA Bitstack, virement MSCI World une fois l'ordre programmé chez Trade Republic). Tant que `actions.md` liste la mise en place des flux comme non faite, créer l'action quand même.

Puis une entrée datée dans `docs/journal.md` : apports constatés, répartition posée, ce qui manque.

## 5. Rendre compte

Première ligne : ce que Léo doit faire ce mois (virements et ordres, montants). Puis les écarts du mois passé. Terminer par une seule prochaine action.

## 6. Envoyer le récap

Écrire le récap du point 5 (Markdown : tableau des actions, écarts, prochaine action) dans le scratchpad, puis :

```bash
npm run mail -- "Patrimoine : clôture <mois année>" < /chemin/recap.md
```

Destinataires dans `MAIL_TO` (Léo et Julie). Si la commande échoue (clé absente, domaine non vérifié), le dire en fin de réponse, ne pas réessayer.
