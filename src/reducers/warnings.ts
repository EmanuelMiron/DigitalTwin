// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import Redux Store
import { AppThunk, RootState } from '../store/store';

// Import Models
import { WarningData, WarningsByLayers, WarningsByLocation, WarningsByRooms } from '../models/warningsData';
import { LocationType } from '../models/locationsData';
import { LoadingState } from '../models/loadingState';

// Import Services
import { mapService } from '../services/mapService';

// Import Config
import { warningsDataUrl } from '../config';

// Interfaces
export interface WarningsState {
    data: WarningsByLocation;
    loadingState: LoadingState;
};

interface SetWarningsPayload {
    data: WarningsByLocation;
    loadingState: LoadingState;
}

// Initial State
const initialState: WarningsState = {
    data: {},
    loadingState: LoadingState.Loading,
};

// Check if the provided data is a valid WarningsByLocation Data
export const isWarningsDataValid = (data: any): data is WarningsByLocation => {
    try {
        for (const locationId in data) {
            const warningsByRooms: WarningsByRooms = data[locationId];

            for (const roomId in warningsByRooms) {
                const warningsByLayers: WarningsByLayers | undefined = warningsByRooms[roomId];

                for (const layerId in warningsByLayers) {
                    const warnings: WarningData[] | undefined = warningsByLayers[layerId];
                    const isValid: boolean = !!warnings && warnings.every((warning: WarningData) => (
                        (!warning.title || typeof warning.title === 'string')
                        && (!warning.description || typeof warning.description === 'string')
                        && (!warning.url || typeof warning.url === 'string')
                        && (!warning.position || (
                            typeof warning.position.latitude === 'number' && typeof warning.position.longitude === 'number')
                        )
                    ));

                    if (!isValid) {
                        return false;
                    }
                }
            }
        }
        return true;
    } catch {
        return false;
    }
};

export const warningsSlice = createSlice({
    // Sets state name
    name: 'warnings',
    // Sets initial state
    initialState,
    // Warning Reducers
    reducers: {
        // Updates or sets the warnings Data with the provided data and loading state If there is already data, the Data won't be overwrited but rather merged with the current state.
        setWarnings: (state: WarningsState, action: PayloadAction<SetWarningsPayload>) => {
            const { data, loadingState } = action.payload;

            return {
                ...state,
                data,
                loadingState,
            };
        },
    },
});

// Destructure setWarnings from the warningsSlice.actions;
const {
    setWarnings,
} = warningsSlice.actions;

// Export warnings state values
export const selectWarningsLoadingState = (state: RootState) => state.warnings.loadingState;
export const selectWarningsData = (state: RootState) => state.warnings.data;

// Function which fetches the Warnings data from the API EndPoint
const fetchWarningsData = async (locationId: string) => {
    // Create the url using the config file
    const url = warningsDataUrl.replace("{locationPath}", locationId);

    // Fetch the created url
    const response: Response = await fetch(url);

    if (response.ok) {
        // If the response is ok, save the response.json()
        const json = await response.json();
        // return the response or an empty obj
        return json ?? {};
    } else {
        // If there is a problem with the request , throw an Error.
        throw new Error();
    }
}

// Fetch Warnings Info and dispatch them to the store
// Is Run in locationData.ts
export const fetchWarningsInfo = (): AppThunk => async (dispatch, getState) => {

    // Get locationId and make checks about it
    // Destructure currentLocation from Redux
    const { locationData: { current: { location: currentLocation } } } = getState();

    // Runs updateWarningsData with an empty obj. ( Resets the Warnings Data )
    mapService.updateWarningsData({});
    // Initialise the locationId with an empty string
    let locationId: string = '';

    // If we are at a building level
    if (currentLocation.type === LocationType.Building) {
        // Save the currentLocation Id
        locationId = currentLocation.id;
        // If we are at a Floor level
    } else if (currentLocation.type === LocationType.Floor && currentLocation.parent?.id) {
        // Save the parentLocation obj
        const parentLocation = currentLocation.parent;

        // Check if we get a parentLocation
        if (parentLocation) {
            // Save the parentLocation Id
            locationId = parentLocation.id;
        }
    }

    // Dispatch to store the current state of warningsData

    // If we don't have a locationId ( either the locationId of parent Location Id)
    if (!locationId) {
        // Dispatch SetWarnings action with no data and state Ready
        dispatch(setWarnings({ data: {}, loadingState: LoadingState.Ready }));
        return;
    }

    // If we have a location Id, Dispatch the setWarnings action with no data and state Loading
    dispatch(setWarnings({ data: {}, loadingState: LoadingState.Loading }));

    // Get warningsData, validate it, dispach it to store and update warnings on the map
    try {
        // Save the response from fetchWarningsData 
        const warningsByLocation: any = await fetchWarningsData(locationId);

        // Check if the warningsByLocation is a valid WarningsByLocation structure
        if (isWarningsDataValid(warningsByLocation)) {

            // If the warningsByLocation is valid, Dispatch setWarnings with the data received and state Ready
            dispatch(setWarnings({ data: warningsByLocation, loadingState: LoadingState.Ready }));

            // Update the warnings data to the map
            mapService.updateWarningsData(warningsByLocation);

        } else {
            // If the data received is not a valid, throw an Error
            throw new Error('Warnings data is not valid');
        }
    } catch (e) {
        // @ts-ignore: Catch clause can't have a type annotation
        console.error(e.message ?? 'Failed to get warnings info');
        // If we can't get the information from the fetch.
        // Dispatch setWarnings with an empty data obj and state Error
        dispatch(setWarnings({ data: {}, loadingState: LoadingState.Error }));
    };
};

// export the warning reducers
export default warningsSlice.reducer;