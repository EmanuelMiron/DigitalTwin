// Import Dependencies
import { Map } from "azure-maps-control";
import { indoor } from "azure-maps-indoor";
import { Dispatch } from '@reduxjs/toolkit';

// Import Reducers
import { hidePopover, showPopover } from '../../reducers/popover';

// Import Types
import { Layer, LayerType } from "./Layer";

// Import Models
import { LocationData, LocationType } from "../../models/locationsData";
import { PopoverType } from '../../models/popoversData';

// Import Components
import Legend from "../../components/Legend/Legend";

// Import Config
import { subscriptionKey } from "../../config";
import { store } from "../../store/store";


// Interfaces
interface NumberRule {
    color: string;
    range: {
        minimum?: number | null;
        maximum?: number | null;
        exclusiveMinimum?: number | null;
        exclusiveMaximum?: number | null;
    };
}

interface RawStyle {
    keyName: string;
    type: string;
    rules: Rule[];
}

interface RawStyleSheet {
    statesetStyle?: null | {
        styles: RawStyle[];
    }
}

// Types
type Rule = NumberRule;
type StateColors = Record<string, string>

export class IndoorLayer implements Layer {

    // Initialise private variables
    private indoorManager?: indoor.IndoorManager;
    private legendItems: Record<string, string> = {};
    private statesetId?: string;
    private visible: boolean = false;
    private map?: Map;
    private dispatch?: Dispatch<any>;

    // Initialise public variables
    public readonly type = LayerType.Indoor;

    constructor(
        public readonly id: string,
        public readonly name: string,
    ) { }

    // return if this instance is Visible
    public get isVisible(): boolean {
        return this.visible;
    }

    // Initialise Layer
    initialize(map: Map, indoorManager: indoor.IndoorManager, dispatch: Dispatch<any>) {


        this.indoorManager = indoorManager;
        this.dispatch = dispatch
        this.map = map;

        // Add event on map for right click ( Create Asset Popup ) if the admin is logged in
        this.createAssetButton();
    }

    // Sets the visibility of the layer with the provided value ( true or false )
    setVisibility(isVisible: boolean) {
        if (isVisible !== this.visible) {
            this.updateStateSetId(isVisible ? this.statesetId : undefined);
            this.visible = isVisible;
        }
    }

    // Change the viibility for the provided layer
    onLayerVisibilityChange(layer: Layer) {
        if (layer.type === LayerType.Indoor && layer.isVisible) {
            this.visible = false;
        }
    }

    // If we have the indoorManager initialised, turn on the dynamicStyling
    private updateStateSetId(statesetId: string | undefined) {
        if (!this.indoorManager) {
            return;
        }

        const facility = this.indoorManager.getCurrentFacility();
        this.indoorManager.setOptions({ statesetId });
        // Turn dynamic styling on when at least one indoor layer is visible
        this.indoorManager?.setDynamicStyling(!!statesetId);
        this.indoorManager.setFacility(...facility);
    }

    // Adds the event on the map for right click and shows a popup with the Create Asset Button
    private createAssetButton = () => {
        if (!this.map) return;

        // Adds the mouseup event on the Indoor Layer
        this.map.events.add('mouseup', (e) => {
            console.log(e)
            if (e.originalEvent !== undefined) {

                
                
                // Initialise continueEvent variable
                let continueEvent: boolean = false;
                
                // Loop through every shape and see if you clicked on the Indoor Layer
                e.shapes?.forEach((shape: any) => {
                    if (shape.source.search('indoor') !== -1) {
                        continueEvent = true;
                    }
                })
                
                // If you didn't clicked on the Indoor Layer, return ( don't show the popup)
                if (continueEvent === false) return;
                
                // Initialise mE and targetElement
                let mE = e.originalEvent as MouseEvent;
                let targetElement = mE.target as HTMLElement
                
                const state = store.getState()
                const user = state.user;
                if (user.name !== "admin") return;
                
                // Checks to see if you pressed the right click and if the targetElement is canvas ( on the map )
                if (targetElement.localName === 'canvas') {
                    this.map?.popups.clear();

                    if (mE.button !== 2) return;
                    // Creates and shows the popover Menu ( Create Asset )
                    this.dispatch!(showPopover({
                        type: PopoverType.Menu,
                        isVisible: true,
                        target: { x: mE.clientX, y: mE.clientY },
                        onAsset: false,
                        assetId: 0,
                        coords: e.position
                    }))
                }
            }
        })

        // When zooming, hide the popover   
        this.map.events.add('zoom', e => {
            this.dispatch!(hidePopover(PopoverType.Menu))
        })
    }


    public async setLocation(data: LocationData) {
        // Get statesetId for the current location
        this.statesetId = getStatesetId(data, this.id);
        // if the layer is visible update the statesetId
        if (this.visible) {
            this.updateStateSetId(this.statesetId);
        }

        // If we have a statesetId get the colors for the legend
        if (this.statesetId) {
            try {
                this.legendItems = await fetchStateColors(this.statesetId, this.id);
            } catch (err) {
                console.error(`Failed to fetch state colors: ${err}`);
            }
        }
    }

    dispose() { }

    // Render the component with it's props
    getMapComponent() {
        if (Object.keys(this.legendItems).length !== 0) {
            return {
                component: Legend,
                props: {
                    layerId: this.id,
                    title: this.name,
                    items: this.legendItems,
                }
            };
        }
    }
}

// parse the ules and return the color and a rule
const parseRule = (type: string, rule: Rule): [string, string] | undefined => {
    if (type === "number") {
        const { color, range } = (rule as NumberRule);
        const { minimum, exclusiveMinimum, maximum, exclusiveMaximum } = range;

        const min = minimum ?? exclusiveMinimum;
        const max = maximum ?? exclusiveMaximum;

        if (!min && !max) {
            return;
        }

        if (min && max) {
            return [color, `${min} ~ ${max}`];
        }

        if (!min) {
            return [color, `< ${max}`];
        }

        return [color, `> ${min}`];
    }

    return;
};

// Initialise cached colors
const cachedColors: { [id: string]: StateColors | undefined } = {};

// Fetch and display stateColors
const fetchStateColors = async (statesetId: string, layerId: string): Promise<StateColors> => {
    const key = `${statesetId}#${layerId}`;
    const cached = cachedColors[key];
    if (cached !== undefined) {
        return cached;
    }
    const url = `https://eu.atlas.microsoft.com/featureStateSets/${statesetId}?subscription-key=${subscriptionKey}&api-version=2.0`

    try {
        const response = await fetch(url)
        if (response.status !== 200) {
            throw new Error(`HTTP${response.status} ${response.text}`);
        }

        const rawStylesheet: RawStyleSheet = await response.json();
        const style = rawStylesheet.statesetStyle?.styles
            .find(style => style.keyName === layerId);

        if (!style) {
            return {}
        }

        const colors = style.rules.reduce<Record<string, string>>((acc, rule) => {
            const parsed = parseRule(style.type, rule);
            if (parsed) {
                const [color, text] = parsed;
                acc[color] = text;
            }
            return acc;
        }, {});

        cachedColors[key] = colors;
        return colors;
    } catch (error) {
        console.error(`Failed to fetch stateset ${statesetId}: ${error}`);
        return {}
    }
};

// Get statesetId from the location and locationId
const getStatesetId = (location: LocationData, layerId: string): string | undefined => {
    // For floor locations return their parent's statesetId
    const loc = location.type === LocationType.Floor && location.parent ? location.parent : location;
    return loc.config?.stateSets?.find(s => s.stateSetName === layerId)?.stateSetId;
}