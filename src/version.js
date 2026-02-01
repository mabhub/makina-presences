import packageJson from '../package.json';

/**
 * Récupère la version de l'application.
 * Utilise VITE_PROJECT_VERSION (injectée au build via `git describe`)
 * avec fallback vers package.json.
 *
 * @returns {string} La version de l'application
 */
export const getAppVersion = () => {
  return import.meta.env.VITE_PROJECT_VERSION || packageJson.version;
};

/**
 * Initialise la variable globale window.presences.version.
 * Compatible SSR (vérifie l'existence de window).
 */
export const initializeGlobalVersion = () => {
  if (typeof window !== 'undefined') {
    window.presences = {
      ...window.presences,
      version: getAppVersion(),
    };
  }
};
