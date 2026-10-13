# Automations Superset

Deux automations tournent sur le Mac de Léo via Superset, agent « Claude SEO » (`claude --dangerously-skip-permissions --model claude-opus-5-5`), workspace relié à ce repo.

| Automation | Planning (RRULE) | Prompt |
|---|---|---|
| Patrimoine : clôture du mois | `FREQ=MONTHLY;BYMONTHDAY=1;BYHOUR=8;BYMINUTE=0` | `mois.md` |
| Patrimoine : revue trimestrielle | `FREQ=MONTHLY;BYMONTH=1,4,7,10;BYMONTHDAY=2;BYHOUR=8;BYMINUTE=0` | `trimestre.md` |

Le Mac doit être allumé et éveillé à l'heure du run. Les prompts ici sont la source : après modification, recoller dans Superset (`automations_set_prompt`).
