// Import Config
import { subscriptionKey } from '../config';

// Import Redux Store
import { AppThunk } from '../store/store';

// Import Actions from from indoor Reducers
import { setCurrentLocationState } from './indoor';
import { getLocationStatesets } from './indoor';


export const updateIndoorStateSimulation = (roomId: string, stateName: string, value: number): AppThunk => async (dispatch, getState) => {
    // Get the current location Id
    const currentLocationId = getState().locationData.current.location?.id;
    // If there is no location Id return the function
    if (!currentLocationId) {
        return;
    }

    // Get the current location
    const currentLocation = getState().locationData.current.location;
    // If there is no location, return the function
    if (!currentLocation) {
        return;
    }

    // Get location statesets
    const statesets = getLocationStatesets(currentLocation);
    let states:any = {};
    statesets.forEach(state => {
        states[state.stateSetName] = state.stateSetId;
    })

    const url = `https://eu.atlas.microsoft.com/featureStateSets/${states[stateName]}/featureStates/${roomId}?subscription-key=${subscriptionKey}&api-version=2.0`;

    // Save the current state value
    const prevValue = getState().indoor.currentStates[stateName]?.value;

    // Function to be run when the changes fail to take effect
    const fail = (error: string) => {
        console.warn(`Failed to set indoor state ${stateName} for ${roomId}: ${error}`);
        dispatch(setCurrentLocationState([stateName, { value: prevValue, loaded: true }]));
    }


    dispatch(setCurrentLocationState([stateName, { value: prevValue, loaded: false }]));

    // Change the stateset with the new value and a timestamp
    try {

        // Create dateTime String
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + ("0" + today.getSeconds()).slice(-2);
        var dateTime = date+'T'+time;

        const res = await fetch(url, { method: "PUT", body: JSON.stringify({

        "states": [
            {
                "keyName": stateName,
                "value": value,
                "eventTimestamp": dateTime
            }
        ]
        })});
        if (res.status === 200) {
            dispatch(setCurrentLocationState([stateName, { value, loaded: true }]));
        } else {
            fail(`HTTP${res.status} ${res.statusText}`);
        }
    } catch (error) {
        fail(error);
    }
};