import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

export const oidcConfig = {
  authority: 'http://localhost:8080/realms/presences',
  client_id: 'presences',
  redirect_uri: `${window.location.origin}${window.location.pathname}`,
  post_logout_redirect_uri: window.location.origin,
  accessTokenExpiringNotificationTimeInSeconds: 5,
};

export const onSigninCallback = () => {
  window.history.replaceState({}, '', window.location.pathname);
};

const ProtectedApp = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    if (!(auth.isAuthenticated || auth.isLoading)) {
      auth.signinRedirect();
    }
  }, [auth]);

  useEffect(() => auth.events.addAccessTokenExpired(() => {
    auth.signoutRedirect();
  }), [auth.events, auth.signinSilent, auth]);

  return (
    auth.isLoading || !auth.isAuthenticated
      ? <h1>Loading ...</h1>
      : children
  );
};

export default ProtectedApp;
