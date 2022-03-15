// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import Redux Store
import { RootState } from '../store/store';

// Interfaces
export interface MapState {
  zoomLevel?: number;
};

// Initial map state
const initialState: MapState = {};

// Create map Reducers
export const mapSlice = createSlice({
    // Set states name
    name: 'map',
    // Set initial state
    initialState,
    reducers: {
        // sets the zoomLevel provided in the action.payload
        setMapZoomLevel: (state: MapState, action: PayloadAction<number | undefined>) => ({ zoomLevel: action.payload }),
    },
});

// Export map Zoom level value
export const selectMapZoomLevel = (state: RootState) => state.map.zoomLevel;

// Named export map Actions
export const {
    setMapZoomLevel,
} = mapSlice.actions;

// Default export map Reducers
export default mapSlice.reducer;