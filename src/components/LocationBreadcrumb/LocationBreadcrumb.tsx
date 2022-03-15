// Import Dependencies
import React from 'react';
import {
    Breadcrumb,
    DirectionalHint,
    IBreadcrumbItem,
    IComponentAsProps,
    IconButton,
    IDividerAsProps,
} from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

// Import Components
import LocationSwitcher from '../LocationSwitcher/LocationSwitcher';

// Import Reducers
import {
    changeLocation,
    selectCurrentLocationData,
    selectCurrentLocationSegments,
    selectLocationsData,
} from '../../reducers/locationData';
import { fetchSidebar } from '../../reducers/sidebar';

// Import Models
import { AllLocationsData, LocationData, LocationType } from '../../models/locationsData';

// Import Services
import { mapService } from '../../services/mapService';

// Import Styles
import './LocationBreadcrumb.scss';

// global vars
let isMounted: boolean = false;
let previousLocation: LocationData | undefined = undefined;


const LocationBreadcrumb: React.FC = () => {

    // Initialise Constants
    const dispatch = useDispatch();
    const history = useHistory();
    const currentLocation: LocationData | undefined = useSelector(selectCurrentLocationData);
    const currentLocationSegments = useSelector(selectCurrentLocationSegments);
    const allLocationsData: AllLocationsData = useSelector(selectLocationsData);
    const nextLocationKey: string = 'next-level';
    const currentLocationId: string = currentLocation?.id ?? '';
    
    // Local State
    const [locationSwitcherTarget, setLocationSwitcherTarget] = React.useState<string | Element | null>(null);
    const [clickedLocationId, setClickedLocationId] = React.useState('');

    React.useEffect(() => {
        // Return if component is rendered for the first time and change isMounted to true
        if (!isMounted && currentLocation) {
            isMounted = true;
            return;
        }

        // If there is no location change, return
        if (previousLocation === currentLocation) {
            return;
        }

        // If there are no items in the current location
        if (!currentLocation?.items?.length) {

            if (
                currentLocation
                && currentLocation?.type === LocationType.Floor
                && allLocationsData[clickedLocationId]?.type === LocationType.Building
            ) {
                // Change the Local State
                setLocationSwitcherTarget(`[id='${currentLocationId}']`);
                setClickedLocationId(currentLocation.id);
            } else {
                // Change the Local State
                setLocationSwitcherTarget(null);
            }
        } else {
            // Change the local State
            setLocationSwitcherTarget(`[id='${nextLocationKey}']`);
            setClickedLocationId(nextLocationKey);
        }

        // changes the previousLocation to the currentLocation
        return () => {
            previousLocation = currentLocation;
        }
    }, [currentLocation, allLocationsData, clickedLocationId, currentLocationId]);

    // If there is no current Location or current Location id return an empty div
    if (!currentLocation || !currentLocationId) {
        return (
            <div className="location-breadcrumb-container"></div>
        );
    }

    // Returns true if the provided locationId is the same with the currentLoctionId
    const isCurrentLocation = (locationId: string) => locationId === currentLocationId;

    // On item click change the currentLocation to the new location and move the map to the new location
    const onItemClick = (
        event?: React.MouseEvent<HTMLElement, MouseEvent>,
        item?: IBreadcrumbItem
    ) => {
        // If there is no item or no event.currentTarget return
        if (!item || !event?.currentTarget) {
            return;
        }

        // Get the item ket clicked
        const newClickedLocationId: string = item.key;
        // get the newLocation ( based on the clicked item )
        const newLocation = allLocationsData[newClickedLocationId];

        // If there is no newLocation, return 
        if (!newLocation) {
            return;
        }

        // if the current location is the newnewClickedLocationId
        if (isCurrentLocation(newClickedLocationId)) {

            // Move map to the new location
            mapService.flyTo(newLocation);

            // Change state
            setLocationSwitcherTarget(event.currentTarget as Element);

            // Get the sidebr for the new location
            dispatch(fetchSidebar(newLocation));
        } else {
            // Change the location to the new location
            dispatch(changeLocation(newClickedLocationId, history));
        }

        // Change State
        setClickedLocationId(newClickedLocationId);
    }

    // When click on the divider change the state ( locationSwitcherTarget , clickedLocationId )
    const onDividerClick = (event?: React.MouseEvent<any>) => {
        if (!event?.currentTarget) {
            return;
        }

        // Get the currentTarget id
        const clickedLocationId: string = event.currentTarget.id;

        // Change States
        setLocationSwitcherTarget(`.divider[id='${clickedLocationId}']`);
        setClickedLocationId(clickedLocationId);
    }


    const onLocationSwitcherItemClick = (location: LocationData, breadcrumbItems: IBreadcrumbItem[]) => {
        // If there is no location return
        if (!location) {
            return;
        }

        // If the current location is the location provided
        if (isCurrentLocation(location.id)) {
            // If there are no items in the location 
            if (!location.items?.length) {
                // Change the State locationSwitcherTarget to null
                setLocationSwitcherTarget(null);
            } else {
                // Otherwise change it to the next values
                setLocationSwitcherTarget(`[id='${nextLocationKey}']`);
                setClickedLocationId(nextLocationKey);
            }

            return;
        } else if (
            location.type === LocationType.Building
            && location.id === clickedLocationId
            && location.items?.length
        ) {
            const clickedItemIndex: number = breadcrumbItems.findIndex(
                (item: IBreadcrumbItem) => item.key === location.id
            );
            const nextItem = breadcrumbItems[clickedItemIndex + 1];
            const nextLocationId: string = nextItem.key;

            setLocationSwitcherTarget(`[id='${nextLocationId}']`);
            setClickedLocationId(nextLocationId);
            return;
        }

        // Change the state and change the location in the store
        setClickedLocationId(location.id);
        dispatch(changeLocation(location.id, history));
    };


    const render = () => {
        // Create an object with the next values foreach currentLocationSegments and push them to an array
        const breadcrumbItems: IBreadcrumbItem[] = currentLocationSegments.map((location, idx) => ({
            text: location.name,
            key: location.id,
            isCurrentItem: idx === currentLocationSegments.length - 1,
            onClick: onItemClick,
        }));

        // Check if this is the final level ( there are no sub items )
        let isFinalLevel: boolean = !currentLocation.items?.length;

        // If there are more levels push the next location key to the breadcrumbItems
        if (!isFinalLevel) {
            breadcrumbItems.push({
                text: '',
                key: nextLocationKey,
            });
        }

        // Initialise clickedLocationParentId variable
        let clickedLocationParentId: string = '';

        
        if (clickedLocationId) {
            if (clickedLocationId === nextLocationKey) {
                clickedLocationParentId = currentLocationId;
            } else {
                clickedLocationParentId = allLocationsData[clickedLocationId]?.parent?.id ?? '';
            }
        }

        return (
            <div className="location-breadcrumb-container">
                <Breadcrumb
                    items={breadcrumbItems}
                    maxDisplayedItems={isFinalLevel ? 3 : 4}
                    ariaLabel="Breadcrumb with locations"
                    overflowAriaLabel="More locations"
                    styles={{
                        root: 'location-breadcrumb',
                        itemLink: 'item-button',
                        listItem: `list-item ${isFinalLevel ? 'final-level' : ''}`,
                        overflowButton: 'overflow-button'
                    }}
                    dividerAs={(props: React.PropsWithChildren<IComponentAsProps<IDividerAsProps>>) => {
                        if (!props.item) {
                            return null;
                        }

                        const nextItem = breadcrumbItems[breadcrumbItems.indexOf(props.item) + 1];

                        if (!nextItem) {
                            return null;
                        }

                        return (
                            <IconButton
                                id={nextItem.key}
                                iconProps={{
                                    iconName: 'ChevronRight',
                                }}
                                styles={{
                                    root: 'divider',
                                    icon: 'divider-icon'
                                }}
                                onClick={onDividerClick}
                                contentEditable={false}
                                ariaLabel="Next location"
                            />
                        );
                    }}
                />

                {!!locationSwitcherTarget && !!clickedLocationId && !!clickedLocationParentId && (
                    <LocationSwitcher
                        target={locationSwitcherTarget}
                        currentLocationId={clickedLocationId}
                        locations={allLocationsData[clickedLocationParentId]?.items ?? []}
                        directionalHint={DirectionalHint.bottomLeftEdge}
                        onDismiss={() => setLocationSwitcherTarget(null)}
                        onItemClick={(location: LocationData) => onLocationSwitcherItemClick(location, breadcrumbItems)}
                    />
                )}
            </div>
        );
    }

    return render();
};

// Export LocationBreadcrumb Component
export default LocationBreadcrumb;