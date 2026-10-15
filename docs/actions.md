# Actions

Deux listes, deux endroits, pas de double saisie.

- **Sans date** : ici, à la main. Points à trancher, démarches, mise en place, corrections.
- **Avec échéance** : dans la table `actions` de la base, affichées dans l'app (Journal et « Ce mois » à 30 jours). Pour les lire :

```bash
npx tsx -e 'import { config } from "dotenv"; config({ path: ".env.local", quiet: true }); const { db } = await import("./lib/db"); for (const a of (await db.execute("SELECT due_date, status, section, title FROM actions ORDER BY due_date")).rows) console.log(Object.values(a).join(" | "));'
```

Une action faite ou abandonnée se supprime d'ici ; son contexte reste dans [journal.md](journal.md). Une action sans date qui reçoit une échéance passe en base.

## Mise en place des flux (une fois)

- [x] Léo : virement automatique 1 350 € vers PEA au 1er du mois (fait le 13/10/2026). Les ordres ne sont pas automatisables chez Banque Populaire : passés à la main chaque 1er selon la répartition posée par `/mois`.
- [x] Léo : DCA Bitstack 250 €/mois activé (13/10/2026).
- [ ] Julie : virement automatique 1 850 € au 1er du mois, ordre MSCI World.
- [ ] Première vérification : au 1er novembre, le coût d'achat cumulé dans l'app a augmenté d'environ 3 700 €.

## Points ouverts (à trancher)

- [ ] Virement Julie 1 850 €/mois vers son PEA Trade Republic (conversion CHF→EUR via son compte Wise existant, pas BCGE).
- [ ] Moriah : exercer ou non l'option sur 10 % supplémentaires à 300 €. Si exercée : achat de 300 € plus apport sur Start-up Léo.
- [ ] PEA Léo : rester chez Banque Populaire (décision du 14/10/2026). Transfert bloqué tant que Blast Army 1 et 2 (non cotés) sont dans le PEA : Trade Republic refuse le non coté et un PEA se transfère en entier. À rouvrir à la sortie de Blast Army ou si Blast indique un courtier en ligne qui accepte leurs parts. En attendant : négocier les droits de garde, vérifier s'il existe un minimum par ordre.

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

- [x] Lignes Julie (PEE ×2, Livret A) : reconstruites depuis les opérations CIC et les relevés Banque Populaire le 13/10/2026.
