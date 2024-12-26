<script setup>
import { withBase } from 'vitepress'
</script>

# Configurer votre instance BaseRow

Pour faire fonctionner Présences, il faut que votre base de données BaseRow contienne l'ensemble des tables nécessaires.


## Créer votre base

- <span class="title-dot"><div class="dot">1</div>**Créer les tables**</span>
  Ajouter l'ensemble des tables en important chaque fichier `.csv` que vous pouvez retrouver dans la section [Liste des tables](#listes-des-tables). 
- <span class="title-dot"><div class="dot">2</div>**Configurer les types**</span>
  Configurer les types de chaque colonne pour qu'ils correspondent aux types définies dans la section [Liste des tables](#listes-des-tables). 
- <span class="title-dot"><div class="dot">3</div>**Ajouter vos données**</span>
  Dans l'order suivant, insérer chacune de vos données :
  1) Les plans (les colonnes `postes` et `suppléments` restent vides pour le moment, il faudra les compléter une fois les tables [Postes](#table-postes) et [Suppléments](#table-suppléments) créées) <br>
  2) Les postes <br>
  3) Les suppléments <br>

## Listes des tables

### <span class="table_title"> Table <a :href="withBase('/Presences.csv')" class="link" >Presences <img alt="download"  src="/download_icon.png"> </a> </span>

Listes les différentes présences des utilisateurs. Chaque tuple représente la présence d'une personne sur un poste, pour une journée donnée.

::: details Détails
| **Attribut**          | **Type**                                     | **Description**                                                                                          |
| --------------------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| key                   | Texte                                        | Concaténation de `day` et `tri`                                                                          |
| plan                  | Texte                                        | Nom du plan contenant le poste ou s'est inscri la personne                                               |
| planID                | Texte                                        | Identifiant du plan                                                                                      |
| day                   | Date                                         | Journée de l'inscription                                                                                 |
| period                | Texte                                        | Défini sur quel période de la journée l'inscription s'est réalisé (matin, après-mid ou toute la journée) |
| tri                   | Texte                                        | Trigramme de la personne qui s'est inscrite                                                              |
| spot                  | Texte                                        | Identifiant du spot                                                                                      |
| Dernière Modification | Dernière Modification <br> (Inclure l'heure) | Date et heure de la dernière  modification                                                               |
:::


### <span class="table_title"> Table <a :href="withBase('/Postes.csv')" class="link">Postes <img alt="download"  src="/download_icon.png"> </a> </span>

Contient tout les postes de travail. Chaque poste est relié à un plan. Une personne ne peut s'inscrire que sur un seul poste à la fois.

::: details Détails
| **Attribut**          | **Type**                                                   | **Description**                                                                       |
| --------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| Identifiant           | Texte                                                      | Identifiant du poste                                                                  |
| Description           | Texte long                                                 | Description du poste (affiché au survol)                                              |
| Type*                 | Liste déroulante                                           | Type du poste                                                                         |
| x                     | Nombre <br>(Précision: 0, Autoriser les nombres négatifs)  | Position horizontal sur la carte                                                      |
| y                     | Nombre <br>(Précision: 0, Autoriser les nombres négatifs)  | Position vertical sur la carte                                                        |
| Bloqué                | Booléen                                                    | Un poste bloqué ne pourra plus être réservé, mais sera toujours affiché               |
| Plan                  | Lien vers une table (Plan) <br> (Créer un champs rapporté) | Indique sur quel plan se situe le poste                                               |
| Cumul                 | Booléen                                                    | Un poste cumulable peut être réserver en plus d'un autre poste classique ou cumulable |
| Dernière Modification | Dernière Modification <br> (Inclure l'heure)               | Date de la dernière modification                                                      |

::: warning **\* Pour le Type**
Il faut rajouter les options suivantes dans la liste déroulante : <br>
 Réservé / Priorisé / Flex / Nu /Parking
:::

### <span class="table_title"> Table <a :href="withBase('/Plan.csv')" class="link">Plan <img alt="download"  src="/download_icon.png"> </a> </span> 

Liste l'ensemble des plan contennant chacun une liste de poste de travail.

::: details Détails
| **Attribut** | **Type**                                                          | **Description**                                                         |
| ------------ | :---------------------------------------------------------------- | :---------------------------------------------------------------------- |
| Name         | Texte                                                             | Nom du plan                                                             |
| plan         | Fichier                                                           | Image du plan                                                           |
| Notes        | Texte long                                                        | Commentaire sur le plan                                                 |
| Postes       | Lien vers une table (Postes) <br> (Créer un champs rapporté)      | Liste des lien vers les potes contenu sur ce plan                       |
| Brouillon    | Booléen                                                           | Si le poste est un brouillon, il ne sera plus affiché sur l'application |
| Suppléments  | Lien vers une table (Suppléments) <br> (Créer un champs rapporté) | Lien vers les postes supplémentaires                                    |
:::

### Table TT

::: details Détails
| **Attribut** | **Type**                                                                            | **Description** |
| ------------ | :---------------------------------------------------------------------------------- | :-------------- |
| tri          | Texte                                                                               |
| Name         | Texte                                                                               |
| enabled      | Booléen                                                                             |
| excluded     | Booléen                                                                             |
| uid          | Texte                                                                               |
| tto          | Texte long                                                                          |
| total        | Nombre                                                                              |
| ttr          | Texte long                                                                          |
| last-check   | Date <br> (Inclure l'heure, Définir le fuseau horaire pour tous les collaborateurs) |
| updated      | Date de création <br> (Inclure l'heure)                                             |
| log          | Texte long                                                                          |
:::

### <span class="table_title">  Table <a :href="withBase('/Suppléments.csv')" class="link">Suppléments <img alt="download"  src="/download_icon.png"> </a> </span>

Contient les informations relatives aux postes supplémentaires (point d'information et tâches)

::: details Détails
TODO
:::


