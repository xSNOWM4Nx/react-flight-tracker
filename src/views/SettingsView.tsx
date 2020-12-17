import React, { useContext } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { GlobalContext, ViewContainer } from '@daniel.neuweiler/react-lib-module';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import { ViewKeys } from './navigation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardRoot: {
      backgroundColor: theme.palette.grey[500]
    }
  }),
);

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

  // External hooks
  const classes = useStyles();

  // Contexts
  const globalContext = useContext(GlobalContext)

  const getSetting = (key: string, type: string) => {

    const value = globalContext.getSetting(key)
    if (typeof (value) === type)
      return value;

    return false;
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    globalContext.storeSetting(e.target.name, e.target.checked);
  };

  const renderMapSettings = () => {

    return (
      <Card
        classes={{
          root: classes.cardRoot
        }}>

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
                  name={SettingKeys.ShowDataOverlayOnMap}
                  checked={getSetting(SettingKeys.ShowDataOverlayOnMap, 'boolean')}
                  onChange={handleSettingsChange} />
              }
              label="Show data overlay on map"
            />
            <FormControlLabel
              control={
                <Switch
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
