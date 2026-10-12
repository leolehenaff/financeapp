# Product

## Register

product

## Users

Léo et Julie, un couple de trentenaires qui pilotent leur patrimoine commun (≈ 270 k€ répartis sur PEA, start-up, crypto, livrets, cash) vers une indépendance financière à horizon 2040. Deux contextes d'usage à parts égales :

- **Le 1er du mois, sur iPhone, 5 minutes** : vérifier que les virements planifiés sont passés, saisir un achat, cocher une action datée, ressaisir une valorisation périmée. Lumière du jour, cuisine ou bureau, attention partielle.
- **Revue trimestrielle ou annuelle, sur Mac, le soir** : lire les positions compte par compte, mesurer l'écart aux cibles, regarder la trajectoire. Session posée, tableaux denses.

Léo est le pilote principal et discute la stratégie avec un agent IA qui écrit dans la même base. Julie consulte et doit comprendre l'écran sans explication.

## Product Purpose

Un cockpit d'exécution, pas un tableau de bord de consultation. L'ancienne version montrait « combien on a » et personne ne l'ouvrait. Celle-ci répond à « qu'est-ce qu'on fait ce mois-ci » : plan de versements vs réalisé, actions à échéance, écart aux cibles d'allocation, données à rafraîchir. Trois écrans : Ce mois, Patrimoine, Journal.

Succès : l'écran « Ce mois » est ouvert chaque 1er du mois, les versements saisis le jour même, aucune action datée en retard, et Julie peut dire en 10 secondes où en est le mois.

## Brand Personality

Chaleureux, visuel, ludique. Le compagnon de route qui montre le chemin parcouru et le prochain pas, pas le banquier ni le terminal. Les chiffres sont très lisibles et jamais noyés. Les poches (actions, start-up, crypto, livrets, cash) ont chacune une couleur stable, reconnaissable d'un écran à l'autre. Les progressions se voient (barres, jauges, cases cochées), les baisses se disent sans drame. Ton des libellés : français direct, tutoiement implicite, zéro jargon marketing.

Références : Mercury et Stripe Dashboard pour la clarté et la confiance calme des chiffres ; Copilot Money et YNAB pour la couleur par catégorie, les barres de progression et la petite victoire visible.

## Anti-references

- **L'ancienne v1 « Midnight Luxe »** : fond noir, or, lueurs, animations d'entrée, vocabulaire « wealth management ». Interdit.
- **La v2 « papier et encre brune » du 12/10/2026** : beige, brun, sombre le soir. Rejetée par Léo : « je veux un truc clair, joli et un peu fun ».
- **Une app de banque** (Boursorama, Revolut) : marketing, promos, cartes partout, chiffres noyés dans le chrome.
- **Un tableur ou Grafana** : grille brute, zéro hiérarchie, tout au même niveau (la v2 brute du 12/10/2026).
- **Une app crypto** : néon sur noir, graphiques criards, sensation de casino.
- Le gabarit SaaS « gros chiffre, petit label, dégradé » et les grilles de cartes identiques.

## Design Principles

1. **Le prochain pas d'abord.** Chaque écran s'ouvre sur ce qu'il y a à faire, pas sur un total. Le total est là, mais il ne commande pas.
2. **Une poche, une couleur, partout.** Stock, Start-up, Crypto, Livret, Cash gardent la même teinte sur les barres, les tableaux, les écarts et le graphique.
3. **Le progrès se voit.** Un versement saisi, une action cochée, une poche qui se rapproche de sa cible : l'interface le montre immédiatement et proportionnellement. Pas de confettis, mais une satisfaction visible.
4. **Lisible à bout de bras.** Les chiffres clés se lisent sur un iPhone tenu à distance, les tableaux denses restent lisibles sur Mac. La hiérarchie est faite par la taille et le poids, jamais par la décoration.
5. **Calme face aux baisses.** Les pertes sont dites avec leur signe et leur montant, en couleur sourde, jamais en alerte. L'outil accompagne sur vingt ans, il ne crie pas.

## Accessibility & Inclusion

Contraste AA sur tout texte et sur les chiffres colorés. Jamais la couleur seule : hausses, baisses et écarts portent toujours un signe ou un libellé. Rouge et vert restent utilisables mais chaque usage est doublé par le signe. Motion réduite respectée (prefers-reduced-motion), aucune animation nécessaire à la compréhension. Thème clair uniquement, pas de mode sombre (décision du 12/10/2026).
