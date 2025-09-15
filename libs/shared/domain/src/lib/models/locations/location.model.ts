export interface Coordinates {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface IndoorLocation {
  buildingId: string;
  floor: number;
}

export interface Locations {
  coordinates: Coordinates;
  indoor?: IndoorLocation;
  address?: string;
}

/**
 * @Interface GeolocationCoordinates
 * @Description Defines a structure for geographic coordinates.
 * @Version 1.0.0
 */
export interface GeolocationCoordinates {
  /** Latitude in decimal degrees. Range: -90 to +90. */
  latitude: number;
  /** Longitude in decimal degrees. Range: -180 to +180. */
  longitude: number;
  /** Optional: Altitude in meters above the WGS84 ellipsoid. */
  altitude?: number;
  /** Optional: Accuracy of the latitude and longitude coordinates in meters. */
  accuracy?: number;
}
