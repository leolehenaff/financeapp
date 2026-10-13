# Actions

Généré depuis la table `actions` par `npm run export:actions`. Modifier la base (app ou SQL), puis régénérer. Les décisions et leur contexte sont dans [journal.md](journal.md).

## Calendrier des ventes et achats

- [ ] **13/10/2026** : vendre LVMH (7 titres, ≈2 660 €) après publication CA T3. Réinvestir en S&P 500 (ESE).
- [ ] **30/10/2026** : CA T3 Capgemini à 7h. Vendre 89 titres (≈10 000 €). Réinvestir moitié STOXX 600 (ETZ), moitié S&P 500.
- [ ] **30/11/2026** : vendre FDJ (6 911 €), Accor (1 906 €), Veolia (1 430 €), Engie (1 547 €), Europe Defense (1 064 €). Réinvestir en MSCI World. *À valider ligne par ligne.*
- [ ] **31/01/2027** : solder le token NEXO (≈5 100 €) en 3 fois vers BTC cold wallet. *À valider.*
- [ ] **31/01/2027** : vendre 89 titres Capgemini. Même réinvestissement.
- [ ] **30/04/2027** : vendre les 88 derniers Capgemini.
- [ ] **31/07/2027** : revue annuelle. Après le mariage, les Livrets tombent vers 18 k€ : basculer 1 000 €/mois du flux Stock de Léo et Julie (500 chacun) vers les Livrets A pendant 6 à 8 mois, jusqu'à 25 k€, puis revenir au flux normal.

## Mise en place des flux (une fois)

- [ ] Léo : virement automatique 1 350 € vers PEA au 1er du mois, ordres S&P 500 800 / STOXX 600 300 / EM Asia 250.
- [ ] Léo : DCA Bitstack 250 €/mois activé.
- [x] Léo : DCA EUROX désactivé chez Nexo. (fait le 13/10/2026)
- [x] Julie : support choisi (voir points ouverts), compte ouvert. (fait le 12/10/2026)
- [ ] Julie : virement automatique 1 850 € au 1er du mois, ordre MSCI World.
- [ ] Première vérification : au 1er novembre, le coût d'achat cumulé dans l'app a augmenté d'environ 3 700 €.

## Points ouverts (à trancher)

- [ ] Virement Julie 1 850 €/mois vers son PEA Trade Republic (conversion CHF→EUR via son compte Wise existant, pas BCGE).
- [x] État des lieux complet des comptes (« nouveau départ »), puis décider si un compte-titres suisse (Swissquote) prend une part du flux. (fait le 13/10/2026)
- [x] ~~Capgemini : solder à zéro ou garder un tiers.~~ (abandonné)
- [x] ~~Les cinq ventes de novembre : oui ou non pour chacune.~~ (abandonné)
- [x] ~~Token NEXO vers BTC : oui ou non.~~ (abandonné)
- [x] ~~Julie : demander le certificat de prévoyance LPP (part employeur, par curiosité, pas de rachat prévu).~~ (abandonné)
- [ ] Compte-titres suisse (Swissquote) : prend-il une part du flux de Julie ?

## Démarches administratives

- [ ] Déclaration 2026 commune (mariés depuis mai 2026) : salaire suisse de Julie en 2047 + 2042 C, crédit d'impôt égal à l'impôt français.
- [ ] À la naissance, dans le mois : acte de naissance aux RH pour passer au barème C1N (≈ 120 à 160 CHF/mois de gain).
- [ ] À la naissance : demander les allocations familiales genevoises via l'employeur (différentiel ≈ 311 CHF/mois + allocation de naissance ≈ 2 000 CHF).
- [ ] Don parents 15 k€ : formulaire 2735 dans le mois suivant le virement.
- [ ] Déclaration 3916 pour BCGE et tout nouveau compte suisse (déclaration 2027).
- [ ] Naissance : déclaration CAF, vérification PAJE.
- [ ] Crèche Épagny : place confirmée pour fin mars 2027.
- [ ] Crédit d'impôt frais de garde activé sur la déclaration 2028.

## Corrections de données dans l'app

- [x] FDJ : 331 titres à 2,1 € de dividende donnent 10 % de rendement, incohérent avec un objectif de vente à 35 €. Vérifier quantité ou cours. (fait le 13/10/2026)
- [x] AV Generali ×2 : classées en Livret, valeur de janvier. (fait le 13/10/2026)
- [ ] Lignes Julie (PEE ×2, Livret A) : dernière mise à jour en mai.
- [x] ~~Start-up sans note ni réduction IR : Astral, NUMI, YC Spring 26, Faktus.~~ (abandonné)
- [x] ~~Alertes haute/basse : aucune configurée.~~ (abandonné)
- [x] Project X : passer en sorti. (fait le 13/10/2026)
- [x] Après l'état des lieux : supprimer les tables v1 (assets, dividends) devenues inutiles. (fait le 13/10/2026)

## Historique

- [x] Agent : recalculer les snapshots depuis le 17/01/2026 à partir des transactions datées et des cours historiques, une fois tous les comptes importés (Trade Republic, cold wallet, Livrets, PEE, AV). (fait le )
