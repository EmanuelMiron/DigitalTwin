// Import Dependencies
import { CameraBoundsOptions, CameraOptions } from 'azure-maps-control';

// Import Models
import { MapPosition } from '../models/mapData';

// Import Services
import { mapService } from './mapService';

// Import Reducers
import { LayersVisibilityState } from '../reducers/layersData';

// Import Interfaces
export interface FavoriteItem {
    locationId: string;
    position?: MapPosition;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    layersVisibility?: LayersVisibilityState;
    mapStyle?: string;
};

export interface Favorites {
    [locationId: string]: FavoriteItem;
};


// Create the FavoritesService Class
export class FavoritesService {

    // Saves the favorites into a private variable
    private favorites: Favorites = FavoritesService.loadFavorites();

    // returnts favorites from localStorage
    private static loadFavorites(): Favorites {
        const json: string | undefined = localStorage.favorites;

        return json ? JSON.parse(json) : {};
    }


    // Returns the favorites
    public getFavorites = (): Favorites => this.favorites;

    // Get the favorites for the provided locationId
    public getDataById = (locationId: string): FavoriteItem | undefined => this.favorites[locationId];

    // Save the Favorites to the localStorage
    private saveFavorites() {
        localStorage.favorites = JSON.stringify(this.favorites);
    }

    // Add Favorite item and saves it to localStorage
    private addFavoriteItem(data: FavoriteItem) {
        this.favorites[data.locationId] = data;
        this.saveFavorites();
    }

    // add a Favorite Item with the provided values
    public addToFavorites(
        locationId: string,
        isCurrentLocation: boolean,
        layersVisibility: LayersVisibilityState
    ) {
        // set the locationId for the favoriteItem
        let favoriteItem: FavoriteItem = {
            locationId,
        };

        // If this is the current location
        if (isCurrentLocation) {
            const mapCamera: CameraOptions & CameraBoundsOptions | undefined = mapService.getCamera();
            const mapStyle: string = mapService.getCurrentMapStyle();

            favoriteItem = {
                locationId,
                layersVisibility,
                mapStyle,
            };

            if (mapCamera) {
                const position: number[] | undefined = mapCamera.center;
                // Saves the favoriteItem position ( coords )
                if (position) {
                    favoriteItem.position = {
                        longitude: position[0],
                        latitude: position[1],
                    }
                }
                // Saves the favoriteItem zoom, bearing, pitch
                favoriteItem.zoom = mapCamera.zoom;
                favoriteItem.bearing = mapCamera.bearing;
                favoriteItem.pitch = mapCamera.pitch;
            }
        }

        // Add the created Favorite item to this.favorites and saves it to localStorage
        this.addFavoriteItem(favoriteItem);
    }

    // delete a locationId from the favorites
    public removeFromFavorites(locationId: string) {
        if (this.isFavorite(locationId)) {
            delete this.favorites[locationId];
            this.saveFavorites();
        }
    }

    /**
     * Checks if locationId is a favorite location
     * @param locationId 
     * @returns true or false
     */
    public isFavorite(locationId: string): boolean {
        return !!this.favorites[locationId];
    }
}

// Export a new instance of the service class
export const favoritesService = new FavoritesService();