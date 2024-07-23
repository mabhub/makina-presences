import React from 'react';
import createPersistedState from 'use-persisted-state';

import { IconButton, Button, Menu, MenuItem, ToggleButtonGroup, ToggleButton, Typography, Divider, Chip, List, ListItem, ListItemText, Grid, Switch, ListItemIcon } from '@mui/material';
import { Person, DarkMode, WbSunny, SettingsBrightness, ArrowDropDown, Add, RemoveCircleOutline, Fullscreen } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';

import SpotDialog from './SpotDialog';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import useSpots from '../hooks/useSpots';

const useTriState = createPersistedState('tri');
const useThemePrefs = createPersistedState('themePref');

const useStyles = makeStyles(theme => {
  const maxWidth = mq => `@media (max-width: ${theme.breakpoints.values[mq]}px)`;
  const minWidth = mq => `@media (min-width: ${theme.breakpoints.values[mq]}px)`;

  return {
    icon: {
      [minWidth('md')]: { display: 'none' },
    },
    themeIcon: {
      marginRight: 7,
      fill: 'currentColor',
    },
    themeLabel: {
      textTransform: 'none',
    },
    text: {
      textTransform: 'none',
      marginLeft: theme.spacing(1),
      [maxWidth('md')]: { display: 'none' },
    }
  };
});

const UserMenu = ({useMaxWidth, setUseMaxWidth}) => {
  const [tri, setTri] = useTriState();
  const [themePrefs, setThemePrefs] = useThemePrefs('system');

  const classes = useStyles();

  const handleChangeTri = () => setTri('');

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { place } = useParams();
  const [favorites, setFavorites] = React.useState(
    JSON.parse(localStorage.getItem('favorites')) || []
  );
  const spots = useSpots(place)
  
  const handleDialogClose = (value) =>{
    setDialogOpen(false)
    if(!value || favorites.includes(value)) return null
    favorites.push(value)
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }


  const removeFavorite = (value) => {
    const newFavorite = favorites.filter(favorite => favorite !== value)
    localStorage.setItem("favorites", JSON.stringify(newFavorite))
    setFavorites(newFavorite)
  }

  return (  
    <>
      <IconButton
        className={classes.icon}
        onClick={handleClick}
        size="small"
        color="primary"
        title={tri}
      >
        <Person />
      </IconButton>

      <Button
        className={classes.text}
        onClick={handleClick}
        color="primary"
        startIcon={<Person />}
        endIcon={<ArrowDropDown />}
      >
        {tri}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <Typography style={{ paddingLeft: 10, paddingTop: 10 }} gutterBottom variant='h6'>
          Préferences
        </Typography>
        <Divider textAlign='left' >Affichage</Divider>
        <List dense>
          <ListItem>
            <ToggleButtonGroup
              size="small"
              value={themePrefs}
              exclusive
              fullWidth
            >
              <ToggleButton onClick={() => setThemePrefs('dark')} value="dark">
                <DarkMode className={classes.themeIcon} />
                <span className={classes.themeLabel}>Sombre</span>
              </ToggleButton>
              <ToggleButton onClick={() => setThemePrefs('system')} value="system">
                <SettingsBrightness className={classes.themeIcon} />
                <span className={classes.themeLabel}>Système</span>
              </ToggleButton>
              <ToggleButton onClick={() => setThemePrefs('light')} value="light">
                <WbSunny className={classes.themeIcon} />
                <span className={classes.themeLabel}>Clair</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{marginRight: "-25px"}}><Fullscreen/></ListItemIcon>
            <ListItemText primary="Pleine largeur"/>
            <Switch
              checked={useMaxWidth} 
              onChange={() => {
                localStorage.setItem("useMaxWidth", useMaxWidth)
                setUseMaxWidth(!useMaxWidth)
              }}/>
          </ListItem>
        </List>

        

        <Divider textAlign='left'>Postes Favoris</Divider>
        <List disablePadding dense>
          {favorites.length === 0 && (
            <Typography sx={{opacity: 0.4, textAlign: 'center', fontSize: '12px', margin: '15px'}} >
              Aucun postes favoris.
            </Typography>   
          )}
          {favorites.map(name => {
            const icons = {
              Nu: '🔵',
              Flex: '🟢',
              Réservé: '🔴',
              Priorisé: '🟠',
            };
            const spotIcon = spots
              .filter(spot => spot["Identifiant"] === name)
              .map(({Type: { value: type }}) => (icons[type]))
            
            return <ListItem 
              key={name}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="remove" 
                  sx={{color:"red", opacity:".5"}}
                  component={'button'} 
                  onClick={() => removeFavorite(name)}>
                    <RemoveCircleOutline/>
                </IconButton>
              }
              >
                <ListItemText primary={`${spotIcon} ${name}`} />
            </ListItem>
          })}
        </List>

        <Grid container justifyContent="flex-end" sx={{paddingRight: "10px", marginTop: "5px"}}>
          <Chip 
              label="Ajouter"  
              size="small" 
              variant="outlined" 
              color='primary' 
              icon={<Add/>}
              component={'button'}
              onClick={() => setDialogOpen(!dialogOpen)} />
        </Grid>       
        {/* <MenuItem onClick={handleChangeTri}>Changer trigramme</MenuItem> */}
      </Menu>

      {dialogOpen && (
        <SpotDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          place={place}
          date={null}
      />
      )}
    </>
  );
};

export default React.memo(UserMenu);
