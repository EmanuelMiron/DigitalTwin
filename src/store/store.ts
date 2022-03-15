// ** Imports

    // Import Dependencies
        import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';

    // Import Reducers

        import indoor from '../reducers/indoor';
        import layersData from '../reducers/layersData';
        import locationData from '../reducers/locationData';
        import map from '../reducers/map';
        import popovers from '../reducers/popover';
        import rooms from '../reducers/rooms';
        // import sensors from '../reducers/sensors';
        import sidebar from '../reducers/sidebar';
        import user from '../reducers/user';
        import warnings from '../reducers/warnings';
        import assetsData from '../reducers/assetData';
        import dialogs from '../reducers/dialog'
        import assetTypesData from '../reducers/assetTypesData';
        import icons from '../reducers/icons';

// Create the store
export const store = configureStore({
    // Add reducers to the store
    reducer: {
        indoor,
        layersData,
        locationData,
        map,
        popovers,
        rooms,
        sidebar,
        user,
        warnings,
        assetsData,
        dialogs,
        assetTypesData,
        icons
    },
    // Add middlewares to the store
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    })
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
