// Favorites switcher ( Renders the LocationSwitcher component with different props )

//Import Dependencies
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DirectionalHint } from '@fluentui/react';

// Import Components
import LocationSwitcher from '../LocationSwitcher/LocationSwitcher';
import { NoFavorites } from './NoFavorites/NoFavorites';

// Import Services
import { Favorites, favoritesService } from '../../services/favoritesService';

// Import Models
import { AllLocationsData, LocationData } from '../../models/locationsData';

// Import Reducers
import { changeLocation, selectLocationsData, selectCurrentLocationId } from '../../reducers/locationData';

// Import helpers
import { getFullLocationName } from '../../helpers/locations';

// Interfaces
export interface FavoritesSwitcherProps {
  target: string | Element | MouseEvent | React.RefObject<Element>;
  onDismiss?: () => void;
}

// Export FavoritesSwitcher Component
export const FavoritesSwitcher: React.FC<FavoritesSwitcherProps> = ({
  target,
  onDismiss,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  // Get all location data from state
  const allLocationsData: AllLocationsData = useSelector(selectLocationsData);
  // Get current location data from state
  const currentLocationId: string | undefined = useSelector(selectCurrentLocationId);
  // Get favorites from localStorage
  const favorites: Favorites = favoritesService.getFavorites();
  const favoriteLocations: string[] = Object.keys(favorites);

  const renderItemName = useCallback((locationId: string) => {
    return getFullLocationName(locationId, allLocationsData);
  }, [allLocationsData]);


  // If there are no favorites render NoFavorites component
  if (!favoriteLocations.length) {
    return (
      <NoFavorites target={target} onDismiss={onDismiss}/>
    );
  }

  return (
    <LocationSwitcher
      target={target}
      currentLocationId={currentLocationId ?? ''}
      locations={favoriteLocations}
      directionalHint={DirectionalHint.rightTopEdge}
      onDismiss={onDismiss}
      onItemClick={(location: LocationData) => {
        dispatch(changeLocation(location.id, history));

        if (onDismiss) {
          onDismiss();
        }
      }}
      renderItemName={renderItemName}
    />
  );
};
