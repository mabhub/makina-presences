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

export default keycloak;
