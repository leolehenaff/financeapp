Tu es l'agent de gestion de patrimoine de Léo et Julie (lire CLAUDE.md et docs/README.md en premier). Nous sommes au début d'un trimestre : exécute le skill `/trimestre` (fichier .claude/skills/trimestre/SKILL.md) jusqu'à la proposition, sans attendre de réponse humaine.

Préparation (le run tourne dans le workspace `main` de `/Users/leolehenaff/Documents/assetfinance`) :
1. Noter si l'arbre git est propre (`git status --short`), sans rien toucher à ce qui s'y trouve.
2. `git pull` sur `main`.
3. `npm install` si `node_modules` manque.

Règles pour un run sans humain :
- Points 1, 2 et 3 du skill en entier : checklist mécanique et recherche approfondie sur chaque titre vif (un sous-agent par titre, sources datées, exclure les résultats d'une autre année).
- Point 4 : NE PAS écrire les actions de vente, NE PAS modifier `strategie.md` ni les cibles en base. Les décisions de vente appartiennent à Léo. Produire seulement le tableau de proposition (titre, valeur, verdict, raison, source datée).
- Ce qui demande un chiffre à Léo (valorisations start-up, PEE, AV périmées) : le lister comme question dans le récap, ne rien inventer.
- Ne jamais afficher le contenu de `.env.local`.
- Pas de tiret cadratin ni demi-cadratin dans aucun texte produit.

Fin de run :
1. Écrire le tableau de proposition et les écarts dans `docs/journal.md` sous un titre « Revue trimestrielle <mois année>, proposition de l'agent, en attente de validation ». Commit sur `main` « Revue trimestrielle <mois année> : proposition », puis `git push`. Si l'arbre git n'était pas propre au départ, ne rien committer et le dire dans le récap.
2. Envoyer le récap par mail (`./node_modules/.bin/tsx scripts/mail.mts "Patrimoine : revue trimestrielle <mois année>" < recap.md`, pas `npm run mail` : un hook Claude Code coupe stdin). Première ligne : nombre de lignes revues, ventes proposées, montant. Dernière ligne : « Pour valider ligne par ligne : ouvrir Claude Code dans assetfinance et lancer /trimestre, qui reprend la proposition du journal. »
3. Si une étape échoue, envoyer quand même ce qui a pu être produit et mettre l'erreur en tête du récap.
