// Import Dependencies
import { array, ArraySchema } from 'yup';

// Import Helpers
import { strictNumber } from '../helpers/validation';

export interface MapPosition {
  longitude: number;
  latitude: number;
}

export type Polygon = [number, number][];

const positionSchema: ArraySchema<number> = array().of(strictNumber).min(2).max(2).defined().nullable(false);
export const polygonSchema: ArraySchema<number[]> = array().of(positionSchema).defined().nullable(false).min(3);

export interface MarkerData {
  type: string;
  assetId: number;
  title?: string;
  description?: string;
  position?: MapPosition;
  url?: string;
  roomName?: string;
  iconID?: string;
}

export interface TrackerData {
  id: string;
  name: string;
  position: MapPosition;
}

export interface MapObject {
  polygon?: Polygon;
}