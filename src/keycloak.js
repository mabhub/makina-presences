import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'presences',
  clientId: 'presences',
});

try {
  await keycloak.init({ onLoad: 'login-required' });
} catch (error) {
  console.error('Failed to initialize adapter:', error);
}

const isSessionExpired = async () =>
  keycloak.updateToken(-1).then(() => false).catch(() => true);

const getBaseRowToken = () =>
  keycloak.tokenParsed.baserow_token[0];

export default { keycloak, isSessionExpired, getBaseRowToken };
