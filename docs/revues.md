# Revues

## Clôture mensuelle (10 minutes, le 1er du mois) : skill `/mois`

Léo dépose les exports dans `docs/releves/AAAA-MM/` puis dit « saisis <mois> ». L'agent propose un tableau de ce qu'il va écrire (transactions, apports, prix), Léo valide, l'agent écrit en base et met à jour le journal. Le formulaire du Journal reste pour une opération isolée.

Chaque mois :

1. PEA Banque Populaire Léo : relevé du compte espèces du mois (PDF) et les avis d'opéré du mois. Donne achats, ventes, dividendes, droits de garde, solde espèces.
2. Trade Republic Julie : export des transactions du mois (CSV ou PDF, menu Activité). Donne les achats (frais compris), dividendes, virements entrants.
3. Nexo : export des transactions du mois (CSV). Donne dépôt de 500 €, intérêts, dépenses carte, conversions.
4. Bitstack : export des transactions du mois (CSV). Donne les achats DCA et frais.
5. Blast Club : export des opérations financières si un investissement, une sortie ou un remboursement a eu lieu dans le mois.

Seulement s'il y a eu un mouvement (versement, retrait, intérêts annuels) :

6. Livret A Léo et Livret A Julie : capture du solde et du dernier mouvement.
7. AV Generali Léo et Julie : capture de la valeur de rachat.
8. PEE CIC Julie : relevé si versement, abondement ou valorisation.
9. Cold wallet : rien, sauf transfert entrant ou sortant (adresse ou capture Ledger).

Pas besoin d'export pour les cours : Yahoo les met à jour chaque jour ouvré. Les valorisations manuelles (start-up, AV, PEE) se corrigent dans « Ce mois » dès qu'un chiffre est connu.

## Revue trimestrielle (20 minutes), janvier, avril, juillet, octobre : skill `/trimestre`

1. Ouvrir l'app, page allocation : noter l'écart à chaque cible type et géo.
2. Vérifier que les virements automatiques sont passés (coût d'achat cumulé en hausse de ≈3 700 € par mois dans les snapshots).
3. Passer en revue `actions.md` : exécuter ce qui est dû, cocher, reporter ce qui ne l'est pas avec une raison.
4. Rafraîchir les lignes manuelles : Livrets, EUROX, PEE, AV, start-up (nouvelles valorisations connues).
5. Lire les notes de chaque ligne, supprimer celles qui sont obsolètes.
6. Ajouter un paragraphe dans `journal.md`.

## Revue annuelle (juillet)

1. Mettre à jour `plan-financier.md` : revenus réels, coût de vie réel sur 12 mois, nouvelles charges.
2. Recalculer le rendement réel du portefeuille sur 12 mois (snapshots) et le comparer à l'hypothèse de 6 %.
3. Revoir les cibles dans `strategie.md` si la situation a changé (maison, enfant, revenus).
4. Remettre les Livrets au niveau de 6 mois de dépenses.
5. Vérifier les obligations déclaratives (3916, formulaire 2735, crédit d'impôt crèche).
6. Faire le point LPP et 3e pilier avec Julie.

## Signaux qui déclenchent une revue hors calendrier

- Une ligne dépasse 10 % du patrimoine.
- Nexo change ses conditions ou fait l'actualité.
- Changement de revenu de plus de 20 % chez l'un des deux.
- Décision immobilière.
