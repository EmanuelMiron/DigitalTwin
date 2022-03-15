// Import Dependencies
import { object, string } from 'yup';

// Import Models
import { Polygon, polygonSchema } from './mapData';

// Import Helpers
import { notEmptyString } from '../helpers/validation';

export interface RoomData {
    name?: string;
    type: string;
    unitId: string;
    polygon: Polygon;
}

export const RoomDataSchema = object().shape({
    name: string(),
    type: notEmptyString,
    unitId: notEmptyString,
    polygon: polygonSchema,
}).defined().nullable(false);

export interface RoomsByFloorId {
    [floorId: string]: {
        [roomId: string]: RoomData | undefined;
    } | undefined;
}