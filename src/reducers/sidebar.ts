// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import Redux Store
import { AppThunk, RootState } from '../store/store';

// Import Models
import { SidebarData } from '../models/sidebar';
import { DEFAULT_LOCATION, LocationData } from '../models/locationsData';
import { LoadingState } from '../models/loadingState';

// Import Config
import { sidebarDataUrl } from '../config';

// Interfaces

export interface SidebarState {
    data: SidebarData;
    context: LocationData;
    loadingState: LoadingState;
};

interface SetSidebarDataPayload {
    data: any;
    loadingState: LoadingState;
}

// Initial sidebarState
const initialState: SidebarState = {
    data: [],
    context: DEFAULT_LOCATION,
    loadingState: LoadingState.Loading,
};

// Check to see if sidebar data provided is valid
const parseSidebarData = (rawData: any): SidebarData => {
    let result: SidebarData = [];

    if (rawData) {
        try {
            result = rawData.map((obj: any) => ({
                id: obj.id,
                name: obj.name,
                items: obj.items.map((item: any) => {
                    if (!item) {
                        throw new Error();
                    }

                    return item;
                }),
            }));
        } catch (error) {
            console.error("Failed to parse sidebar data")
        }
    }

    return result;
}

// Creater sidebar Reducers
export const sidebarSlice = createSlice({
    // Set state name
    name: 'sidebar',
    // Set initial state
    initialState,
    reducers: {
        // Set sidebar.data state to the provided data
        setSidebarData: (state: SidebarState, action: PayloadAction<SetSidebarDataPayload>) => {
            const { data, loadingState } = action.payload;

            return {
                ...state,
                loadingState,
                data: parseSidebarData(data),
            };
        },
        // Set the sidebar.context ( current location )
        setSidebarContext: (state: SidebarState, action: PayloadAction<LocationData>) => ({
            ...state,
            context: action.payload,
        }),
    },
});

// Named export sidebar actions
const {
    setSidebarData,
    setSidebarContext,
} = sidebarSlice.actions;



// Export sidebar state values
export const selectSidebarLoadingState = (state: RootState) => state.sidebar.loadingState;
export const selectSidebarContext = (state: RootState) => state.sidebar.context;
export const selectCurrentSidebarData = (state: RootState): SidebarData => state.sidebar.data;

// Fetch sidebar Data and return it
let fetchSidebarData = async (locationPath: string): Promise<SidebarData> => {
    const url = sidebarDataUrl.replace("{locationPath}", locationPath);
    const response: Response = await fetch(url);
  
    if (response.ok) {
      const json = await response.json();
      return json ?? [];
    } else {
      throw new Error();
    }
}

// Fetches sidebar data and saves it to store
export const fetchSidebar = (location: LocationData): AppThunk => async (dispatch, getState) => {
    const { sidebar: { context } } = getState();

    if (location.id === context.id) {
        return;
    }

    // sets sidebar loading state to Loading
    dispatch(setSidebarData({ data: [], loadingState: LoadingState.Loading }));
    // Sets sidebar context to location
    dispatch(setSidebarContext(location));

    try {
        const data = await fetchSidebarData(location.id);
        // Sets the fetched data as room state data
        dispatch(setSidebarData({ data, loadingState: LoadingState.Ready }));
    } catch {
        console.error("Failed to get current sidebar info");
        // Sets sidebar state to Error
        dispatch(setSidebarData({ data: [], loadingState: LoadingState.Error }));
    };
};

// Exort sidebar reducers
export default sidebarSlice.reducer;