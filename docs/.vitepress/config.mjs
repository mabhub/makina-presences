import { defineConfig } from 'vitepress'


const installationNav = {
  text: 'Installation',
  items: [
    { text: "Lancer l'application", link: '/installation/getting-started'},
    { text: "Configurer BaseRow", link: '/installation/config-db'},
    { text: "Gestion des Fonctionnalités", link: '/installation/feature-flag'},
  ]
}

const usageNav = {
  text: 'Utilisation',
  items: [
    { text: "Qu'est ce que Présences ?", link: '/usage/presentation' },
    { text: "Interface", link: '/usage/ui'},
    { text: "Fonctionnalités", link: '/usage/features'},
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Présences",
  description: "Documentation de Présences",
  head: [[
    'link', {rel: 'icon', href: 'presences.svg'}
  ]],
  cleanUrls: true,
  base: '/',
  rewrites: {
    'src/:folder/:file': ':folder/:file',
    'src/:file': ':file',
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Accueil', link: '/' },
      installationNav,
      usageNav
    ],
    search: {
      provider: 'local',
      options: {
        locales: {
          root: { 
            translations: {
              button: {
                buttonText: 'Rechercher',
              },
              modal: {
                displayDetails: 'Afficher en détail dans la liste',
                resetButtonTitle: 'Réinitialiser la recherche',
                noResultsText: 'Aucun résultat pour ',
                footer: {
                  selectText: 'pour sélectionner',
                  navigateText: 'pour naviguer',
                  closeText: 'pour fermer',
                }
              }
            }
          }
        }
      }
    },
    sidebar: [
      installationNav,
      usageNav
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mabhub/makina-presences' }
    ],

    outline: {
      label: 'Sur cette page',
      level: 'deep',
    },

    returnToTopLabel: 'Haut de page',
    darkModeSwitchLabel: 'Apparence',

    logo: '/presences.svg',
  }
})
