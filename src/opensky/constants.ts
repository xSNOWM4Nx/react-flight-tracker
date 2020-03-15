export const URL = 'https://opensky-network.org/api';
export const routesEndpoint = 'api/routes?callsign={callsign}';
export const aircraftEndpoint = 'api/metadata/aircraft/icao/{icao24}';
export const airportsEndpoint = 'api/airports/?icao={ICAO}';

export class Constants {
  public static DEFAULT_MIN_LATITUDE = 45.8389;
  public static DEFAULT_MAX_LATITUDE = 47.8229;
  public static DEFAULT_MIN_LONGITUDE = 5.9962;
  public static DEFAULT_MAX_LONGITUDE = 10.5226;
}
