// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import Redux Store
import { AppThunk, RootState } from '../store/store';

// Import Models
import { RoomDataSchema, RoomsByFloorId } from '../models/roomsData';
import { LoadingState } from '../models/loadingState';

// Import Services
import { mapService } from '../services/mapService';

// Import Config
import { roomsDataUrl } from '../config';


// Interfaces
export interface RoomsState {
  roomsByFloorId: RoomsByFloorId;
  loadingState: LoadingState;
}

const initialState: RoomsState = {
  roomsByFloorId: {},
  loadingState: LoadingState.Loading,
};

// Checks if the provided data is Room data ( returns true or false )
const isRoomsData = (data: any): data is RoomsByFloorId => {
    try {
      for (const floorId in data) {
        for (const roomId in data[floorId]) {
          const isValid = RoomDataSchema.isValidSync(data[floorId][roomId]);
  
          if (!isValid) {
            return false;
          }
        }
      }
  
      return true;
    } catch {
      console.error('Rooms data is not valid');
      return false;
    }
}

// Create room Reducers
export const roomsSlice = createSlice({
    // Sets state name
    name: 'rooms',
    // Sets the initial state
    initialState,
    reducers: {
        // Sets the rooms state to the provided data
        setRooms: (state: RoomsState, action: PayloadAction<RoomsByFloorId>) => {
            return {
                ...state,
                roomsByFloorId: action.payload,
                loadingState: LoadingState.Ready,
            }
        },
        
        // Sets rooms loading State
        setLoadingState: (state: RoomsState, action: PayloadAction<LoadingState>) => {
            const loadingState: LoadingState = action.payload;

            if (loadingState === LoadingState.Loading) {
                return {
                ...state,
                roomsByFloorId: {},
                loadingState,
                };
            }

            return {
                ...state,
                loadingState,
            };
        }
    }
});

// Named export rooms Actions
const {
    setRooms,
    setLoadingState,
  } = roomsSlice.actions;


// Export rooms state data 
export const selectRoomsLoadingState = (state: RootState) => state.rooms.loadingState;

export const selectRoomsData = (state: RootState) => state.rooms.roomsByFloorId;

export const selectRoomsCount = (state: RootState) => {
    const roomsByFloorId = state.rooms.roomsByFloorId;

    return Object.values(roomsByFloorId).reduce(
        (roomsCount, floorData) => floorData ? roomsCount + Object.keys(floorData).length : roomsCount,
        0
    );
}

// Fetches room data and returns it
const fetchRoomsData = async (locationId: string) => {
    const url = roomsDataUrl.replace("{locationPath}", locationId);
    const response: Response = await fetch(url);
  
    if (response.ok) {
      const json = await response.json();
      return json ?? {};
    } else {
      throw new Error();
    }
}

// Fetches room data and save it to the store
export const fetchRoomsInfo = (locationId?: string): AppThunk => async (dispatch, getState) => {
    // Sets rooms state to loading state
    dispatch(setLoadingState(LoadingState.Loading));
    
    // Update room data on the map
    mapService.updateRoomsData({});

    // If there is no locationId return 
    if (!locationId) {
        return;
    }

    try {
        const roomsByFloorId: any = await fetchRoomsData(locationId);
        if (isRoomsData(roomsByFloorId)) {
            dispatch(setRooms(roomsByFloorId));
            mapService.updateRoomsData(roomsByFloorId);
        } else {
            throw new Error('Rooms data is not valid');
        }
    } catch (e) {
        console.error(e.message ?? 'Failed to get rooms info');
        dispatch(setLoadingState(LoadingState.Error));
    };
};

// Export rooms Reducers
export default roomsSlice.reducer;