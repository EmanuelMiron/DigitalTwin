// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { assetTypeDataUrl, assetTypePropDataUrl } from '../config';

// Import Redux Store
import { AppThunk, RootState } from '../store/store';

// Initial Dialog States
const initialState: any = []



export const assetTypesDataSlice = createSlice({
    // Sets state name 
    name: 'assetTypesData',
    // Sets initial state
    initialState,
    reducers: {
       
        updateAssetTypes: (state: any, action: PayloadAction<any>) => {
            return [
                ...action.payload
            ]
        }
    },
});

const { updateAssetTypes } = assetTypesDataSlice.actions;

// Fetches assetData and returns it
const getAssetTypes = async () => {
    try {
        const response: Response = await fetch(`${assetTypeDataUrl}`);

        // If the response is ok, returns the json obj, if it is empty return an empty obj.
        if (response.ok) {
            const json= await response.json();
            return json ?? [];
        } else {
            throw new Error();
        }
    } catch {
        // If there is a problem, return to the console the following error
        console.error("Failed to create the asset");
        return [];
    }
}

const getAssetTypeProps = async (assetTypeId: number) => {
    const fetchData = async (id:number) => {
        try {
            const response: Response = await fetch(`${assetTypePropDataUrl}/${id}`);
            if (response.ok) {
                const json = await response.json();
                return json ?? {};
            } else {
                throw new Error();
            }
        } catch {
            console.error("Failed to fetch the asset type props");
            return {};
        }
    }
    let data = await fetchData(assetTypeId)
    return data
}

export const fetchAssetTypeProps = async (assetTypeId:number) => {
    let data = await getAssetTypeProps(assetTypeId)
    // let assetTypesData = useSelector(selectAssetTypesData)

    // assetTypesData.forEach((assetType: any, idx:number) => {
    //     assetType.key === Number(assetTypeId) && (assetTypesData[idx].props = data) 
    // })

    // dispatch(updateAssetTypes(assetTypesData))

    return data;
}


// Fetches assetData and saves it into the store
export const fetchAssetTypesInfo = (): AppThunk => async (dispatch) => {
    let data = await getAssetTypes();

    dispatch(updateAssetTypes(data))
}


export const selectAssetTypesData = (state: RootState) => state.assetTypesData;

// Default export popover Reducers
export default assetTypesDataSlice.reducer;