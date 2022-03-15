// Import Dependencies
import * as turf from '@turf/helpers';
import getCenter from '@turf/center';
import {
    AnimationOptions,
    CameraBoundsOptions,
    CameraOptions,
    control,
    ControlPosition,
    ControlStyle,
    data as atlasData,
    EventManager,
    Map,
    MapEvent,
    math as atlasMath,
} from 'azure-maps-control';
import { indoor } from 'azure-maps-indoor';
import { Dispatch } from '@reduxjs/toolkit';

// Import Config
import { subscriptionKey } from '../config';

// Import Models
import { LocationData } from '../models/locationsData';
import { WarningData, WarningsByLocation } from '../models/warningsData';
import { MapObject, MapPosition } from '../models/mapData';
import { RoomsByFloorId } from '../models/roomsData';

// Import Helpers
import {
    getLocationFacilityId,
    getLocationTilesetId,
    getMaxDistanceByLocationType,
    getZoomByLocationType,
    INVALID_FLOOR_NUMBER,
} from '../helpers/locations';
import { getLayerWarnings } from '../helpers/warnings';

// Import Layers
import { IndoorLayer } from './layers/IndoorLayer';
import { AssetLayer } from './layers/AssetLayer';
import { Layer } from './layers/Layer';
import { WarningsLayer } from './layers/WarningsLayer';
import { MarkersLayer } from './layers/MarkersLayer';

// Import Services
import { FavoriteItem, favoritesService } from './favoritesService';

// Import Reducers
import { assetProps } from '../reducers/assetData';

// Types
type LayersById = { [id: string]: Layer };

// Interfaces
interface MapServiceOptions {
    layers: Layer[];
}

// Constants
export const LayerId = {
    FieldWorkers: 'field_workers',
    Floors: 'floors',
    Occupancy: 'occupancy',
    Security: 'security',
    Shuttles: 'shuttles',
    Temperature: 'temperature',
    Warnings: 'warnings',
    Weather: 'weather',
    Asset: 'asset'
}

const DEFAULT_MAP_STYLE = 'road';


class MapService {

    // Initialise public variables
    public readonly mapId: string = 'map-id';
    public readonly flyDuration: number = 1000;

    // Initialise private variables
    private map?: Map;
    private indoorManager?: indoor.IndoorManager;
    private isReady: boolean = false;
    private currentLocation?: LocationData;
    private layers: LayersById;

    // Class constructor
    constructor(options: MapServiceOptions) {
        this.layers = options.layers.reduce<LayersById>((acc, layer) => {
            acc[layer.id] = layer;
            return acc;
        }, {});
    }

    // Initialise MapService
    public initialize(onReady: (map: Map) => void, dispatch: Dispatch<any>) {
        this.map = new Map(this.mapId, { subscriptionKey });
        this.indoorManager = new indoor.IndoorManager(this.map, {});


        // Add ready event on map
        this.map.events.add("ready", (e: MapEvent) => {
            // Initialize all layers
            Object.values(this.layers).forEach(layer => layer.initialize(this.map!, this.indoorManager!, dispatch));

            //Create a zoom control.
            this.map!.controls.add(
                new control.ZoomControl({
                    zoomDelta: 0.5,
                    style: ControlStyle.light
                }),
                {
                    position: ControlPosition.BottomRight,
                }
            );

            //Create a pitch control and add it to the map.
            this.map!.controls.add(
                new control.PitchControl({
                    pitchDegreesDelta: 5,
                    style: ControlStyle.light,
                }),
                {
                    position: ControlPosition.BottomLeft,
                }
            );

            //Create a compass control and add it to the map.
            this.map!.controls.add(
                new control.CompassControl({
                    rotationDegreesDelta: 5,
                    style: ControlStyle.light,
                }),
                {
                    position: ControlPosition.BottomLeft,
                }
            );

            //Add a style control to the map.
            this.map!.controls.add(
                new control.StyleControl({
                    //To add all available styles, you can use the 'all' keyword.
                    mapStyles: [
                        'road',
                        'road_shaded_relief',
                        'grayscale_light',
                        'grayscale_dark',
                        'night',
                        'satellite',
                        'satellite_road_labels',
                        'high_contrast_dark'
                    ],
                }),
                {
                    position: ControlPosition.BottomRight,
                }
            );

            this.isReady = true;
            this.changeLocation(this.currentLocation);
            onReady(e.map);
        });
    };

    // Get the current map style
    public getCurrentMapStyle(): string {
        return this.map?.getStyle().style ?? DEFAULT_MAP_STYLE;
    }

    // Change the current location to the provided location
    public changeLocation(location?: LocationData) {
        this.currentLocation = location;

        if (!location || !this.isReady) {
            return;
        }

        const favoriteData: FavoriteItem | undefined = favoritesService.getDataById(location.id);
        this.flyTo(location, favoriteData);

        if (this.indoorManager) {
            const tilesetId = getLocationTilesetId(location);
            this.indoorManager.setOptions({ tilesetId, geography: 'eu' });

            const facilityId = getLocationFacilityId(location);
            const floorNumber: number = location?.ordinalNumber ?? INVALID_FLOOR_NUMBER;
            if (facilityId && floorNumber >= 0) {
                this.indoorManager.setFacility(facilityId, floorNumber);
            }
        }

        Object.values(this.layers).forEach(layer => layer.setLocation(location));
    }

    // fly to the provided location
    public flyTo(location?: LocationData, favoriteData?: FavoriteItem | undefined) {
        if (!this.isReady || !location) {
            return;
        }

        if (this.isLocationVisible(location) && !favoriteData) {
            return;
        }

        const favoritePosition: MapPosition | undefined = favoriteData?.position;

        let cameraOptions: CameraOptions & AnimationOptions = {
            type: "fly",
            center: [
                (favoritePosition ?? location).longitude,
                (favoritePosition ?? location).latitude,
            ],
            zoom: favoriteData?.zoom ?? getZoomByLocationType(location.type),
        };

        if (favoriteData) {
            cameraOptions.bearing = favoriteData.bearing;
            cameraOptions.pitch = favoriteData.pitch;
        }

        this.map!.setCamera(cameraOptions);

        if (favoriteData?.mapStyle) {
            this.setMapStyle(favoriteData.mapStyle);
        }
    }

    // Show provided object on the map
    public showObject(object: MapObject) {
        if (!this.isReady) {
            return;
        }

        if (object.polygon) {
            const polygon = turf.polygon([object.polygon]);
            const center = getCenter(polygon).geometry?.coordinates;

            this.map!.setCamera({
                type: 'fly',
                center,
                zoom: 22
            });

        }
    }

    // Set map style to the provided map style
    public setMapStyle(style: string) {
        if (!this.isReady || this.getCurrentMapStyle() === style) {
            return;
        }

        this.map!.setStyle({ style });
    }

    /**
     * Checks if the location is visible
     * @param location 
     * @returns true || false
     */
    public isLocationVisible(location: LocationData): boolean {
        if (!this.isReady) {
            return false;
        }

        const currentCamera = this.getCamera();

        if (!currentCamera?.zoom) {
            return false;
        }

        const locationZoom: number = getZoomByLocationType(location.type);
        const zoomDifference: number = currentCamera.zoom - locationZoom;

        const distance: number | undefined = this.getCurrentDistance(location, currentCamera);

        if (!distance) {
            return false;
        }

        return (
            zoomDifference >= 0 && zoomDifference <= 1.4
            && distance <= getMaxDistanceByLocationType(location.type)
        );
    }

    /**
     * Gets the distance between camera and location
     * @param location
     * @param camera 
     * @returns distance from camera center to the provided location
     */
    public getCurrentDistance(
        location: LocationData,
        camera?: CameraOptions & CameraBoundsOptions,
    ): number | undefined {
        if (!this.isReady) {
            return;
        }

        const currentCamera = camera ?? this.getCamera();

        if (!currentCamera?.center) {
            return;
        }

        const distance: number = atlasMath.getDistanceTo(
            new atlasData.Position(currentCamera.center[0], currentCamera.center[1]),
            new atlasData.Position(location.longitude, location.latitude)
        );

        return distance;
    }

    // Set the visibility the provided layerId
    public setLayerVisibility(layerId: string, isVisible: boolean) {
        if (!this.indoorManager || !this.layers[layerId]) {
            return;
        }

        const updatedLayer = this.layers[layerId];
        updatedLayer.setVisibility(isVisible);
        Object.values(this.layers).forEach(layer => {
            // Do not call on the layer which visibility we're changing
            if (layer !== updatedLayer && layer.onLayerVisibilityChange) {
                layer.onLayerVisibilityChange(updatedLayer);
            }
        });
    }

    // resize the map if the map is loaded
    public resizeMap(): void {
        if (this.isReady) {
            this.map!.resize();
        }
    }

    // Parse and update on the map the Security and Warnings Layers with the data from the fetch
    public updateWarningsData(data: WarningsByLocation) {
        // Check if there is a currentLocation set
        if (!this.currentLocation) {
            return;
        }

        // Get the reference for securityLayer an warningsLayer
        const securityLayer: MarkersLayer = this.layers[LayerId.Security] as MarkersLayer;
        const warningsLayer: WarningsLayer = this.layers[LayerId.Warnings] as WarningsLayer;

        // Get warnings from the provided data ( Is run from reducers/warnings.ts with the data received from the fetch)
        const securityWarnings: WarningData[] = getLayerWarnings(data, LayerId.Security, this.currentLocation.id);

        // Update the information on the map with the new data ( security and warnings layers )
        securityLayer.updateData(securityWarnings);
        warningsLayer.updateWarningsData(data);
    }

    // update asset data with the provided data
    public updateAssetsData(data: assetProps[]) {
        // Get the referene for the Assets Layer
        const assetsLayer: AssetLayer = this.layers[LayerId.Asset] as AssetLayer;
        assetsLayer.updateData(data);
    }

    public updateIcons(icons: any[]) {
        // Get the referene for the Assets Layer
        const assetsLayer: AssetLayer = this.layers[LayerId.Asset] as AssetLayer;
        assetsLayer.updateIcons(icons);
    }

    // Update rooms data with the provided rooms data
    public updateRoomsData(roomsByFloorId: RoomsByFloorId) {

        const warningsLayer: WarningsLayer = this.layers[LayerId.Warnings] as WarningsLayer;
        warningsLayer.updateRoomsData(roomsByFloorId);
    }

    // return EventManager ( this.map.events )
    public getEventManager(): EventManager | undefined {
        return this.map?.events;
    }

    // returns the renderedshapeson the provided position
    public getFeatures(position?: atlasData.Position) {
        return this.map?.layers.getRenderedShapes(position, 'unit') ?? [];
    }

    // Get the camera instance on the map
    public getCamera() {
        return this.map?.getCamera();
    }

    // Returns the layers info
    public getLayersInfo() {
        return Object.values(this.layers);
    }

    public isLayerVisible(layerId: string): boolean {
        return this.layers[layerId]?.isVisible ?? false;
    }

    public getPopupInfo():any {
        return this.map?.popups
    }

    // dispose the layers and the map object
    public dispose() {
        if (!this.isReady) {
            return;
        }

        this.isReady = false;

        Object.values(this.layers).forEach(layer => layer.dispose());
        this.map!.dispose();
        this.map = undefined;
    }

    // public toggleMouseUp (toggle:boolean){

    //     if(!this.map ) return;
        

    //     let newCoords:any = [];

    //     const getPosition = (e:any) =>{
    //         newCoords = e.position
    //         console.log(newCoords)
    //         console.log(this?.map?.events)
    //     }


    //     switch (toggle) {
    //         case true:
    //             console.log(true)
    //             this.map.events.add('mouseup', (e:any) =>{
    //                 newCoords = e.position
    //                 console.log(newCoords)
    //                 console.log(this?.map?.events)
    //             });
    //             break;
    //         case false:
    //             console.log(false)
    //             this.map.events.remove('mouseup');
    //             break;
        
    //         default:
    //             break;
    //     }

    //     return newCoords;
    // }
}

// Export mapService layers
export const mapService: MapService = new MapService({
    layers: [
        new IndoorLayer(LayerId.Temperature, 'Temperature'),
        new IndoorLayer(LayerId.Occupancy, 'Occupancy'),
        new MarkersLayer(LayerId.Security, 'Security'),
        new WarningsLayer(LayerId.Warnings, 'Warnings'),
        new AssetLayer(LayerId.Asset, 'Assets')
    ],
});