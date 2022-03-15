// Import Dependencies
import { createSlice, PayloadAction, Action } from '@reduxjs/toolkit';

// Import Redux Store
import { RootState } from '../store/store';

// Import Services
import { mapService } from "../services/mapService";

// Interfaces
export interface LayersVisibilityState {
    [id: string]: boolean;
}
  
export interface LayersState {
    visibilityState: LayersVisibilityState;
}

interface LayerVisibilityPayload {
    id: string;
    isVisible: boolean;
}  

// Syncs visibility as map service can change visibility of other layers if they are mutually exclusive
// Returns the layers state
const refreshVisibilityState = (): LayersVisibilityState => {
    const state: LayersVisibilityState = {};
    mapService.getLayersInfo().forEach(({ id }) => {
        state[id] = mapService.isLayerVisible(id)
    });
  
    return state;
}


// Initial layersData state
const initialState: LayersState = {
    visibilityState: {},
}


// Create layersData Reducers
export const layersDataSlice = createSlice({
    // Sets state name
    name: 'layersData',
    // Sets initial State
    initialState,
    // Sets Reducers
    reducers: {
        // Sets the layersState to what is showed on the map ( Sync them )
        refreshVisibility: (state: LayersState, action: Action) => ({
            visibilityState: refreshVisibilityState(),
        }),

        // Changes the current layerVisibility state for the specified id
        setLayerVisibility: (state: LayersState, action: PayloadAction<LayerVisibilityPayload>) => {

            const { id, isVisible } = action.payload;
            try {
                // Change the visibility on the map
                mapService.setLayerVisibility(id, isVisible);

                return {
                    visibilityState: refreshVisibilityState()
                };
            } catch (err) {
                // Do nothing - assume visibility not changed
                console.error(err);
            }
        },

        // Changes the layer visibility on the map for all the layers
        setLayersVisibility: (state: LayersState, action: PayloadAction<LayersVisibilityState>) => {
            const layersVisibility: LayersVisibilityState = action.payload;
            Object.keys(layersVisibility).forEach(
                id => mapService.setLayerVisibility(id, layersVisibility[id])
            );

            return {
                visibilityState: layersVisibility,
            }
        },
    },
});

// Export layersData state values
export const selectLayersVisibility = (state: RootState) => state.layersData.visibilityState;
export const selectLayerVisibility = (layerId: string) => (state: RootState) => !!state.layersData.visibilityState[layerId];


// Named export the reducers
export const {
    refreshVisibility,
    setLayerVisibility,
    setLayersVisibility,
} = layersDataSlice.actions;

// Default export the layersData Reducers
export default layersDataSlice.reducer;