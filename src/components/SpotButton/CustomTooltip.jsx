/**
 * Custom tooltip component for SpotButton
 */

import { Tooltip } from '@mui/material';
import withStyles from '@mui/styles/withStyles';

const CustomTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.getContrastText(theme.palette.background.default),
    boxShadow: theme.shadows[2],
  },
}))(Tooltip);

export default CustomTooltip;
