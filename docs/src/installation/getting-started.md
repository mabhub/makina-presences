# Démarrage


## Prérequis

Pour pouvoir utiliser Présences, il vous faudra :
- une instance [BaseRow](https://baserow.io/) fonctionnelle <br>
(voir comment [Configurer BaseRow](./config-db))
- [Node.js](https://nodejs.org/) version ??
- [npm](https://www.npmjs.com/) version ??
- [Git](https://git-scm.com/) CLI ou GUI

## Installation

Tout d'abord, commencer par cloner le dépôt git :
```sh
git clone https://github.com/mabhub/makina-presences
```

Créer ensuite un fichier `.env` à la racine du projet. Similaire au fichier `.env.dist` existant, compléter le fichier créé :
```sh
VITE_BASEROW_TOKEN=
VITE_ARCHIVE_ROOT=https://domain.tld

VITE_TABLE_ID_SPOTS=
VITE_TABLE_ID_PRESENCES=
VITE_TABLE_ID_PLANS=
VITE_TABLE_ID_ADDITIONALS=

BM_APIKEY=
BM_APIPATH=
BM_DOMAIN=

TT_BASEROW_TOKEN=
TT_BASEROW_TABLE=
```

Voir [Comment créer sa clé API BaseRow](https://baserow.io/blog/connect-baserow-to-external-tools-with-api#:~:text=2.-,Obtain%20your%20Baserow%20API%20key,-Next%2C%20we%20want) et [Comment récupérer l'identifiant de table BaseRow](https://baserow.io/user-docs/database-and-table-id)

## Démarrer l'application

Lancer l'application avec la commande : 
```sh
npm run dev
```