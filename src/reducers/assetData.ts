// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store/store';

// Import Services
import { mapService } from '../services/mapService';

// Import Redux Store
import { RootState } from '../store/store';

// Import Config
import { assetDataUrl } from '../config';
import { AssetType } from '../models/assetData';


// Interfaces

interface coordsPosition {
    longitude: number;
    latitude: number;
}

export interface assetProps {
    type: AssetType;
    assetId: number;
    position?: coordsPosition;
    hostname?: number;
    title?: string;
    description?: string;
    icon?: string;
    draggable?: boolean;
}



// Initial Popover States
const initialState: any = {

};

// create assetData Slice
const assetDataSlice = createSlice({
    // Sets state name
    name: 'assetData',
    // Sets the initial State
    initialState,
    // Create the reducers
    reducers: {
        setAssetsData: (state: any, action: PayloadAction<assetProps[]>) => {

            const assets = action.payload
            let updateState: any = {}
            if(Array.isArray(assets)){

                assets.forEach(asset => {
                    // Create the assetTypes on the state obj
                    if (updateState[asset.type] === undefined) {
                        updateState[asset.type] = [];
                    }
    
                    // Add the assets in the state
                    updateState[asset.type].push(asset)
                })
            }
            return {
                ...state,
                ...updateState
            }
        },

        deleteAsset: (state: any, action: PayloadAction<any>) => {

            let type = action.payload.type;
            let newState = action.payload.newState;

            return {
                ...state,
                [type]: [...newState]
            }
        },

        addAsset: (state: any, action: PayloadAction<any>) => {

            let type = action.payload.type;
            let newState = action.payload.newAsset;

            const destState = () => {
                if (state[type]) {
                    return [...state[type]]
                }
                return []
            }

            return {
                ...state,
                [type]: [
                    ...destState(),
                    newState
                ]
            }
        },

        updateAssets: (state: any, action: PayloadAction<any>) => {

            let type = action.payload.type;
            let updatedAsset = action.payload.updatedAsset;
            console.log(updatedAsset)
            return {
                ...state,
                [type]: [...updatedAsset]
            }

        },
        updateAsset: (state: any, action: PayloadAction<any>) => {
            let asset = action.payload;
            console.log(asset, {...state})
            return {
                ...state,
                [asset.type]: state[asset.type].map(
                    (desk:any) => desk.assetId === asset.assetId ? { ...desk, ...asset.props } : {...desk}
                )
            }

        }
    }
})

// Fetches assetData and returns it
const fetchAssetsData = async (area: string) => {
    try {
        const response: Response = await fetch(`${assetDataUrl}/location/${area}`);

        // If the response is ok, returns the json obj, if it is empty return an empty obj.
        if (response.ok) {
            const json = await response.json();
            return json ?? {};
        } else {
            throw new Error();
        }
    } catch {
        // If there is a problem, return to the console the following error
        console.error("Failed to get current assets info");
        return {};
    }
}

export const { setAssetsData, deleteAsset, addAsset, updateAssets, updateAsset } = assetDataSlice.actions;

// Fetches assetData and saves it into the store
export const fetchAssetsInfo = (area: string): AppThunk => async (dispatch) => {

    let data = await fetchAssetsData(area);
    dispatch(setAssetsData(data))

    // Update the assetData on the map
    mapService.updateAssetsData(data);
}

export const selectAssetData = (state: RootState) => state.assetsData;
export const selectAssetDataForEdit = (state: RootState) => {
    let assets = JSON.parse(JSON.stringify(state.assetsData));
    let newAssets: any = {}

    for (let asset in assets) {
        newAssets[asset] = []
        assets[asset].forEach((a: any) => {
            let newA: any = {}
            for (let i in a) {
                if (['position', 'iconID', 'type'].indexOf(i) === -1) {
                    newA[i] = a[i]
                }
            }
            if (Object.keys(newA).length > 0) {
                newAssets[asset].push(newA)
            }
        })

    }
    return newAssets;

}

// Export assetData Reducers
export default assetDataSlice.reducer