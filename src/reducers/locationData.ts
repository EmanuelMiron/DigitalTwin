// ** Imports

// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { History } from 'history';

// ** Redux

// Import the Types
import { AppThunk, RootState } from '../store/store';

// Import Config
import { sitemapUrl } from '../config';

// Import Reducers
import { fetchSidebar } from './sidebar';
import { fetchWarningsInfo } from './warnings';
import { resetCurrentIndoorLocation } from './indoor';
import { setLayersVisibility } from './layersData';
import { fetchRoomsInfo } from './rooms';

// Import Models
import {
    AllLocationsData,
    DEFAULT_LOCATION,
    LocationData,
    RawLocationsData,
} from '../models/locationsData';

// Import Helper Functions
import {
    getBuildingId,
    getLocationByPath,
    getLocationPath,
    getLocationSegments,
    isLocationsDataValid,
    prepareLocationData,
} from '../helpers/locations';

// Import Classes
import { mapService } from '../services/mapService';
import { favoritesService } from '../services/favoritesService';



// ** Interfaces

interface CurrentLocation {
    location: LocationData;
    segments: LocationData[];
    path: string;
}

type ChangeLocationPayload = CurrentLocation;

export interface LocationState {
    current: CurrentLocation;
    isLoaded: boolean;
    allLocations: AllLocationsData;
};



// Initialise the LocationState
const initialState: LocationState = {
    allLocations: {},
    isLoaded: false,
    current: {
        location: DEFAULT_LOCATION,
        segments: [],
        path: "/",
    },
};

// ** Create LocationDataSlice 

export const locationDataSlice = createSlice({
    // State name
    name: 'locationData',
    // Initial State
    initialState,
    // Create location Data Slice actions
    reducers: {
        // Changes the current locationData
        changeLocation: (state: LocationState, action: PayloadAction<ChangeLocationPayload>) => {
            return {
                ...state,
                current: action.payload,
            };
        },

        // Changes the locationData.current
        setLocationsData: (state: LocationState, action: PayloadAction<any>) => {
            // Checks if data provided is valid
            const rawLocations: RawLocationsData = isLocationsDataValid(action.payload) ? action.payload : {};

            // Formats the raw location data
            const allLocations = prepareLocationData(rawLocations);

            return {
                ...state,
                allLocations,
                isLoaded: true,
            };
        },
    },
});



export const changeLocation = (locationId: string, history: History): AppThunk => (dispatch, getState) => {
    const { locationData: { allLocations } } = getState();
    const location = allLocations[locationId] ?? DEFAULT_LOCATION;

    if (location) {
        // Dispatch the fetchSidebar Action ( Requests Sidebar data and saves it to store )
        dispatch(fetchSidebar(location));
    }

    // Add path to the history stack
    const path = getLocationPath(location);
    history.push(path);
}



export const updateCurrentLocation = (path: string, history: History): AppThunk => (dispatch, getState) => {
    // Destructure locationData State
    const {
        locationData: {
            allLocations,
            current: {
                path: currentLocationPath,
                location: currentLocation
            }
        }
    } = getState();

    const location = getLocationByPath(path, allLocations) ?? DEFAULT_LOCATION;
    const normalizedPath = getLocationPath(location);

    if (normalizedPath !== path) {
        history.replace(normalizedPath);
        return;
    }

    if (normalizedPath === currentLocationPath) {
        return;
    }

    // Resets indoor.currentStates and indoor.currentLocation
    dispatch(resetCurrentIndoorLocation());

    // Dispatch the locationDataSlice.actions.changeLocation Action ( Saves locationData.current to the store )
    dispatch(locationDataSlice.actions.changeLocation({
        location,
        segments: getLocationSegments(location),
        path: normalizedPath,
    }));

    // Moves view to the current location
    mapService.changeLocation(location);

    // Get favoriteData
    const favoriteData = favoritesService.getDataById(location.id);

    // if there is a current layerVisibility favorite 
    // Dispatch the setLayersVisibility Action ( Changes the layersData.visibilityState )
    if (favoriteData?.layersVisibility) {
        dispatch(setLayersVisibility(favoriteData.layersVisibility));
    }


    let buildingId: string | undefined = getBuildingId(currentLocation);
    let newBuildingId: string | undefined = getBuildingId(location);

    // If there is a different building, fetch Room data and save it to store
    if (buildingId !== newBuildingId) {
        dispatch(fetchRoomsInfo(newBuildingId));
    }

    // Dispatch the fetchWarningsInfo Action ( Fetches warning info and saves it to store )
    dispatch(fetchWarningsInfo());
}

// Export different states from state.locationData
export const selectCurrentLocationData = (state: RootState) => state.locationData.current.location;
export const selectCurrentLocationId = (state: RootState) => state.locationData.current.location?.id;
export const selectCurrentLocationSegments = (state: RootState) => state.locationData.current.segments;
export const selectLocationsData = (state: RootState) => state.locationData.allLocations;
export const selectLocationsDataLoaded = (state: RootState) => state.locationData.isLoaded;

// Export the locationData reducer
export default locationDataSlice.reducer;

// Fetches the sitemap ( link in .env file )
const fetchLocationsData = async () => {
    try {
        // Tries to fetch the sitemap ( stemapUrl is defined in .env)
        const response: Response = await fetch(sitemapUrl);

        // If the response is ok, returns the json obj, if it is empty return an empty obj.
        if (response.ok) {
            const json = await response.json();
            return json ?? {};
        } else {
            throw new Error();
        }
    } catch {
        // If there is a problem, return to the console the following error
        console.error("Failed to get current user info");
        return {};
    }
}

// Destructures the setLocationsData from the locationDataSlice Actions
const { setLocationsData } = locationDataSlice.actions;

// Fetches locationData info and update the collected data into the store
export const fetchLocationsInfo = (path: string, history: History): AppThunk => async (dispatch, getState) => {
    // Fetch the Location Data and save it to the data variable; ( json obj)
    let data = await fetchLocationsData();

    // Dispatch the setLocationsData Action ( Saves locationData.allLocations to the store )
    dispatch(setLocationsData(data));

    // Dispatch the updateCurrentLocation Action ( Updates the locationData.current from the store )
    dispatch(updateCurrentLocation(path, history));

    // Get the current locationData.current
    const current = getState().locationData.current;

    // If there is a currentLocation
    if (current.location) {
        // Dispatch the fetchSidebar Action ( Fetches the sidebar info for the current location )
        dispatch(fetchSidebar(current.location));
    }
};