# Pilotage du patrimoine Léo & Julie

Documentation vivante du projet patrimonial. Les chiffres de référence vivent dans la base Turso (app v2 : comptes, instruments, transactions, prix, flux planifiés, actions), ces fichiers portent les décisions, les règles et le contexte.

| Fichier | Contenu | À relire |
|---|---|---|
| [strategie.md](strategie.md) | Cibles d'allocation, principes, hypothèses de rendement | Revue annuelle (juillet) |
| [plan-financier.md](plan-financier.md) | Revenus, coût de vie, flux mensuels, trajectoire FIRE | Revue annuelle (juillet) |
| [actions.md](actions.md) | Actions sans date (points ouverts, démarches, mise en place), tenues à la main ; les actions datées sont en base, snippet de lecture dans le fichier | Chaque revue trimestrielle |
| [julie-suisse.md](julie-suisse.md) | Salaire CHF, LPP, 3e pilier, obligations déclaratives | Quand la situation suisse change |
| [revues.md](revues.md) | Checklists de la revue trimestrielle et de la revue annuelle | À chaque revue |
| [journal.md](journal.md) | Historique des changements de stratégie, un paragraphe par date | Ajouter à chaque décision |

## Règle d'or

Toute nouvelle ligne hors ETF passe par la question : « si je partais de zéro avec ce montant en cash, est-ce que je l'achèterais aujourd'hui ? » Si non, on ne l'achète pas, et si on la détient déjà, on la vend.

## Accès aux données

Base Turso, identifiants dans `.env.local`. Les positions se lisent via `getPositions()` de `lib/queries.ts` (dérivées des transactions au coût moyen pondéré, dernier prix connu) :

```bash
set -a && source .env.local && set +a && npx tsx -e '
import { getPositions } from "./lib/queries";
getPositions().then(p => console.table(p.map(x => ({ qui: x.owner, compte: x.account, instr: x.instrument, valeur: Math.round(x.value), cout: Math.round(x.cost) }))));'
```

Un versement, une vente, un dividende : une ligne dans `transactions` (saisie par l'agent depuis les exports mensuels). Une valorisation manuelle (start-up, PEE, AV) : une ligne dans `prices`.
