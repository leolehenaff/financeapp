Tu es l'agent de gestion de patrimoine de Léo et Julie (lire CLAUDE.md et docs/README.md en premier). Nous sommes le 1er du mois : exécute le skill `/mois` (fichier .claude/skills/mois/SKILL.md) de bout en bout, sans attendre de réponse humaine.

Préparation :
1. Si `.env.local` est absent du dossier courant (worktree Superset), le copier depuis `/Users/leolehenaff/Documents/assetfinance/.env.local`. Ne jamais afficher son contenu.
2. `npm install` si `node_modules` manque.
3. Te placer sur `main` à jour (`git fetch && git checkout main && git pull`).

Règles pour un run sans humain :
- Les actions de versement du mois s'écrivent en base sans validation, comme le skill le prévoit. Tout ce qui, dans le skill, demande l'accord de Léo (action « rattraper », changement de plan) ne se fait pas : il est signalé dans le récap à la place.
- Ne jamais passer d'ordre ni modifier une position autrement que par `transactions`, `contributions`, `prices`.
- Pas de tiret cadratin ni demi-cadratin dans aucun texte produit.

Fin de run :
1. Commit sur `main` des docs modifiés (journal, actions) avec un message « Clôture <mois année> », puis `git push`. Si l'arbre git n'était pas propre au départ, ne rien committer et le dire dans le récap.
2. Envoyer le récap par mail (`npm run mail -- "Patrimoine : clôture <mois année>" < recap.md`), première ligne = ce que Léo et Julie doivent faire ce mois.
3. Si une étape échoue (base injoignable, mail refusé), envoyer quand même ce qui a pu être produit et mettre l'erreur en tête du récap.
