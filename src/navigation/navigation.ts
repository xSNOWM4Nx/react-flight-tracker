import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';

import ErrorIcon from '@mui/icons-material/Error';
import FlightIcon from '@mui/icons-material/Flight';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';

export class ViewKeys {

  public static ErrorView: string = 'ErrorView';
  public static MapView: string = 'MapView';
  public static SettingsView: string = 'SettingsView';
  public static LogView: string = 'LogView';
  public static AboutView: string = 'AboutView';
};

export const ViewNavigationElements: { [key: string]: NavigationElementProps } = {
  [ViewKeys.ErrorView]: {
    display: {
      key: "views.errorview.display",
      value: "Uuups"
    },
    key: ViewKeys.ErrorView,
    importPath: "views/ErrorView",
    icon: ErrorIcon
  },
  [ViewKeys.MapView]: {
    display: {
      key: "views.mapview.display",
      value: "Flight map"
    },
    key: ViewKeys.MapView,
    importPath: "views/MapView",
    icon: FlightIcon
  },
  [ViewKeys.SettingsView]: {
    display: {
      key: "views.settingsview.display",
      value: "Settings"
    },
    key: ViewKeys.SettingsView,
    importPath: "views/SettingsView",
    icon: SettingsIcon
  },
  [ViewKeys.LogView]: {
    display: {
      key: "views.logview.display",
      value: "Logs"
    },
    key: ViewKeys.LogView,
    importPath: "views/LogView",
    icon: CodeIcon
  },
  [ViewKeys.AboutView]: {
    display: {
      key: "views.logview.display",
      value: "About"
    },
    key: ViewKeys.AboutView,
    importPath: "views/AboutView",
    icon: InfoIcon
  }
};

export const getImportableView = async (dynamicFilePath: string) => {

  let page: any;

  const splitName = dynamicFilePath.split('/');

  switch (splitName.length) {

    case 1:
      page = await import(`./../${splitName[0]}.tsx`);
      break;
    case 2:
      page = await import(`./../${splitName[0]}/${splitName[1]}.tsx`);
      break;
    case 3:
      page = await import(`./../${splitName[0]}/${splitName[1]}/${splitName[2]}.tsx`);
      break;
    case 4:
      page = await import(`./../${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}.tsx`);
      break;
  }

  // if (splitName.length === 1) {
  //   page = await import(`./../${splitName[0]}.tsx`);
  // }
  // if (splitName.length === 2) {
  //   page = await import(`./../${splitName[0]}/${splitName[1]}.tsx`);
  // }
  // if (splitName.length === 3) {
  //   page = await import(`./../${splitName[0]}/${splitName[1]}/${splitName[2]}.tsx`);
  // }
  // if (splitName.length === 4) {
  //   page = await import(`./../${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}.tsx`);
  // }

  return page;
};
