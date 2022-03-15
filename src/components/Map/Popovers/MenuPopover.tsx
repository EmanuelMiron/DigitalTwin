// Import Dependencies
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { getTheme, mergeStyleSets, FontWeights } from '@fluentui/react';

// Import Components
import Popover from '../Popover';

// Import Models
import { LocationData } from '../../../models/locationsData';
import { PopoverData, PopoverType } from '../../../models/popoversData';

// Import Reducers
import { selectCurrentLocationData } from '../../../reducers/locationData';
import { hidePopover, selectMenuPopoverData } from '../../../reducers/popover';
import { showDialog } from '../../../reducers/dialog';
import { DialogType } from '../../../models/dialogData';
import { selectUserName } from '../../../reducers/user';

// Styles
const theme = getTheme();
const styles = mergeStyleSets({
  menuButton: [
    theme.fonts.medium,
    {
      width: '100%',
      fontWeight: FontWeights.regular,
    },
  ],
});

// Export MenuPopover
export const MenuPopover = () => {
  const currentLocation: LocationData | undefined = useSelector(selectCurrentLocationData);
  const data: PopoverData = useSelector(selectMenuPopoverData);
  const userName: any = useSelector(selectUserName);
  const dispatch = useDispatch();

  if (!currentLocation || !data.isVisible || !data.target) {
    return null;
  }

  return (
    <Popover
      title=''
      body={
        data.onAsset ? (
          <>
            {data.assetType === 'Stand-Up Desk' && (

              <DefaultButton
                className={styles.menuButton}
                onClick={() => {
                  dispatch(showDialog({
                    type: DialogType.BookDesk,
                    isVisible: true,
                    assetId: data.assetId,
                    assetType: data.assetType,
                    "Desk Name": data.deskName
                  }))
                }}
              >
                Book
              </DefaultButton>
            )}
            {userName === 'admin' && (
              <>
                <DefaultButton
                  className={styles.menuButton}
                  onClick={() => {
                    dispatch(showDialog({
                      type: DialogType.EditAsset,
                      isVisible: true,
                      assetId: data.assetId,
                      assetType: data.assetType,
                      coords: data.coords
                    }))
                  }}
                >
                  Edit Asset
                </DefaultButton>
                <DefaultButton
                  className={styles.menuButton}
                  onClick={() => {
                    dispatch(showDialog({
                      type: DialogType.DeleteConfirmation,
                      isVisible: true,
                      assetId: data.assetId,
                      assetType: data.assetType
                    }))
                  }}>
                  Delete Asset
                </DefaultButton>
              </>
            )}
          </>
        ) : (
          <DefaultButton
            className={styles.menuButton}
            onClick={() => {
              // Get coords from data.coords
              dispatch(showDialog({
                type: DialogType.CreateAsset,
                isVisible: true,
                coords: data.coords
              }))
              console.log('Create Asset!', data)
            }}
          >
            Create Asset
          </DefaultButton>
        )

      }
      target={data.target}
      onDismiss={() => {
        dispatch(hidePopover(PopoverType.Menu));
      }}
    />
  );
}