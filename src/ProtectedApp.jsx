import { Box, LinearProgress, Typography } from '@mui/material';
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
      ? (
        <Box
          sx={{
            width: '100vw',
            height: '100dvh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'absolute',
            top: '0',
            left: '0',
            gap: '20px',
          }}
        >
          <Box sx={{ maxWidth: '300px', width: '100%' }}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2"> <strong>Chargement ...</strong> </Typography>
              <img src="/presences.svg" height="100%" alt="presences icones" />
            </Box>
            <LinearProgress />
          </Box>
        </Box>
      )
      : children
  );
};

export default ProtectedApp;
