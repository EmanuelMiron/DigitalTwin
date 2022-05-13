// import Types
import AnimationController from 'css-animation-sync';

// Import Dependencies
import { Map, HtmlMarker, Popup, PopupTemplate } from 'azure-maps-control';
import { indoor } from 'azure-maps-indoor';
import { getId } from '@fluentui/react';
import { Dispatch } from '@reduxjs/toolkit';

// Import Models
import { MarkerData } from '../../models/mapData';
import { LocationData, LocationType } from '../../models/locationsData';
import { PopoverType } from '../../models/popoversData';
import { Layer, LayerType } from "./Layer"
import { assetProps } from '../../reducers/assetData';

// Import Reducers
import { hidePopover, showPopover } from '../../reducers/popover';

// Import Helpers
import { getZoomByLocationType } from '../../helpers/locations';

// Import store
import { store } from '../../store/store';
import { showDialog } from '../../reducers/dialog';

export class AssetLayer implements Layer {

    // Initialise public variables
    public readonly type = LayerType.Markers;

    // Initialise private variables
    private map?: Map;
    private data: any = []
    private icons: any = []
    private visible: boolean = false;
    private dispatch?: Dispatch<any>;
    private animation?: AnimationController;
    private isAsssetsVisible: boolean = false;
    private readonly minZoom: number = getZoomByLocationType(LocationType.Floor);
    private assets: HtmlMarker[] = [];
    static toggleMouseUp: any;

    

    constructor(
        public readonly id: string,
        public readonly name: string,
    ) { }

    // return if this instance is Visible
    public get isVisible(): boolean {
        return this.visible;
    }

    // Initialise Layer
    async initialize(map: Map, indoorManager: indoor.IndoorManager, dispatch: Dispatch<any>) {
        this.map = map;
        this.dispatch = dispatch;
    }


    // Sets the visibility of the layer with the provided value ( true or false )
    setVisibility(isVisible: boolean) {
        if (!this.map || this.isVisible === isVisible) {
            return;
        }

        this.visible = isVisible;
        this.updateAssets();
    }

    
    setLocation(location: LocationData) { }

    // Removes the animation
    dispose() { this.removeAnimation(); }

    // Update data with the provided data
    updateData(data: assetProps[]){
        this.data = data;
        

        if(this.isVisible) {
            this.updateAssets();
        }
    }

    // Update data with the provided data
    updateDesk(data:any){
        
        // Message example
        // {
        //     "topic": "updateAsset",
        //     "type": "Stand-Up Desk",
        //     "assetId": 435,
        //     "props": {
        //         "Reserved": true,
        //     }
        // }

        let el:any = document.getElementById(`asset-${data.assetId}`)

        if(el){
            
            el = el.children;

            if(data.type === 'Stand-Up Desk'){
                if(data.props.Reserved === 'true' || data.props.Reserved === true){
                    el[0].setAttribute('style', "fill: red;")
                }else {
                    el[0].setAttribute('style', "fill: green;")
                }
            }
        }

        

    }

    updateIcons(icons:any[]){
        this.icons = icons
    }

    // Returns true if the assets should be visible
    private shouldAssetsBeVisible() {
        if(!this.map || !this.isVisible){
            return false;
        }

        const currentZoom: number | undefined = this.map.getCamera().zoom;
        // console.log(this, this.minZoom);
        return currentZoom ? currentZoom >= this.minZoom : false;
    }

    // If the assets should be visible, display the assets
    private updateAssetsVisibility = () => {
        if(!this.map){
            return;
        }

        const isVisible = this.shouldAssetsBeVisible() && this.assets.length > 1;

        if( isVisible === this.isAsssetsVisible){
            return;
        }

        this.isAsssetsVisible = isVisible;

        this.assets.forEach( (asset:HtmlMarker) => 
            asset.setOptions({ visible: isVisible})
        );
    }

    // Remove animation
    private removeAnimation() {
        if(this.animation) {
            this.animation?.free();
            this.animation = undefined;
        }
    }

    // Remove assets from map
    private removeAssets() {
        if(this.map) {
            this.assets.forEach((asset: HtmlMarker) => this.map!.markers.remove(asset));
        }
    }

    // Reload assets data ( if there are any )
    private updateAssets() {
        // resets assets, animations and events
        this.removeAssets();
        this.removeAnimation();
        this.map?.events.remove('zoom', this.updateAssetsVisibility);
        this.isAsssetsVisible = false;

        if(!this.map || !this.isVisible){
            return;
        }

        // True if the assets should be visible
        const isAssetsVisible = this.shouldAssetsBeVisible();

        // Create Assets from the provided data
        this.data.forEach((assetData: MarkerData) => {
            // console.log(this.data, assetData)
            this.createAsset(assetData, isAssetsVisible);
        })

        // If there are assets, change the following layer settings
        if(this.assets.length > 0){
            this.isAsssetsVisible = isAssetsVisible;
            this.animation = new AnimationController('pulse');
            this.map?.events.add('zoom', this.updateAssetsVisibility);
        }    
    }

    
    private createAsset(data: any, isVisible:boolean){

        // If there is no map or data.postion return the function
        if(!this.map || !data || !data.position) {
            return;
        }


        // console.log(data)
        
        // Get the id for the curent asset
        // const id: string = getId(`${this.id}-asset`);
        const id: string = `asset-${data.assetId}`

        
        const iconID = Number(data.iconID);
        const icon = this.icons.filter((icon:any) => icon.id === iconID)

        const htmlMarker = [icon[0].svg.slice(0, 4), ` id="${id}" `, icon[0].svg.slice(4)].join('')
        
        // Create the html Marker
        // console.log(this.icons);
        const htmlAsset: HtmlMarker = new HtmlMarker({
            htmlContent : htmlMarker,
            position: [data.position.longitude, data.position.latitude],
            visible: isVisible,
            draggable: (data.draggable === 'true' || data.draggable === true),
            
        });


        this.map.events.add('dragend', htmlAsset, (e) => {

            if( e === undefined || e.target === undefined) return;

            const state = store.getState();

            store.dispatch(showDialog({
                ...state.dialogs.editAssetPosition,
                newCoords: e.target.getOptions().position
            }));

        })

        // Add the marker to the map and assets
        this.map.markers.add(htmlAsset);
        this.assets.push(htmlAsset);
        

        // Get asset DOM Element
        const asset = document.getElementById(id);

        let h:any = asset?.children

        if(h === undefined){
            console.log(id)
        }

        // console.log(data);
        if(data.type === 'Stand-Up Desk'){
            if(data.Reserved === 'true' || data.Reserved === true){
                h[0].setAttribute('style', "fill: red;")
            }else {
                h[0].setAttribute('style', "fill: green;")
            }
        }

        // console.log(this.assets)
        // console.log(htmlAsset)

        if(!asset) {
            return;
        }

        const filteredData:any = {};
        for (let prop in data){
            if(prop !== 'position' && prop !== 'assetId' && prop !== 'iconID' && prop !== 'draggable'){
                filteredData[prop] = data[prop];
            }
        }

        const newPopup = new Popup({
            content: PopupTemplate.applyTemplate({title:`${data.type} #${data.assetId}`, ...filteredData}),
            position: [data.position.longitude,data.position.latitude],
            draggable: true,
            closeButton: true,
            pixelOffset: [0,-30]
        })
        newPopup.attach(this.map);
        
        // Display a Menu popover on right click
        asset.onmousedown = (e) => {
            if(e.button === 0){
                if(!newPopup.isOpen()){
                    this.map?.popups.clear();
                }
                newPopup.open(this.map);

                if((data.draggable === 'true') || (data.draggable === true)){
                    this.map?.popups.clear();
                }

            }else if(e.button === 2){
                this.map?.popups.clear();
                this.dispatch!(hidePopover(PopoverType.Warning))
                this.dispatch!(showPopover({
                    type: PopoverType.Menu,
                    isVisible: true,
                    target: `#${id}`,
                    onAsset: true,
                    assetId: data.assetId,
                    assetType: data.type,
                    coords: [data.position.longitude,data.position.latitude],
                    deskName: data["Desk Name"]
                }))
            }
        }

        // this.map.events.add('mouseup', hh);

        // Hide Warning popover on mouse leave
        asset.onmouseleave = () => {
            this.dispatch!(hidePopover(PopoverType.Warning));

            // newPopup.close();
        }
    }

    
}