import React, { useContext } from 'react';
import { Box, Typography, Card, CardContent, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { SystemContext, ViewContainer } from '@daniel.neuweiler/react-lib-module';
import { ViewKeys } from './navigation';
import { CardGiftcardRounded } from '@mui/icons-material';

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
  const systemContext = useContext(SystemContext)

  const getSetting = (key: string, type: string) => {

    const value = systemContext.getSetting(key)
    if (typeof (value) === type)
      return value;

    return false;
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    systemContext.storeSetting(e.target.name, e.target.checked);
  };

  const renderMapSettings = () => {

    return (
      <Card>

        <CardContent
          sx={{
            backgroundColor: (theme) => theme.palette.grey[700]
          }}>

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

      {renderMapSettings()}
    </ViewContainer>
  );
}

export default SettingsView;
