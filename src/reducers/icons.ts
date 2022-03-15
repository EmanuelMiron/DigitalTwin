// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iconsUrl } from '../config';
import { mapService } from '../services/mapService';

// Import Redux Store
import { AppThunk, RootState } from '../store/store';

// Initial Dialog States
const initialState: any = []



export const iconsSlice = createSlice({
    // Sets state name 
    name: 'icons',
    // Sets initial state
    initialState,
    reducers: {
       
        updateIcons: (state: any, action: PayloadAction<any>) => {

            return [
                ...action.payload
            ]
        }
    },
});

const { updateIcons } = iconsSlice.actions;

// Fetches icons and returns them
const getIcons = async () => {
    try {
        const response: Response = await fetch(`${iconsUrl}`);

        // If the response is ok, returns the json obj, if it is empty return an empty obj.
        if (response.ok) {
            const json= await response.json();
            return json ?? [];
        } else {
            throw new Error();
        }
    } catch {
        // If there is a problem, return to the console the following error
        console.error("Failed to fetch icons");
        return [];
    }
}

// Fetches assetData and saves it into the store
export const fetchIcons = (): AppThunk => async (dispatch) => {
    let data = await getIcons();

    dispatch(updateIcons(data))
    mapService.updateIcons(data)
}


export const selectIcons = (state: RootState) => state.icons;

// Default export popover Reducers
export default iconsSlice.reducer;