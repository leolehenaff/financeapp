Tu es l'agent de gestion de patrimoine de Léo et Julie (lire CLAUDE.md et docs/README.md en premier). Nous sommes le 1er du mois : exécute le skill `/mois` (fichier .claude/skills/mois/SKILL.md) de bout en bout, sans attendre de réponse humaine.

Préparation (le run tourne dans le workspace `main` de `/Users/leolehenaff/Documents/assetfinance`) :
1. Noter si l'arbre git est propre (`git status --short`), sans rien toucher à ce qui s'y trouve.
2. `git pull` sur `main`.
3. `npm install` si `node_modules` manque.

Règles pour un run sans humain :
- Les actions de versement du mois s'écrivent en base sans validation, comme le skill le prévoit. Tout ce qui, dans le skill, demande l'accord de Léo (action « rattraper », changement de plan) ne se fait pas : il est signalé dans le récap à la place.
- Ne jamais passer d'ordre ni modifier une position autrement que par `transactions`, `contributions`, `prices`.
- Ne jamais afficher le contenu de `.env.local`.
- Pas de tiret cadratin ni demi-cadratin dans aucun texte produit.

Fin de run :
1. Commit sur `main` des docs modifiés (journal, actions) avec un message « Clôture <mois année> », puis `git push`. Si l'arbre git n'était pas propre au départ, ne rien committer et le dire dans le récap.
2. Envoyer le récap par mail avec `./node_modules/.bin/tsx scripts/mail.mts "Patrimoine : clôture <mois année>" < recap.md` (pas `npm run mail` : le corps n'arrive pas sur stdin), première ligne = ce que Léo et Julie doivent faire ce mois.
3. Si une étape échoue (base injoignable, mail refusé), envoyer quand même ce qui a pu être produit et mettre l'erreur en tête du récap.
