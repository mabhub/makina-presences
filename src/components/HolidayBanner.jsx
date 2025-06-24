import { Grid } from '@mui/material';

/**
 * HolidayBanner component: displays the holiday banner for a day.
 * @param {Object} props
 * @param {string} props.holiday - The holiday label.
 * @param {Object} props.classes - JSS classes.
 * @returns {JSX.Element}
 */
const HolidayBanner = ({ holiday, classes, ...props }) => (
  <Grid item xs={12} className={classes.holiday} {...props}>
    Jour férié<br />
    ({holiday})
  </Grid>
);

export default HolidayBanner;
