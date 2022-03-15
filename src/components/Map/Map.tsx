
// Import Styls
import './Map.scss';

// Import Dependencies
import ReactResizeDetector from 'react-resize-detector';
import React, { useCallback, useEffect } from 'react';
import { EventManager, MapEvent, MapMouseEvent, data, Map as AzureMap } from 'azure-maps-control';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '@reduxjs/toolkit';

// Import Models
import { LocationData } from '../../models/locationsData';
import { PopoverType } from '../../models/popoversData';

// Import Reducers
import { setMapZoomLevel } from '../../reducers/map';
import { resetCurrentIndoorLocation, setCurrentIndoorLocation } from '../../reducers/indoor';
import { hidePopover } from '../../reducers/popover';
import { selectCurrentLocationData } from '../../reducers/locationData';
import { selectLayersVisibility, refreshVisibility } from '../../reducers/layersData';

// Import Components
import { WarningPopover } from './Popovers/WarningPopover';
import { MenuPopover } from './Popovers/MenuPopover';
import { DeleteConfirmationDialog } from './Dialogs/DeleteConfirmationDialog';

// Import Services
import { mapService } from '../../services/mapService';
import { CreateAssetDialog } from './Dialogs/CreateAssetDialog';
import { EditAssetDialog } from './Dialogs/EditAssetDialog';
import { selectBookDesk, selectEditAssetData } from '../../reducers/dialog';
import { BookDeskDialog } from './Dialogs/BookDeskDialog';
import { LoginDialog } from './Dialogs/LogIn';
import { EditAssetPositionDialog } from './Dialogs/EditAssetPositionDialog';

// Change the visibility for the provided layerId
const handleLayerVisibilityChange = (layerId: string, isVisible: boolean) => {
    mapService.setLayerVisibility(layerId, isVisible);
}

// Initialise mapResizeTimeout
let mapResizeTimeout: number | undefined;

// Map Component
const Map: React.FC = () => {
    const currentLocation: LocationData | undefined = useSelector(selectCurrentLocationData);
    const layersVisibility = useSelector(selectLayersVisibility);
    const dispatch: Dispatch<any> = useDispatch();

    const editDialog = useSelector(selectEditAssetData);
    const bookDeskDialog = useSelector(selectBookDesk);
    
    // On map Ready handle the visibilityChanges and change the zoom level
    const onMapReady = useCallback((map: AzureMap) => {
        mapService.getLayersInfo().forEach(({ id }) => {

            if (layersVisibility[id] !== undefined) {
                handleLayerVisibilityChange(id, layersVisibility[id]);
            }
        });

        dispatch(setMapZoomLevel(map.getCamera().zoom));
    }, [dispatch, layersVisibility]);

    // When zoom ends change the zoom level in the state
    const onZoomEnd = useCallback((e: MapEvent) => {
        dispatch(setMapZoomLevel(e.map.getCamera().zoom));
    }, [dispatch]);


    const onMapClick = useCallback((e: MapMouseEvent) => {
        // Get the clicked features
        const features = mapService.getFeatures(e.position);

        // If there are no features reset the indoor Location
        if (!features || !features.length) {
            dispatch(resetCurrentIndoorLocation());
            return;
        }

        // Get the first feature
        const feature = (features[0] as data.Feature<data.Geometry, any>);
        if (!feature) {
            return;
        }

        // Get feature props
        const id = feature.properties.featureId;
        const name: string = feature.properties.name;
        const levelFeatureId: string = feature.properties.levelFeatureId;
        const type: string = feature.properties.featureType;
        const floor = currentLocation?.name;

        // If the props are ok, set the current Indoor location
        if (name != null && levelFeatureId != null) {
            dispatch(setCurrentIndoorLocation({ id, name, type, floor }));
        } else {
            dispatch(resetCurrentIndoorLocation());
        }
    }, [currentLocation, dispatch]);

    // Hides the Warning popovers
    const hideWarningPopover = useCallback(
        () => dispatch(hidePopover(PopoverType.Warning)),
        [dispatch]
    );

    // hide Warning Popovers on location change
    const handleLocationChange = useCallback(() => {
        hideWarningPopover();
    }, [
        hideWarningPopover,
    ]);

    // on first run, initialize the map
    useEffect(() => {
        dispatch(refreshVisibility);
        mapService.initialize(onMapReady, dispatch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Dispose the map
    useEffect(() => {
        return () => {
            mapService.dispose();
            mapResizeTimeout && clearTimeout(mapResizeTimeout);
        }
    }, []);

    // Handle the location change
    useEffect(() => {
        handleLocationChange();
    }, [currentLocation, handleLocationChange]);

    // Add events on the map
    useEffect(() => {
        const mapEventManager: EventManager | undefined = mapService.getEventManager();

        if (!mapEventManager) {
            return;
        }

        mapEventManager.add('zoomend', onZoomEnd);
        mapEventManager.add('click', onMapClick);

        return () => {
            mapEventManager.remove('zoomend', onZoomEnd as any);
            mapEventManager.remove('click', onMapClick as any);
        }
    }, [onZoomEnd, onMapClick]);

    // Handle the map resize
    const handleMapResize = () => {
        if (mapResizeTimeout) {
            clearTimeout(mapResizeTimeout);
        }

        mapResizeTimeout = setTimeout(() => mapService.resizeMap());
    };

    // Render the Map with all the components on it
    const render = () => {
        const extraElements = mapService.getLayersInfo()
            .map(layer => layer.getMapComponent && layer.getMapComponent())
            .map((componentAndProps) => {
                if (!componentAndProps) {
                    return null;
                }

                const { component, props } = componentAndProps;
                return React.createElement(component, props);
            });

        return (
            <div id="mapparent">
                <ReactResizeDetector
                    handleHeight
                    handleWidth
                    onResize={handleMapResize}
                />
                <div id={mapService.mapId}></div>

                <WarningPopover />
                <MenuPopover />
                <DeleteConfirmationDialog />
                <CreateAssetDialog />
                <LoginDialog />
                <EditAssetPositionDialog />
                {editDialog.isVisible && <EditAssetDialog /> }
                {bookDeskDialog.isVisible && <BookDeskDialog />}
                {extraElements}
            </div>
        );
    };

    return render();
}


// Export the Map Component
export default Map;
