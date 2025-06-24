import { Grid } from '@mui/material';

/**
 * NoPresenceMessage component: displays a message when no one is present.
 * @param {Object} props
 * @param {Object} props.classes - JSS classes.
 * @returns {JSX.Element}
 */
const NoPresenceMessage = ({ sx = {}, ...props }) => (
  <Grid item sx={{ textAlign: 'center', width: '100%', opacity: '.5', ...sx }} {...props}>
    Aucune personne présente
  </Grid>
);

export default NoPresenceMessage;
