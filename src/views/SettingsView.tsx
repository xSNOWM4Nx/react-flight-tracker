import React, { useContext } from 'react';
import { Box, Typography, Card, CardContent, FormGroup, FormControl, FormControlLabel, InputLabel, Switch, Select, SelectChangeEvent, MenuItem } from '@mui/material';
import { SystemContext, ViewContainer } from '@daniel.neuweiler/react-lib-module';
import { AppContext } from './../contexts';
import { ViewKeys } from './navigation';
import { ThemeKeys } from './../styles';

export class SettingKeys {
  public static ShowDataOverlayOnMap = 'ShowDataOverlayOnMap';
  public static ShowLogOverlayOnMap = 'ShowLogOverlayOnMap';
};

interface ILocalProps {
}
type Props = ILocalProps;

const SettingsView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.SettingsView;

  // Contexts
  const systemContext = useContext(SystemContext);
  const appContext = useContext(AppContext);

  const getSetting = (key: string, type: string) => {

    const value = systemContext.getSetting(key)
    if (typeof (value) === type)
      return value;

    return false;
  };

  const handleChange = (e: SelectChangeEvent) => {
    appContext.changeTheme(e.target.value);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    systemContext.storeSetting(e.target.name, e.target.checked);
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
                onChange={handleChange}>

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
                  name={SettingKeys.ShowDataOverlayOnMap}
                  checked={getSetting(SettingKeys.ShowDataOverlayOnMap, 'boolean')}
                  onChange={handleSettingsChange} />
              }
              label="Show data overlay on map"
            />
            <FormControlLabel
              control={
                <Switch
                  color='secondary'
                  name={SettingKeys.ShowLogOverlayOnMap}
                  checked={getSetting(SettingKeys.ShowLogOverlayOnMap, 'boolean')}
                  onChange={handleSettingsChange} />
              }
              label="Show log overlay on map"
            />
          </FormGroup>
        </CardContent>
      </Card>
    );
  };

  return (

    <ViewContainer
      isScrollLocked={true}>

      {renderAppSettings()}

      <Box sx={{ height: (theme) => theme.spacing(1) }} />

      {renderMapSettings()}
    </ViewContainer>
  );
}

export default SettingsView;
