import React from 'react';
import { Typography } from '@mui/material';
import { getAppVersion } from '../version';

/**
 * Affiche la version de l'application de manière subtile.
 * Cohérent avec le design des autres composants de préférences.
 */
const VersionDisplay = () => {
  const version = getAppVersion();

  return (
    <Typography
      variant="caption"
      style={{
        paddingLeft: 10,
        opacity: 0.5,
      }}
    >
      v{version}
    </Typography>
  );
};

export default React.memo(VersionDisplay);
