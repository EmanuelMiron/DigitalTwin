// Import Styles
import './FavoriteLocationButton.scss';

// Import Dependencies
import React, { useCallback, useState, useEffect } from 'react';
import { IconButton, } from '@fluentui/react';
import { useSelector } from 'react-redux';

// Import Services
import { favoritesService } from '../../services/favoritesService';

// Import Reducers
import { selectCurrentLocationId } from '../../reducers/locationData';
import { LayersVisibilityState, selectLayersVisibility } from '../../reducers/layersData';

// Interfaces
export interface FavoriteLocationButtonProps {
	locationId: string;
	locationName: string;
}


const FavoriteLocationButton: React.FC<FavoriteLocationButtonProps> = ({
	locationId,
	locationName,
}) => {
	const currentLocationId: string | undefined = useSelector(selectCurrentLocationId);
	const layersVisibility: LayersVisibilityState = useSelector(selectLayersVisibility);

	// State
	const [isFavorite, makeFavorite] = useState(favoritesService.isFavorite(locationId));

	// change isFavorite when locationId changes
	useEffect(() => {
		makeFavorite(favoritesService.isFavorite(locationId));
	}, [locationId]);

	
	const onFavoriteButtonClick = useCallback((event: React.MouseEvent<any>) => {
		event.preventDefault();
		event.stopPropagation();

		if (isFavorite) {
			// If the current location is favorite, delete it from favorites
			favoritesService.removeFromFavorites(locationId);
		} else {
			// If the current location is not favorite, add it the favorites
			favoritesService.addToFavorites(locationId, currentLocationId === locationId, layersVisibility);
		}

		// Change the isFavorite state
		makeFavorite(!isFavorite);
	}, [isFavorite, locationId, currentLocationId, layersVisibility]);

	if (!locationId || !locationName) {
		return null;
	}


	// Handle Aria-Label

	let starButtonAriaLabel: string;

	if (isFavorite) {
		starButtonAriaLabel = `Remove ${locationName} from favorite list`;
	} else {
		starButtonAriaLabel = `Add ${locationName} to favorite list`;
	}

	return (
		<IconButton
			id={locationId}
			className={`favorite-location-button ${isFavorite ? 'checked' : ''}`}
			ariaLabel={starButtonAriaLabel}
			onClick={onFavoriteButtonClick}
			iconProps={{ iconName: "FavoriteStarFill" }}
		/>
	);
};


// Export the FavoriteLocationButton Component
export default FavoriteLocationButton;
