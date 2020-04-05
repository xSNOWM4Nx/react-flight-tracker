import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';

export const NavigantionElements: Array<NavigationElementProps> = [
  {
    display: {
      key: "views.mapview.display",
      value: "Flight map"
    },
    key: "MapView",
    importPath: "views/MapView"
  },
  {
    display: {
      key: "views.logview.display",
      value: "Logs"
    },
    key: "LogView",
    importPath: "views/LogView"
  }
]
