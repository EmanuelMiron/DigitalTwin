// Import Dependencies
import React from 'react';
import { DirectionalHint } from '@fluentui/react';
import { useSelector } from 'react-redux';

// Import Components
import FavoriteLocationButton from '../FavoriteLocationButton/FavoriteLocationButton';
import { SearchCallout } from '../SearchCallout/SearchCallout';

// Import Models
import { AllLocationsData, LocationData } from '../../models/locationsData';

// Import Reducers
import { selectLocationsData } from '../../reducers/locationData';

// Interfaces
export interface LocationSwitcherProps {
  target?: string | Element | MouseEvent | React.RefObject<Element>;
  currentLocationId: string;
  locations: string[];
  directionalHint?: DirectionalHint;
  onItemClick?: (location: LocationData) => void;
  onDismiss?: () => void;
  renderItemName?: (locationId: string) => string;
}

// LocationSwitcher Component
const LocationSwitcher: React.FC<LocationSwitcherProps> = ({
  target,
  currentLocationId,
  locations,
  directionalHint,
  onItemClick,
  onDismiss,
  renderItemName,
}) => {
  // Get all locations data
  const allLocationsData: AllLocationsData = useSelector(selectLocationsData);

  // If there are no locations return
  if (!locations?.length) {
    return null;
  }

  // Get items
  const items: LocationData[] = locations
    .map((locationId: string) => allLocationsData[locationId])
    .filter((location: LocationData | undefined) => !!location) as LocationData[];

  // Get the selected item 
  const selectedItem = items.find((item: LocationData) => item.id === currentLocationId);

  // Get location name
  const getLocationName = (location: LocationData) => renderItemName ? renderItemName(location.id) : location.name;

  // Return jsx component
  return (
    <SearchCallout
      items={items}
      selectedItem={selectedItem}
      target={target}
      searchOptions={{
        findAllMatches: true,
        keys: ['name'],
        getFn: (location: LocationData) => getLocationName(location)
      }}
      groupName="locations"
      directionalHint={directionalHint}
      getItemText={getLocationName}
      onItemClick={onItemClick}
      onDismiss={onDismiss}
      renderItem={(location: LocationData, defaultRender) => defaultRender({
        children: (
          <FavoriteLocationButton
            locationId={location.id}
            locationName={getLocationName(location)}
          />
        )
      })}
    />
  );
};

// Export the LocationSwitcher component
export default LocationSwitcher;
