# react-flight-tracker
An open-source project written with React and TypeScript.

The goal of this project is to read the data from [OpenSky Network](https://opensky-network.org/) and visualize it on a map.

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![](docs/react-flight-tracker_prview.gif)

## 📦 Packages:
- [react-map-gl](https://www.npmjs.com/package/react-map-gl)
- [mapbox-gl](https://www.npmjs.com/package/mapbox-gl)
- [MUI](https://www.npmjs.com/package/@mui/material)
- [Vite](https://www.npmjs.com/package/vite)
- [TypeScript](https://www.npmjs.com/package/typescript)

## 🔮 Features:
- Using "Hooks", "Context", "Suspense", "React.lazy" and other popular React patterns.
- Written entirely in TypeScript.
- Fetching flight data from [OpenSky Network](https://opensky-network.org/).
- Using maps from [mapbox](https://www.mapbox.com/) with the React friendly wrapper [react-map-gl](https://github.com/visgl/react-map-gl).
- Using styling components from [MUI](https://mui.com/) project.
- Using [Vite](https://vitejs.dev/) to serve the app.

## 🔌 Usage:
To use the maps from [mapbox](https://www.mapbox.com/), you need an appropriate token. You can create one on their website by registering there. Registration is free and all relevant things are covered for development purposes.

For the use of the flight data via [The OpenSky Network](https://opensky-network.org/), i would also recommend creating a account on their website and setup the API client to get a client ID and a client SECRET. The flight data is then provided with a delay of ~6 seconds. Without an account, the delay is ~12 seconds.

Start by cloning the repository and install the packages:
```
npm install
```
Create a `.env.local` file in the root directory containing following entries:
```
VITE_REACT_MAPBOX_TOKEN=<YOUR_MAPBOX_TOKEN>
VITE_REACT_OSKY_CLIENT_ID=<YOUR_OPENSKYNETWORK_CLIENTID>
VITE_REACT_OSKY_CLIENT_SECRET=<YOUR_OPENSKYNETWORK_CLIENTSECRET>
```
Start the project:
```
npm run preview
```

## 📑 License:
- MIT © [xSNOWM4Nx](https://github.com/xSNOWM4Nx)