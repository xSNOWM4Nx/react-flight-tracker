import { mapViewNavigationData, settingsViewNavigationData, aboutViewNavigationData } from '../views/viewKeys.ts';

// Types
import type { INavigationElement } from './navigationTypes.js';

export const navigationElements: Array<INavigationElement> = [
  aboutViewNavigationData,
  settingsViewNavigationData,
  mapViewNavigationData
];

export const getImportableView = async (dynamicFilePath: string) => {

  let page: any;

  // These are the only views that are currently imported dynamically
  // This is a workaround to avoid dynamic/static imports warning for all views in vite
  if (dynamicFilePath === 'views/MapView') {
    page = await import('./../views/MapView.tsx');
  }
  if (dynamicFilePath === 'views/SettingsView') {
    page = await import('./../views/SettingsView.tsx');
  }
  if (dynamicFilePath === 'views/AboutView') {
    page = await import('./../views/AboutView.tsx');
  }

  // This is a generic approach to dynamically import views based on the path
  // It works fine but triggers a warning in vite about dynamic/static imports
  // const splitName = dynamicFilePath.split('/');
  // switch (splitName.length) {

  //   case 1:
  //     page = await import(`./../${splitName[0]}.tsx`);
  //     break;
  //   case 2:
  //     page = await import(`./../${splitName[0]}/${splitName[1]}.tsx`);
  //     break;
  //   case 3:
  //     page = await import(`./../${splitName[0]}/${splitName[1]}/${splitName[2]}.tsx`);
  //     break;
  //   case 4:
  //     page = await import(`./../${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}.tsx`);
  //     break;
  // }

  return page;
};