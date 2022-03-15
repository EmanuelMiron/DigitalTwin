// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import Types
import { AppThunk, RootState } from '../store/store';

// Import Config
import { subscriptionKey } from '../config';

// Import Models
import { LocationData, LocationType } from "../models/locationsData";

// Interfaces

interface LocationState {
    value?: number;
    loaded: boolean;
}

export interface LocationStates {
    [name: string]: LocationState | undefined;
}

export interface IndoorLocation {
    id: string;
    name: string;
    type: string;
    floor?: string;
}

export interface IndoorState {
    currentLocation?: IndoorLocation;
    currentStates: LocationStates;
};

// Initial indoor State
const initialState: IndoorState = { currentStates: {}, };

// Create the indoor Reducers
export const indoorSlice = createSlice({
    // Set the state name
    name: 'indoor',
    // Set the initial State
    initialState,
    // Reducers
    reducers: {
        // Sets the indoor.currentLocation state
        setCurrentIndoorLocation: (state: IndoorState, action: PayloadAction<IndoorLocation>) => ({
            ...state,
            currentLocation: action.payload,
        }),
        // Sets the indoor.currentStates state
        setCurrentLocationStates: (state: IndoorState, action: PayloadAction<LocationStates>) => {
            return {
                ...state,
                currentStates: action.payload,
            }
        },
        // Sets a specific current State from indoor.currentStates
        setCurrentLocationState: (state: IndoorState, action: PayloadAction<[string, LocationState | undefined]>) => {
            const [stateName, stateValue] = action.payload;
            return {
                ...state,
                currentStates: {
                    ...state.currentStates,
                    [stateName]: stateValue,
                },
            }
        },
        // Resets the indoor state
        resetCurrentIndoorLocation: (state: IndoorState, action: PayloadAction) => ({
            ...state,
            currentLocation: undefined,
            currentStates: {},
        }),
    },
});

// Returns the statesets from the location provided
export const getLocationStatesets = (location: LocationData) => {
    // Saves statesets from location.config
    let statesets = location.config?.stateSets;

    // If the current location is of type Floor, get the statesets from the parent
    if (statesets === undefined && location.type === LocationType.Floor) {
      statesets = location.parent?.config?.stateSets;
    }

    // return the statesets
    return statesets ?? [];
};

// Fetches the feature statesets and returns them
const fetchFeatureState = async (
    statesetId: string,
    statesetName: string,
    featureId: string
  ): Promise<number | undefined> => {
    const url = `https://eu.atlas.microsoft.com/featureStateSets/${statesetId}/featureStates/${featureId}?subscription-key=${subscriptionKey}&api-version=2.0`;

    try {
      const res = await fetch(url);
      if (res.status !== 200) {
        throw new Error(`HTTP ${res.status}`);
      }
  
      const body = await res.json();
      return body.states.find((state: any) => state.keyName === statesetName)?.value;
    } catch (error) {
      console.warn(`Failed to fetch feature state for feature ${featureId}, stateset ${statesetId}: ${error}`);
    }
};



export const setCurrentIndoorLocation = (location: IndoorLocation): AppThunk =>
  async (dispatch, getState) => {
    // Dispatches setCurrentIndoorLocation Action ( Sets indoor.currentLocation to the store)
    dispatch(indoorSlice.actions.setCurrentIndoorLocation(location));

    // Get currentLocation from store
    const currentLocation = getState().locationData.current.location;

    // If there is a currentLocation, get the currentLocation statesets
    const statesets = currentLocation ? getLocationStatesets(currentLocation) : [];
    
    // If there are no statests, return the function
    if (statesets.length === 0) {
      return;
    }

    // Saves the statesets in the states variable
    const states: LocationStates = zip(statesets.map(({ stateSetName }) => [stateSetName, { loaded: false }]));
    // Use a copy of states since redux seals the dispatched action's payload
    // to prevent store modification bu we want to reuse the states later

    // Dispatches setCurrentLocationStates Action ( Sets the currentLocation states )
    dispatch(indoorSlice.actions.setCurrentLocationStates({ ...states }));

  
    const promises: Promise<void>[] = statesets.map(
      ({ stateSetId, stateSetName }) =>
        fetchFeatureState(stateSetId, stateSetName, location.id)
          .then(value => {
            states[stateSetName] = { value, loaded: true };
          })
    );

    await Promise.all(promises);

    // Dispatches setCurrentLocationStates with the fetched states ( Sets the currentLocation states )
    dispatch(indoorSlice.actions.setCurrentLocationStates(states));
};

// Export indoor Actions
export const {
    resetCurrentIndoorLocation,
    setCurrentLocationState,
} = indoorSlice.actions;

// Export indoor state values
export const selectCurrentIndoorLocation = (state: RootState) => state.indoor.currentLocation;
export const selectCurrentIndoorStates = (state: RootState) => state.indoor.currentStates;

// Export indoor Reducers
export default indoorSlice.reducer;


/**
 * Zip turns an array of 2-item tuples into a dictionary
 * @param list of items to be zipped into dictionary
 */
 const zip = <T>(items: [string, T][]): { [k: string]: T } =>
 items.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});