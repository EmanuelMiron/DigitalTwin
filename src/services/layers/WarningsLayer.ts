// Import Dependencies
import {
    data as atlasData,
    layer as atlasLayer,
    LineLayerOptions,
    Map,
    PolygonLayerOptions,
    source as atlasSource,
} from 'azure-maps-control';
import { indoor } from 'azure-maps-indoor';

// Import Types
import { Layer, LayerType } from './Layer';

// Import Models
import { LocationData, LocationType } from '../../models/locationsData';
import { WarningData, WarningsByLayers, WarningsByLocation, WarningsByRooms } from '../../models/warningsData';
import { RoomsByFloorId } from '../../models/roomsData';
import { Polygon } from '../../models/mapData';

// Import Helpers
import { getZoomByLocationType } from '../../helpers/locations';


// Interfaces
interface LayerSettings extends PolygonLayerOptions, LineLayerOptions {
    maxWarningsCount: number;
};

// Types

type LayersSettings = { [layerLevel: string]: LayerSettings };

// Constants

enum LayerLevel {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
};

// Set Parameters
const MAX_OPACITY = 0.45;
const ANIMATION_DURATION = 3000;

// Set properties for the layerSettings
const layersSettings: LayersSettings = {
    [LayerLevel.Low]: {
        maxWarningsCount: 1,
        fillColor: '#FFCC00',
        strokeColor: '#FFBA00',
    },
    [LayerLevel.Medium]: {
        maxWarningsCount: 2,
        fillColor: '#FF8800',
        strokeColor: '#FF7700',
    },
    [LayerLevel.High]: {
        maxWarningsCount: Infinity,
        fillColor: '#FF0000',
        strokeColor: '#DD0000',
    },
};

// Get Layer Level for the provided warningsCount
const getLayerLevel = (warningsCount: number): LayerLevel => {
    // Loop through layersSettings
    for (const layerLevel in layersSettings) {
        // If the warningsCount is less than or equal to the current layer maxWarningsCount return the current layer level
        if (warningsCount <= layersSettings[layerLevel].maxWarningsCount) {
            return layerLevel as LayerLevel;
        }
    }
    // If none of the above are a match, return the LayerLevel.High
    return LayerLevel.High;
}

export class WarningsLayer implements Layer {
    // Initialise public variables
    public type = LayerType.Warnings;

    // Initialise private variables
    private map?: Map;
    private data: WarningsByLocation = {};
    private roomsByFloorId: RoomsByFloorId = {};
    private isLayerOn: boolean = false;
    private currentLocation?: LocationData;
    private indoorLayerId?: string = 'warnings';
    private dataSources: { [layerLevel: string]: atlasSource.DataSource } = {};
    private layers: { [layerLevel: string]: [atlasLayer.PolygonLayer, atlasLayer.LineLayer] } = {};
    private animationInterval?: NodeJS.Timeout;
    private warningsOpacity: number = MAX_OPACITY;

    // Create the class constructor
    constructor(
        public readonly id: string,
        public readonly name: string,
    ) { }

    // Return if the layer is on ( default false )
    public get isVisible(): boolean {
        return this.isLayerOn;
    }

    // Return if the warnings are visible ( default false )
    private get isWarningsVisible(): boolean {
        // Used double ! to return a boolean true if the string is not empty
        return this.isLayerOn && !!this.indoorLayerId;
    }

    // Initialise the Warnings Layer
    initialize(map: Map, _indoorManager: indoor.IndoorManager) {
        // create a map reference
        this.map = map;

        // Get the minZoom for the location type provided
        const minZoom: number = getZoomByLocationType(LocationType.Floor);

        // Loop over layersSettings
        for (const layerLevel in layersSettings) {
            // Create a new datasource for each layerlevel ( Low, Medium, High)
            const dataSource = new atlasSource.DataSource();
            // Assign the created datasources to the dataSources Obj.
            this.dataSources[layerLevel] = dataSource;
            // Add the datasources to the map
            this.map.sources.add(dataSource);

            // Destructure the fillColor and strokeColor from the layerSettings Obj for each layer level
            const { fillColor, strokeColor } = layersSettings[layerLevel];

            // Create 2 layers for each layerlevel ( A Polygon Layer and a Line Layer )
            this.layers[layerLevel] = [
                // Create a Polygon Layer with the datasource newly created and with the props for the corresponding layer level
                new atlasLayer.PolygonLayer(
                    dataSource,
                    undefined,
                    {
                        fillColor,
                        minZoom,
                        fillOpacity: this.warningsOpacity,
                    }
                ),

                // Create a Line Layer with the datasource newly created and with the props for the corresponding layer level
                new atlasLayer.LineLayer(
                    dataSource,
                    undefined,
                    {
                        strokeColor,
                        strokeWidth: 5,
                        strokeOpacity: 1,
                        minZoom,
                    }
                )
            ];

            // Add the newly created layers to the map
            // this.map.layers.add(this.layers[layerLevel]);

            // const dataSource2 = new atlasSource.DataSource();
            // this.map.sources.add(dataSource2)

            // this.map.layers.add(new atlasLayer.TileLayer(dataSource2, 'hello'  ))
            // dataSource2.add(
            //     new atlasData.Feature(new atlasData.Point([20,20]),{
            //         title: 'No template - property table',
            //         message: 'This point doesn\'t have a template defined, fallback to title and table of properties.',
            //         randomValue: 10,
            //         url: 'https://aka.ms/AzureMapsSamples',
            //         imageLink: 'https://azuremapscodesamples.azurewebsites.net/common/images/Pike_Market.jpg',
            //         email: 'info@microsoft.com'
            //     })
            //     )
                
        };
    }

    // Change the visibility state with the state provided
    setVisibility(isVisible: boolean) {
        // If the map isn't initialised return the function
        if (!this.map) {
            return;
        }

        // Change the isLayerOn var to the provided value
        this.isLayerOn = isVisible;
        // Updates the warnings and creates them ( if they don't exist yet )
        this.updateWarnings();
    }

    // Update warnings on visibility change
    onLayerVisibilityChange(layer: Layer) {
        if (layer.type === LayerType.Indoor && layer.isVisible) {
            this.indoorLayerId = layer.id;
            this.updateWarnings();
        }
    }

    // Change curentLocation
    setLocation(location: LocationData) {
        this.currentLocation = location;
    }

    // When deleting the layer or make it invisible remove the animation
    dispose() {
        this.removeAnimation();
    }

    // Update the warnings data with the provided data
    updateWarningsData(data: WarningsByLocation) {
        this.data = data;

        if (this.isLayerOn) {
            this.updateWarnings();
        }
    }

    // Update rooms data with the provide rooms data
    updateRoomsData(roomsByFloorId: RoomsByFloorId) {
        this.roomsByFloorId = roomsByFloorId;

        if (this.isLayerOn) {
            this.updateWarnings();
        }
    }

    // Stops the animation and resets variables
    private removeAnimation() {
        // if there is a animationInterval set continue the function
        if (this.animationInterval) {
            // Stops the interval for the current animationInterval ( It is infinite for the warning animation)
            clearInterval(this.animationInterval);
            // Resets the animationInterval value
            this.animationInterval = undefined;
            // Resets the Layer Opacity to default
            this.setLayersOpacity(MAX_OPACITY);
        }
    }

    // Loop over all the datasources created in this layer and clear the layers
    private removeWarnings() {
        for (const layerLevel in this.dataSources) {
            this.dataSources[layerLevel].clear();
        }
    }

    //  Update Warnings Data 
    private updateWarnings() {
        // Clear all the datasources created on this layer
        this.removeWarnings();
        // Removes the animation
        this.removeAnimation();
        // If the map isn't initialised return the funtion
        if (!this.map || !this.currentLocation || !this.isWarningsVisible) {
            return;
        }

        // Initialise variables
        const floorId: string = this.currentLocation.id;
        const locationWarnings: WarningsByRooms | undefined = this.data[floorId];
        const roomsData = this.roomsByFloorId[floorId];

        // If there are no locationWarnings or roomsData return the function
        if (!locationWarnings || !roomsData) {
            return;
        }

        // Createa warnings for each roomId from locationWarnings
        for (const roomId in locationWarnings) {
            const roomWarnings: WarningsByLayers | undefined = locationWarnings[roomId];

            if (!roomWarnings) {
                continue;
            }

            const warnings: WarningData[] | undefined = roomWarnings[this.indoorLayerId!];
            const warningPolygon: Polygon | undefined = roomsData[roomId]?.polygon;

            if (!warnings?.length || !warningPolygon) {
                continue;
            }

            this.createWarning(warningPolygon, warnings.length);
        }

        // Creates the nimation
        this.animationInterval = setInterval(() => {
            this.setLayersOpacity(this.warningsOpacity ? 0 : MAX_OPACITY);
        }, ANIMATION_DURATION / 2);
    }

    // set the layer opacity to the provided opacity
    private setLayersOpacity(opacity: number) {
        if (this.warningsOpacity === opacity) {
            return;
        }

        this.warningsOpacity = opacity;

        for (const layerLevel in this.layers) {
            this.layers[layerLevel][0].setOptions({
                fillOpacity: opacity,
            });

            this.layers[layerLevel][1].setOptions({
                strokeOpacity: opacity > 0 ? 1 : 0,
            });
        }
    }

    // add the created polygons to the map.
    private createWarning(polygon: Polygon, count: number) {
        if (!this.map) {
            return;
        }

        const layerLevel: LayerLevel = getLayerLevel(count);

        const positions: atlasData.Position[] = polygon.map(
            (position) => new atlasData.Position(position[0], position[1])
        );

        this.dataSources[layerLevel].add(new atlasData.Polygon(positions));
    }
}