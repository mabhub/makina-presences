import * as Sentry from '@sentry/node';

/**
 * État d'initialisation Sentry (module-scoped pour optimiser les cold starts)
 */
let sentryInitialized = false;

/**
 * Initialise Sentry pour les fonctions serverless Netlify
 * L'initialisation n'est effectuée qu'une fois pour optimiser les cold starts
 * @param {string} functionName - Nom de la fonction pour le tagging
 */
export const initSentry = (functionName) => {
  if (sentryInitialized) {
    return;
  }

  const sentryDsn = Netlify.env.get('VITE_SENTRY_DSN');

  if (!sentryDsn) {
    // Note: Sentry DSN non configuré pour les fonctions serverless
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: Netlify.env.get('CONTEXT') || 'production',
    release: Netlify.env.get('COMMIT_REF') || 'unknown',

    // Tracing pour les fonctions serverless
    tracesSampleRate: 1,

    // Tag pour identifier la fonction
    initialScope: {
      tags: {
        function: functionName,
        platform: 'netlify-functions',
      },
    },

    // Intégrations spécifiques pour Node.js
    integrations: [
      Sentry.httpIntegration(),
    ],
  });

  sentryInitialized = true;
};

/**
 * Configure le contexte Sentry pour une invocation
 * @param {Object} scope - Scope Sentry
 * @param {Request} req - Requête HTTP
 * @param {Object} context - Contexte Netlify
 */
const setupSentryContext = (scope, req, context) => {
  scope.setContext('request', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  });

  scope.setContext('netlify', {
    requestId: context.requestId,
    ...context,
  });
};

/**
 * Wrapper pour handler de fonction Netlify avec capture d'erreurs Sentry
 * Gère automatiquement l'initialisation, la capture d'erreurs et le flush
 *
 * @param {string} functionName - Nom de la fonction (pour le monitoring)
 * @param {Function} handler - Handler à wrapper
 * @returns {Function} Handler wrappé avec gestion Sentry
 *
 * @example
 * export default wrapWithSentry('list', async (req, context) => {
 *   return handleList(getDefaultDeps());
 * });
 */
export const wrapWithSentry = (functionName, handler) => {
  return async (req, context) => {
    // Initialiser Sentry au premier appel
    initSentry(functionName);

    // Créer un scope isolé pour cette invocation
    return Sentry.withScope(async (scope) => {
      try {
        // Configurer le contexte
        setupSentryContext(scope, req, context);

        // Exécuter le handler
        const response = await handler(req, context);

        // Capturer les erreurs HTTP (4xx/5xx)
        if (response.status >= 400) {
          scope.setLevel(response.status >= 500 ? 'error' : 'warning');
          Sentry.captureMessage(
            `HTTP ${response.status} in ${functionName}`,
            {
              level: response.status >= 500 ? 'error' : 'warning',
              extra: {
                statusCode: response.status,
                statusText: response.statusText,
              },
            },
          );
        }

        return response;
      } catch (error) {
        // Capturer l'exception
        Sentry.captureException(error, {
          tags: {
            function: functionName,
          },
        });

        // Retourner une réponse d'erreur propre
        return Response.json(
          {
            error: 'Internal Server Error',
            message: error.message,
          },
          {
            status: 500,
          },
        );
      } finally {
        // S'assurer que tous les événements sont envoyés avant la fin de l'exécution
        // Critique pour les fonctions serverless qui peuvent terminer brutalement
        await Sentry.flush(2000);
      }
    });
  };
};
