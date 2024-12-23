import { alpha, Box, lighten, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import createPersistedState from 'use-persisted-state';
import { sameLowC } from '../helpers';

const useTriState = createPersistedState('tri');

const useStyles = makeStyles(theme => ({
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },

  base: {
    position: 'absolute',
    top: '0',
    width: '50%',
    height: '100%',
    border: 'none',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    fontSize: '0.75em',
    padding: theme.spacing(0),
    display: 'flex',
    justifyContent: 'center',
    transition: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  occupied: {
    backgroundColor: alpha(theme.palette.primary.main, 0.25),
    color: lighten(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.75 : 0),
    boxShadow: 'none',
  },

  ownSpot: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  ownSpotPending: {
    backgroundColor: theme.palette.secondary.main,
  },

  disabled: {
    backgroundColor: 'transparent',
    color: theme.palette.primary.fg,
    opacity: 0.6,
  },
  badgeTri: {
    width: 'fit-content',
    padding: '0 2px',
    textAlign: 'center',
    color: theme.palette.primary.fg,
    background: theme.palette.primary.bg,
    zIndex: '2',
    borderRadius: '6px',
    margin: '0 auto',
    lineHeight: '1.1em',
    position: 'relative',
    '&:before': {
      content: "''",
      position: 'absolute',
      top: '-1px',
      height: 'calc(100% + 2px)',
      background: 'inherit',
      zIndex: '-1',
      border: `1px solid ${alpha(theme.palette.primary.fg, 0.4)}`,
    },
  },
  badgeLeft: {
    '&:before': {
      borderTopLeftRadius: 'inherit',
      borderBottomLeftRadius: 'inherit',
      borderRightColor: 'transparent',
      right: 'calc(50% + 1px)',
      width: '50%',
    },
  },
  badgeRight: {
    '&:before': {
      borderTopRightRadius: 'inherit',
      borderBottomRightRadius: 'inherit',
      borderLeftColor: 'transparent',
      width: 'calc(50% + 1px)',
      left: '50%',
    },
  },
  badgePending: {
    background: theme.palette.secondary.main,
    color: theme.palette.primary.bg,
    border: theme.palette.secondary.main,
  },
  badgeShare: {
    alignSelf: 'center',
  },
}));

const SpotButtonHalfDay = ({
  presences,
  onConflict,
  disabled,
  position,
  isShared,
  borderColor,
}) => {
  const classes = useStyles();
  const [ownTri] = useTriState('');

  // const [openTootltip, setOpen] = useState(isHover);

  // useEffect(() => {
  //   setOpen(isHover);
  // }, [isHover]);

  const [presence] = presences;

  const rest = React.useMemo(
    () => presences?.slice(1) || [],
    [presences],
  );

  const isConflict = Boolean(rest.length);
  const isOccupied = Boolean(presence);
  const isOwnSpot = presences.some(({ tri }) => sameLowC(ownTri, tri));

  useEffect(() => {
    if (isConflict && rest.some(({ tri }) => sameLowC(ownTri, tri))) {
      onConflict(
        isConflict,
        presences.find(({ tri: t }) => ownTri !== t).tri,
      );
    }
  }, [isConflict, onConflict, ownTri, presences, rest]);

  const triPresence = (!isConflict && presence?.tri)
  || (isConflict && (presences
    .some(({ tri }) => sameLowC(ownTri, tri))
    ? presences.find(({ tri }) => sameLowC(ownTri, tri)).tri
    : presence.tri));

  return (
    <>
      {presence?.tri && !isShared && (
        <Typography
          variant="caption"
          className={clsx({
            [classes.badgeTri]: true,
            [classes.badgeLeft]: position === 'left',
            [classes.badgeRight]: position === 'right',
            [classes.badgePending]: presence?.fake,
            [`hl-${presence?.tri}`]: presence?.tri && !disabled,
          })}
          sx={{
            border: `1px solid ${borderColor}`,
          }}
        >
          {triPresence}
        </Typography>
      )}
      <Box
        className={clsx({
          [classes.left]: position === 'left',
          [classes.right]: position === 'right',
          [classes.base]: true,
          [classes.ownSpot]: isOwnSpot,
          [classes.ownSpotPending]: isOwnSpot && presence?.fake,
          [classes.occupied]: isOccupied && !isOwnSpot,
          [classes.disabled]: disabled,
          [`hl-${presence?.tri}`]: presence?.tri && !disabled,
        })}
      >
        {isShared && (
        // <Tooltip
        //   title={triPresence}
        //   open={openTootltip}
        //   PopperProps={{
        //     modifiers: [
        //       {
        //         name: 'offset',
        //         options: {
        //           offset: position === 'left'
        //             ? [-10, -45]
        //             : [10, -45],
        //         },
        //       },
        //     ],
        //   }}
        // >
        <Typography variant="caption" className={classes.badgeShare} title="test">
          {`${Array.from(triPresence)[0]}.`}
        </Typography>
        // </Tooltip>
        )}
      </Box>
    </>
  );
};

export default React.memo(SpotButtonHalfDay);
