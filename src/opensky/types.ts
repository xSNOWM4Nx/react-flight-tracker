export interface IMapGeoBounds {
  northernLatitude: number;
  easternLongitude: number;
  southernLatitude: number;
  westernLongitude: number;
}

export interface IStateVector {
  icao24: string; // Unique ICAO 24-bit address of the transponder in hex string representation.
  callsign: string | null; // Callsign of the vehicle (8 chars). Can be null if no callsign has been received.
  origin_country: string; // Country name inferred from the ICAO 24-bit address.
  time_position: number | null; // Unix timestamp (seconds) for the last position update. Can be null if no position report was received by OpenSky within the past 15s.
  last_contact: number; // Unix timestamp (seconds) for the last update in general. This field is updated for any new, valid message received from the transponder.
  longitude: number | null; // WGS-84 longitude in decimal degrees. Can be null.
  latitude: number | null; // WGS-84 latitude in decimal degrees. Can be null.
  baro_altitude: number | null; // Barometric altitude in meters. Can be null.
  on_ground: boolean; // Boolean value which indicates if the position was retrieved from a surface position report.
  velocity: number | null; // Velocity over ground in m/s. Can be null.
  true_track: number | null; // True track in decimal degrees clockwise from north (north=0°). Can be null.
  vertical_rate: number | null; // Vertical rate in m/s. A positive value indicates that the airplane is climbing, a negative value indicates that it descends. Can be null.
  sensors: Array<number> | null; // IDs of the receivers which contributed to this state vector.Is null if no filtering for sensor was used in the request.
  geo_altitude: number | null; // Geometric altitude in meters. Can be null.
  squawk: number | null; // The transponder code aka Squawk. Can be null.
  spi: boolean; // Whether flight status indicates special purpose indicator.
  position_source: number; // Origin of this state’s position: 0 = ADS-B, 1 = ASTERIX, 2 = MLAT
}

export interface IStateVectorData {
  time: number;
  states: Array<IStateVector>;
}

export interface IStateVectorRawData {
  time: number;
  states: Array<Array<any>>;
}

export interface IAircraftFlight {
  icao24: string; // Unique ICAO 24-bit address of the transponder in hex string representation. All letters are lower case.
  callsign: string | null; // Callsign of the vehicle (8 chars). Can be null if no callsign has been received. If the vehicle transmits multiple callsigns during the flight, we take the one seen most frequently
  firstSeen: number; // Estimated time of departure for the flight as Unix time (seconds since epoch).
  lastSeen: number; // Estimated time of arrival for the flight as Unix time (seconds since epoch)
  estDepartureAirport: string | null; // ICAO code of the estimated departure airport. Can be null if the airport could not be identified.
  estArrivalAirport: string | null; // ICAO code of the estimated departure airport. Can be null if the airport could not be identified.
  estDepartureAirportHorizDistance: number; // Horizontal distance of the last received airborne position to the estimated departure airport in meters
  estDepartureAirportVertDistance: number; // Vertical distance of the last received airborne position to the estimated departure airport in meters
  estArrivalAirportHorizDistance: number; // Horizontal distance of the last received airborne position to the estimated arrival airport in meters
  estArrivalAirportVertDistance: number; // Vertical distance of the last received airborne position to the estimated arrival airport in meters
  departureAirportCandidatesCount: number; // Number of other possible departure airports. These are airports in short distance to estDepartureAirport.
  arrivalAirportCandidatesCount: number; // Number of other possible departure airports. These are airports in short distance to estArrivalAirport.
}

export interface IAircraftTrack {
  icao24: string; // Unique ICAO 24-bit address of the transponder in hex string representation.
  callsign: string | null; // Callsign of the vehicle (8 chars). Can be null if no callsign has been received.
  stateVector?: IStateVector;
}
