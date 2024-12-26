# Gestion des Fonctionnalités

Pour gérer les fonctionnalités accessibles par les utilisateurs finaux, Présences utilise un système de `feature-flag` permettant de bloquer/activer une à une chacune des fonctionnalités non-primaires.

Pour cela, il suffit d'ajouter au fichier `.env` la variable 
```sh
VITE_FEATURE_FLAGS=
```

::: danger ATTENTION
- Si la variable n'est pas définie dans le `.env`, alors **toutes les fonctionnalités non-primares seront activés**. <br>
- Si la variable est définie dans le `.env`, mais qu'aucune valeur ne lui est attribué, alors **aucunes des fonctionnalités non-primares seront activés**.
:::

## Valeur des feature-flags

Pour chacune des fonctionnalités, voici l'intitulé des valeurs à utiliser pour activer/désactiver la fonctionnalité en question

| **Fonctionnalités**                                                               | **Valeurs du feature-flag** |
| --------------------------------------------------------------------------------- | :-------------------------: |
| [Passer l'affichage en pleine largeur](../usage/features.md#pleine-lageur)        |         fullScreen          |
| [Nombre de semaine dans le calendrier](../usage/features.md#nombre-de-semaine)    |          weekPref           |
| [Réduire les jours passés](../usage/features.md#jours-passés)                     |          pastDays           |
| [Réduire certains jours en particulier](../usage/features.md#jours-du-calendrier) |           weekDay           |
| [Choix de l'agence par défaut](../usage/features.md#agence-par-défaut)            |           agency            |
| [Gestion des postes favoris](../usage/features.md#poste-favoris)                  |          favorite           |
| [Inscription au poste sur des demi-journées](../usage/features.md#demi-journée)   |           halfDay           |
| [Inscription rapide au parking](../usage/features.md#inscription-au-parking)      |           parking           |
| Point d'information sur la carte                                                  |  complementaryInformation   |


## Fonctionnement

Les feature-flags se liste les un après les autres, séparé chacun par une virgule, comme par exemple :
```sh
VITE_FEATURE_FLAGS=fullScreen,weekPref
```

<br>

Si cette liste contient le caractère `*` (uniquement lui, ou avec d'autres valeurs), alors toutes les fonctionnalités seront activées.
```sh
VITE_FEATURE_FLAGS=fullScreen,weekPref,*
// équivalent à 
VITE_FEATURE_FLAGS=*
```

<br>

Pour activer toutes les fonctionnalités sauf certaines, il suffit d'utiliser le caractère `*` et les valeurs des feature-flag mais suffixé par un `-`. L'exemple suivant revient à activer toutes les fonctionnalités, sauf celle permettant de passer l'affichage en plein écran.
```sh
VITE_FEATURE_FLAGS=*,-fullScreen
```


### Quelques exemples

| **Effet**                                     | **Valeur**                                                           |
| --------------------------------------------- | :------------------------------------------------------------------- |
| ***fullScreen*** uniquement                   | `fullScreen` <br> `fullscreen, weekpref, -weekpref`                  |
| ***fullScreen*** et ***weekPref*** uniquement | `fullScreen,weekPref`                                                |
| tous                                          | `fullScreen,weekPref, *` <br> `*`                                    |
| tous, sauf ***fullScreen***                   | `*,-fullscreen` <br> `-fullscreen,*` <br> `fullscreen,*,-fullscreen` |
