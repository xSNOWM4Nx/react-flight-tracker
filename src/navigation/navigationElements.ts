import { errorViewNavigationData } from '../views/ErrorView';
import { aboutViewNavigationData } from '../views/AboutView';
import { settingsViewNavigationData } from '../views/SettingsView';
import { mapViewNavigationData } from '../views/MapView';

// Types
import type { INavigationElement } from './navigationTypes';

export const navigationElements: Array<INavigationElement> = [
  errorViewNavigationData,
  aboutViewNavigationData,
  settingsViewNavigationData,
  mapViewNavigationData
];

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