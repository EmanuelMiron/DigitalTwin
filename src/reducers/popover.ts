// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import Redux Store
import { RootState } from '../store/store';

// Import Models
import { PopoverType, PopoverData } from '../models/popoversData';

// Interfaces
export interface PopoversState {
  [PopoverType.Warning]: PopoverData;
  [PopoverType.Menu]: PopoverData;
}


// Initial Popover States
const initialState: PopoversState = {
  [PopoverType.Warning]: {
    type: PopoverType.Warning,
    isVisible: false,
    assetId : 0
  },
  [PopoverType.Menu]: {
    type: PopoverType.Menu,
    isVisible: false,
    assetId: 0
  }
};


// Create popover Reducers
export const popoversDataSlice = createSlice({
    // Sets state name 
    name: 'popovers',
    // Sets initial state
    initialState,
    reducers: {
        // Changes the popover state with the provided value in the action.payload
        showPopover: (state: PopoversState, action: PayloadAction<PopoverData>) => {
            const popoverType: PopoverType = action.payload.type;
            state[popoverType] = action.payload;
        },
        // Hides the popover and sets its target to undefined
        hidePopover: (state: PopoversState, action: PayloadAction<PopoverType>) => {
            const popoverType = action.payload;

            state[popoverType].isVisible = false;
            state[popoverType].target = undefined;
        }
    },
});

// Named exports for the popoverData Actions
export const {
    showPopover,
    hidePopover,
  } = popoversDataSlice.actions;
  
// Export the popover state values
export const selectWarningPopoverData = (state: RootState) => state.popovers[PopoverType.Warning];
export const selectMenuPopoverData = (state: RootState) => state.popovers[PopoverType.Menu];


// Default export popover Reducers
export default popoversDataSlice.reducer;