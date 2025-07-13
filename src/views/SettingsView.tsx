import React, { useContext } from 'react';
import { Box, Typography, Card, CardContent, FormGroup, FormControl, FormControlLabel, InputLabel, Switch, Select, MenuItem } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ViewKeys } from './viewKeys.js';
import { ThemeKeys } from './../styles/index.js';

// Types
import type { SelectChangeEvent } from '@mui/material';
import type { INavigationElementProps } from '../navigation/navigationTypes.js';

interface ILocalProps {
}
type Props = ILocalProps & INavigationElementProps;

const SettingsView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.SettingsView;

  // Contexts
  const appContext = useContext(AppContext);

  const pullSetting = (key: string, type: string) => {

    const value = appContext.pullSetting(key);
    if (typeof (value) === type)
      return value;

    return false;
  };

  const handleThemeChange = (e: SelectChangeEvent) => {
    appContext.changeTheme(e.target.value);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    appContext.pushSetting(e.target.name, e.target.checked);
  };

  const renderAppSettings = () => {

    return (
      <Card>

        <CardContent>

          <Typography
            variant={'h6'}
            gutterBottom={true}>
            {'App settings'}
          </Typography>

          <FormGroup>
            <FormControl
              color='secondary'
              variant="filled"
              sx={{ m: 1, minWidth: 120 }}>

              <InputLabel
                id="demo-simple-select-filled-label">
                Theme change
              </InputLabel>
              <Select
                labelId="demo-simple-select-filled-label"
                id="demo-simple-select-filled"
                value={appContext.activeThemeName}
                onChange={handleThemeChange}>

                <MenuItem
                  value={ThemeKeys.DarkTheme}>
                  {ThemeKeys.DarkTheme}
                </MenuItem>
                <MenuItem
                  value={ThemeKeys.LightTheme}>
                  {ThemeKeys.LightTheme}
                </MenuItem>
                <MenuItem
                  value={ThemeKeys.PineappleTheme}>
                  {ThemeKeys.PineappleTheme}
                </MenuItem>
              </Select>
            </FormControl>

          </FormGroup>
        </CardContent>
      </Card>
    );
  };

  const renderMapSettings = () => {

    return (
      <Card>

        <CardContent>

          <Typography
            variant={'h6'}
            gutterBottom={true}>
            {'Map settings'}
          </Typography>

          <FormGroup>

            <FormControlLabel
              control={
                <Switch
                  color='secondary'
                  name={SettingKeys.EnablePathPrediction}
                  checked={pullSetting(SettingKeys.EnablePathPrediction, 'boolean')}
                  onChange={handleSettingsChange} />
              }
              label="Enable path prediction"
            />

            <FormControlLabel
              control={
                <Switch
                  color='secondary'
                  name={SettingKeys.ShowDataOverlayOnMap}
                  checked={pullSetting(SettingKeys.ShowDataOverlayOnMap, 'boolean')}
                  onChange={handleSettingsChange} />
              }
              label="Show data overlay on map"
            />

          </FormGroup>
        </CardContent>
      </Card>
    );
  };

  return (

    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>

      {renderAppSettings()}

      <Box sx={{ height: (theme) => theme.spacing(1) }} />

      {renderMapSettings()}
    </Box>
  );
}

export default SettingsView;
