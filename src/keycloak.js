import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'presences',
  clientId: 'presences',
});

let user;

try {
  await keycloak.init({ onLoad: 'login-required' });
  user = await keycloak.loadUserInfo();
} catch (error) {
  console.error('Failed to initialize adapter:', error);
}

const getBaseRowToken = () =>
  keycloak.tokenParsed.baserow_token[0];

const updateToken = async () => {
  await keycloak.updateToken(5);
};

export default {
  keycloak,
  user,
  getBaseRowToken,
  updateToken,
};
