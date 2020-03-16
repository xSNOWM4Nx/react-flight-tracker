import { ReactComponent as FlightIcon } from './../resources/flight-24px.svg';
import { ReactComponent as FlightLandIcon } from './../resources/flight_land-24px.svg';
import { ReactComponent as FlightLandFlippedIcon } from './../resources/flight_land-24px_flippedx.svg';
import { ReactComponent as FlightTakeoffIcon } from './../resources/flight_takeoff-24px.svg';
import { ReactComponent as FlightTakeoffFlippedIcon } from './../resources/flight_takeoff-24px_flippedx.svg';

const altitudeStateLimit = 1000;

export const getFormattedValue = (rawValue: number, maxFractionDigits: number) => {

  const NumberFormatter = new Intl.NumberFormat('de-CH', { style: 'decimal', useGrouping: false, maximumFractionDigits: maxFractionDigits });
  return NumberFormatter.format(rawValue);
};

export const getIconName = (isOnGround: boolean, verticalRate: number, altitude: number, trueTrack: number): string => {

  if (isOnGround)
    return 'flight-icon';

  if (altitude <= 0)
    return 'flight-icon';

  if (verticalRate > 0 && altitude < altitudeStateLimit)
    if (trueTrack < 180)
      return 'flight-takeoff-icon';
    else
      return 'flight-takeoff-flipped-icon';

  if (verticalRate < 0 && altitude < altitudeStateLimit)
    if (trueTrack < 180)
      return 'flight-land-icon';
    else
      return 'flight-land-flipped-icon';

  return 'flight-icon';
};

export const getIcon = (isOnGround: boolean, verticalRate: number, altitude: number) => {

  if (isOnGround)
    return FlightIcon;

  if (altitude <= 0)
    return FlightIcon;

  if (verticalRate > 0 && altitude < altitudeStateLimit)
    return FlightTakeoffIcon;

  if (verticalRate < 0 && altitude < altitudeStateLimit)
    return FlightLandIcon;

  return FlightIcon;
};

export const getRotation = (trueTrack: number, verticalRate: number, altitude: number) => {

  if (verticalRate > 0 && altitude < altitudeStateLimit)
    return 0.0;

  if (verticalRate < 0 && altitude < altitudeStateLimit)
    return 0.0;

  return trueTrack;
};

export const getColor = (altitude: number) => {

  var percent = altitude / 13000 * 100;
  if (percent > 100)
    percent = 100;
  if (percent < 0)
    percent = 0;

  var r, g, b = 0;
  if (percent < 50) {
    r = 255;
    g = Math.round(5.1 * percent);
  }
  else {
    g = 255;
    r = Math.round(510 - 5.10 * percent);
  }

  var h = r * 0x10000 + g * 0x100 + b * 0x1;

  return '#' + ('000000' + h.toString(16)).slice(-6);
};

export const getStatusText = (isOnGround: boolean, verticalRate: number, altitude: number): string => {

  if (isOnGround)
    return 'On Ground';

  if (altitude <= 0)
    return 'On Ground';

  if (verticalRate > 0 && altitude < altitudeStateLimit)
    return 'Taking off';

  if (verticalRate < 0 && altitude < altitudeStateLimit)
    return 'Landing';

  return 'On Track';
};
