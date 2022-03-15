// Import Dependencies
import { AllLocationsData, LocationData, LocationType, RawLocationsData } from '../models/locationsData';

export const INVALID_FLOOR_NUMBER: number = -1;

// Checks if provided data is locationData valid
export const isLocationsDataValid = (data: any): data is RawLocationsData => true;


// Zoom Values for Location Type
const zoomByLocationType: { [type: string]: number } = {
  [LocationType.Global]: 0,
  [LocationType.Region]: 1.9,
  [LocationType.Campus]: 13,
  [LocationType.Building]: 18.5,
  [LocationType.Floor]: 18.5,
}

// Export Default zoom 
export const DEFAULT_ZOOM: number = zoomByLocationType[LocationType.Global];

/** 
 * Returns zoom for the provided location type
 * */ 
export const getZoomByLocationType = (type: LocationType) => {
  return zoomByLocationType[type] ?? DEFAULT_ZOOM;
}

// maxDistance Values for Location Type
const maxDistanceByLocationType: { [type: string]: number } = {
  [LocationType.Global]: 100000000,
  [LocationType.Region]: 4000000,
  [LocationType.Campus]: 2000,
  [LocationType.Building]: 70,
  [LocationType.Floor]: 70,
}

/**
 * Export Default max Distance
 */
export const DEFAULT_MAX_DISTANCE: number = maxDistanceByLocationType[LocationType.Floor];

// Returns maxDistane for the provided location type
export const getMaxDistanceByLocationType = (type: LocationType) => {
  return maxDistanceByLocationType[type] ?? DEFAULT_MAX_DISTANCE;
}


// Returns true if the provided location has floors
export const hasFloors = (locationId: string, allLocationsData: AllLocationsData) => {
  if (!locationId || !allLocationsData) {
    return false;
  }

  const locationItemsId: string[] = allLocationsData[locationId]?.items ?? [];

  return locationItemsId.some((itemId: string) => {
    return !!itemId && allLocationsData[itemId]?.type === LocationType.Floor;
  })
}


// Get location ordnial number ( level )
const getLocationOrdinalNumber = (locationData: LocationData): number => {
  return locationData.ordinalNumber ?? locationData.parent?.items?.indexOf(locationData.id) ?? 0;
}

// deletes the provided locationData
const deleteLocation = (locationId: string, allLocationsData: RawLocationsData) => {
  const locationData = allLocationsData[locationId];

  if (locationData?.parentId) {
    let parentLocationData: LocationData | undefined = allLocationsData[locationData.parentId];

    if (parentLocationData?.items?.length) {
      const index: number = parentLocationData.items.indexOf(locationId);

      if (index !== -1) {
        parentLocationData.items.splice(index, 1);
      }
    }
  }

  delete allLocationsData[locationId];
}

// Deletes location data and locationData.parent and returns the resulting locationData
export const prepareLocationData = (locationsData: RawLocationsData): AllLocationsData => {
  for (const locationId in locationsData) {
    let locationData = locationsData[locationId]!;

    if (!locationData.name || !locationData.id) {
      deleteLocation(locationId, locationsData);
      continue;
    }

    if (locationData.parentId) {
      (locationData as LocationData).parent = locationsData[locationData.parentId];
      delete locationData.parentId;
    }

    if (locationData.type === LocationType.Floor) {
      locationData.ordinalNumber = getLocationOrdinalNumber(locationData);
    }
  }

  return locationsData;
}

// Returns the location fullName
export const getFullLocationName = (locationId: string, allLocationsData: AllLocationsData) => {
  const essentialLocationTypes = [LocationType.Global, LocationType.Region, LocationType.Campus];

  let location: LocationData | undefined = allLocationsData[locationId];
  let fullName: string = location?.name ?? locationId;

  while (location && !essentialLocationTypes.includes(location.type)) {
    location = location.parent;

    if (location) {
      fullName = `${location.name} > ${fullName}`;
    }
  }

  return fullName;
}

// Returns the location Path
export const getLocationPath = (location: LocationData | undefined) => {
  return location?.id ? "/" + location?.id : "/";
}


// Returns location with the provided locationPath
export const getLocationByPath = (path: string, allLocations: AllLocationsData): LocationData | undefined => {
  while (path.startsWith("/")) {
    // Strip leading slash
    path = path.substr(1);
  }

  while (path.endsWith("/")) {
    // Strip trailing slash
    path = path.slice(0, -1);
  }

  const location = allLocations[path];
  if (!location) {
    return;
  }

  if (
    location.type === LocationType.Building
    && location.items?.length
    && location.items[0]
    && allLocations[location.items[0]]
  ) {
    // Return floor location if the last segment points to building
    return allLocations[location.items[0]];
  }

  return location;
};

// Returns the location Segments
export const getLocationSegments = (location: LocationData): LocationData[] => {
  let loc = location;
  const result: LocationData[] = [location];
  while (loc.parent) {
    loc = loc.parent;
    result.unshift(loc);
  }

  return result;
};

// Returns buildingId for the provided location
export const getBuildingId = (location?: LocationData) => {
  let buildingId: string | undefined;

  if (location?.type === LocationType.Floor) {
    buildingId = location.parent?.id;
  } else if (location?.type === LocationType.Building) {
    buildingId = location.id;
  }

  return buildingId;
};

// Returns the facilityId for the provided location
export const getLocationFacilityId = (location: LocationData): string | undefined => {
  let facilityId = location.config?.facilityId;
  if (facilityId === undefined && location.type === LocationType.Floor) {
    facilityId = location.parent?.config?.facilityId;
  }

  return facilityId;
};

// Returns the tilesetId for the provided location
export const getLocationTilesetId = (location: LocationData): string | undefined => {
  let tilesetId = location.config?.tilesetId;
  if (tilesetId === undefined && location.type === LocationType.Floor) {
    tilesetId = location.parent?.config?.tilesetId;
  }

  return tilesetId;
};