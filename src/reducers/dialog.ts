// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import Redux Store
import { RootState } from '../store/store';

// Import Models
import { DialogType, DialogData } from '../models/dialogData';

// Interfaces
export interface DialogState {
  [DialogType.DeleteConfirmation]: DialogData;
  [DialogType.CreateAsset]: DialogData;
  [DialogType.EditAsset]: DialogData;
  [DialogType.BookDesk]: DialogData;
  [DialogType.LogIn]: DialogData;
  [DialogType.EditAssetPosition]: DialogData;
}

// Initial Dialog States
const initialState: DialogState = {
  [DialogType.DeleteConfirmation]: {
    type: DialogType.DeleteConfirmation,
    isVisible: false
  },
  [DialogType.CreateAsset]: {
    type: DialogType.CreateAsset,
    isVisible: false
  },
  [DialogType.EditAsset]: {
    type: DialogType.EditAsset,
    isVisible: false
  },
  [DialogType.BookDesk]: {
    type: DialogType.BookDesk,
    isVisible: false
  },
  [DialogType.LogIn]: {
    type: DialogType.LogIn,
    isVisible: false
  },
  [DialogType.EditAssetPosition]: {
    type: DialogType.EditAssetPosition,
    isVisible: false
  }
};


// Create dialog Reducers
export const dialogsDataSlice = createSlice({
    // Sets state name 
    name: 'dialogs',
    // Sets initial state
    initialState,
    reducers: {
        // Changes the dialog state with the provided value in the action.payload
        showDialog: (state: DialogState, action: PayloadAction<DialogData>) => {
            const dialogType: DialogType = action.payload.type;
            state[dialogType] = action.payload;
        },

        // Hides the dialog and sets its target to undefined
        hideDialog: (state: DialogState, action: PayloadAction<DialogType>) => {
            const dialogType = action.payload;
            state[dialogType].isVisible = false;
        }
    },
});

// Named exports for the dialogData Actions
export const {
    showDialog,
    hideDialog,
  } = dialogsDataSlice.actions;
  
// Export the dialog state values
export const selectDeleteConfirmationData = (state: RootState) => state.dialogs[DialogType.DeleteConfirmation];
export const selectCreateAssetData = (state: RootState) => state.dialogs[DialogType.CreateAsset];
export const selectEditAssetData = (state: RootState) => state.dialogs[DialogType.EditAsset];
export const selectBookDesk = (state: RootState) => state.dialogs[DialogType.BookDesk];
export const selectLogIn = (state: RootState) => state.dialogs[DialogType.LogIn];
export const selectEditAssetPosition = (state: RootState) => state.dialogs[DialogType.EditAssetPosition];


// Default export popover Reducers
export default dialogsDataSlice.reducer;