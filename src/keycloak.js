import Keycloak from 'keycloak-js';
import { useMutation, useQuery } from 'react-query';

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

const isSessionExpired = async () =>
  keycloak.updateToken(-1).then(() => false).catch(() => true);

const getBaseRowToken = () =>
  keycloak.tokenParsed.baserow_token[0];

export default {
  keycloak,
  user,
  isSessionExpired,
  getBaseRowToken,
};
