# Pilotage du patrimoine Léo & Julie

Documentation vivante du projet patrimonial. Les chiffres de référence vivent dans la base Turso (app), ces fichiers portent les décisions, les règles et le calendrier.

| Fichier | Contenu | À relire |
|---|---|---|
| [strategie.md](strategie.md) | Cibles d'allocation, principes, hypothèses de rendement | Revue annuelle (juillet) |
| [plan-financier.md](plan-financier.md) | Revenus, coût de vie, flux mensuels, trajectoire FIRE | Revue annuelle (juillet) |
| [actions.md](actions.md) | Décisions datées, ventes programmées, points ouverts | Chaque revue trimestrielle |
| [julie-suisse.md](julie-suisse.md) | Salaire CHF, LPP, 3e pilier, obligations déclaratives | Quand la situation suisse change |
| [revues.md](revues.md) | Checklists de la revue trimestrielle et de la revue annuelle | À chaque revue |
| [journal.md](journal.md) | Historique des changements de stratégie, un paragraphe par date | Ajouter à chaque décision |

## Règle d'or

Toute nouvelle ligne hors ETF passe par la question : « si je partais de zéro avec ce montant en cash, est-ce que je l'achèterais aujourd'hui ? » Si non, on ne l'achète pas, et si on la détient déjà, on la vend.

## Accès aux données

Base Turso, identifiants dans `.env.local`. Exemple de lecture rapide :

```bash
set -a && source .env.local && set +a && node -e '
const {createClient}=require("@libsql/client");
const c=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
c.execute("select asset_type, round(sum(current_amount)) v from assets group by 1").then(r=>console.table(r.rows));'
```
