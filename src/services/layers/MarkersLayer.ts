// Import Types
import AnimationController from 'css-animation-sync';

// Import Dependencies
import { HtmlMarker, Map } from 'azure-maps-control';
import { indoor } from 'azure-maps-indoor';
import { Dispatch } from '@reduxjs/toolkit';
import { getId } from '@fluentui/react';

// Import Models
import { Layer, LayerType } from './Layer';
import { LocationData, LocationType } from '../../models/locationsData';
import { PopoverType } from '../../models/popoversData';
import { MarkerData } from '../../models/mapData';

// Import Reducers
import { hidePopover, showPopover } from '../../reducers/popover';

// Import helpers
import { getZoomByLocationType } from '../../helpers/locations';



export class MarkersLayer implements Layer {

    // Initialise public variables
    public readonly type = LayerType.Markers;

    // Initialise private variables
    private map?: Map;
    private data: MarkerData[] = [];
    private visible: boolean = false;
    private dispatch?: Dispatch<any>;
    private animation?: AnimationController;
    private isMarkersVisible: boolean = false;
    private readonly minZoom: number = getZoomByLocationType(LocationType.Floor);
    private markers: HtmlMarker[] = [];

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
        this.map = map;
        this.dispatch = dispatch;
    }

    // Sets the visibility of the layer with the provided value ( true or false )
    setVisibility(isVisible: boolean) {
        if (!this.map || this.isVisible === isVisible) {
            return;
        }

        this.visible = isVisible;
        this.updateMarkers();
    }

    setLocation(location: LocationData) { }

    // Removes the animation
    dispose() {
        this.removeAnimation();
    }

    // Update data with the provided data
    updateData(data: MarkerData[]) {
        this.data = data;
        if (this.isVisible) {
            this.updateMarkers();
        }
    }

    // Returns true if the markers should be visible
    private shouldMarkersBeVisible() {
        if (!this.map || !this.isVisible) {
            return false;
        }

        const currentZoom: number | undefined = this.map.getCamera().zoom;
        return currentZoom ? currentZoom >= this.minZoom : false;
    }

    // If the markers should be visible, display the markers
    private updateMarkersVisibility = () => {
        if (!this.map) {
            return;
        }

        const isVisible = this.shouldMarkersBeVisible() && this.markers.length > 1;

        if (isVisible === this.isMarkersVisible) {
            return;
        }

        this.isMarkersVisible = isVisible;

        this.markers.forEach((marker: HtmlMarker) => marker.setOptions({ visible: isVisible }));
    }

    // Remove animation
    private removeAnimation() {
        if (this.animation) {
            this.animation?.free();
            this.animation = undefined;
        }
    }

    // Remove markers from map
    private removeMarkers() {
        if (this.map) {
            this.markers.forEach((marker: HtmlMarker) => this.map!.markers.remove(marker));
        }
    }

    // Reload assets data ( if there are any )
    private updateMarkers() {
        // resets markers, animations and events
        this.removeMarkers();
        this.removeAnimation();
        this.map?.events.remove('zoom', this.updateMarkersVisibility);
        this.isMarkersVisible = false;

        if (!this.map || !this.isVisible) {
            return;
        }

        // True if the markers should be visible
        const isMarkersVisible = this.shouldMarkersBeVisible();

        // Create markers from the provided data
        this.data.forEach((markerData: MarkerData) => {
            this.createMarker(markerData, isMarkersVisible);
        });

        // If there are assets, change the following layer settings
        if (this.markers.length > 0) {
            this.isMarkersVisible = isMarkersVisible;
            this.animation = new AnimationController('pulse');
            this.map?.events.add('zoom', this.updateMarkersVisibility);
        }
    }

    private createMarker(data: MarkerData, isVisible: boolean) {
        // If there is no map or data.postion return the function
        if (!this.map || !data.position) {
            return;
        }

        // Get the id for the curent marker
        const id: string = getId(`${this.id}-marker`);

        // Create the html Marker
        const htmlMarker: HtmlMarker = new HtmlMarker({
            htmlContent: `<div id=${id} class="pulseIcon"></div>`,
            position: [data.position.longitude, data.position.latitude],
            visible: isVisible,
        });

        // Add the marker to the map and markers
        this.map.markers.add(htmlMarker);
        this.markers.push(htmlMarker);

        // Get marker DOM Element
        const marker = document.getElementById(id);

        //  If there is no marker, return
        if (!marker) {
            return;
        }

        // Display a Warning popover on hover
        marker.onmouseover = () => this.dispatch!(showPopover({
            type: PopoverType.Warning,
            isVisible: true,
            target: `#${id}`,
            assetId: 0
        }));

        

        // Hide Warning popover on mouse leave
        marker.onmouseleave = () => this.dispatch!(hidePopover(PopoverType.Warning));
    }
}
