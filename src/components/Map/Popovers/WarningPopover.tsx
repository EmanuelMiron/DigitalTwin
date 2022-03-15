// Import Dependencies
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Text, getTheme, mergeStyleSets, FontWeights } from '@fluentui/react';

// Import Components
import Popover from '../Popover';

// Import Models
import { LocationData } from '../../../models/locationsData';
import { PopoverData, PopoverType } from '../../../models/popoversData';

// Import Reducers
import { selectCurrentLocationData } from '../../../reducers/locationData';
import { hidePopover, selectWarningPopoverData } from '../../../reducers/popover';


// Styles
const theme = getTheme();
const styles = mergeStyleSets({
  subtext: [
    theme.fonts.small,
    {
      margin: 0,
      fontWeight: FontWeights.semilight,
    },
  ],
  inner: {
    height: '100%',
    padding: '0 24px 20px',
  }
});


// Export Warning Popover
export const WarningPopover = () => {
  const currentLocation: LocationData | undefined= useSelector(selectCurrentLocationData);
  const data: PopoverData = useSelector(selectWarningPopoverData);
  const dispatch = useDispatch();

  if (!currentLocation || !data.isVisible || !data.target) {
    return null;
  }

  return (
    <Popover
      title={data.assetType ?? ''}
      body={
        <div className={styles.inner}>
          <Text className={styles.subtext}>
            <strong>
              {currentLocation.name}
            </strong>
          </Text>
        </div>
      }
      target={data.target}
      onDismiss={() => {
        dispatch(hidePopover(PopoverType.Warning));
      }}
    />
  );
}