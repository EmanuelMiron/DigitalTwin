// Import Dependencies
import React from 'react';
import { DefaultButton, getTheme, mergeStyleSets } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

// Import Components
import { Dialog } from '../Dialog';

// Import Models
import { DialogType } from '../../../models/dialogData';

// Import Reducers
import { hideDialog, selectEditAssetData, selectEditAssetPosition } from '../../../reducers/dialog';
import { mapService } from '../../../services/mapService';
import { selectAssetData, updateAsset } from '../../../reducers/assetData';
import { assetDataUrl } from '../../../config';

// Styles
const theme = getTheme();
const styles = mergeStyleSets({
    bodyContainer: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '15px'
    },
    editButton: {
        backgroundColor: theme.palette.green,
        color: theme.palette.white,
        border: 'none',
        selectors: {
            ':hover': {
                backgroundColor: theme.palette.greenDark,
                color: theme.palette.white,
            }
        },
        marginLeft: '1px',
        alignSelf: 'flex-end'
    },
    input: {
        width: '90%',
        margin: '0 auto'
    },
    deleteButton: {
        backgroundColor: theme.palette.red,
        color: theme.palette.white,
        border: 'none',
        selectors: {
            ':hover': {
                backgroundColor: theme.palette.redDark,
                color: theme.palette.white,
            }
        },
        marginLeft: '1px',
        alignSelf: 'flex-end'
    }
});

// Export DeleteConfirmation Dialog
export const EditAssetPositionDialog = () => {

    const data: any = useSelector(selectEditAssetPosition);
    const editData: any = useSelector(selectEditAssetData);
    const assetData = useSelector(selectAssetData);

    const dispatch = useDispatch();

    const updateAssetReq = async (assetProps: any) => {
        try {
            const response: Response = await fetch(`${assetDataUrl}/${editData.assetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assetProps)
            });

            // If the response is ok, returns the json obj, if it is empty return an empty obj.
            if (response.ok) {
                const json = await response.json();
                return json ?? {};
            } else {
                throw new Error();
            }
        } catch {
            // If there is a problem, return to the console the following error
            console.error("Failed to update the asset");
            return {};
        }
    }

    return (
        <Dialog
            title="Edit Position"
            isModeless={true}
            draggable={true}
            body={
                <>
                    <div className={styles.bodyContainer}>
                        <DefaultButton
                            text='Save Position'
                            className={styles.editButton}
                            onClick={async () => {

                                // Change the new position in the state
                                let newAssetData = JSON.parse(JSON.stringify(assetData))

                                let currentAsset = newAssetData[editData.assetType].filter((asset: any) => asset.assetId === editData.assetId)[0]
                                let otherAssets = newAssetData[editData.assetType].filter((asset: any) => asset.assetId !== editData.assetId)

                                currentAsset.position = {
                                    "longitude": data.newCoords[0],
                                    "latitude": data.newCoords[1]
                                };

                                currentAsset.draggable = "false";

                                dispatch(updateAsset({
                                    type: editData.assetType,
                                    updatedAsset: [currentAsset, ...otherAssets]
                                }
                                ))

                                dispatch(hideDialog(DialogType.EditAssetPosition));

                                //  === Update Asset on the map ===

                                // Get the modified state

                                newAssetData = {
                                    ...newAssetData,
                                    [editData.assetType]: [currentAsset, ...otherAssets]
                                }

                                // Format state for mapService

                                let updatedState: any = []

                                for (let i in newAssetData) {
                                    newAssetData[i].forEach((s: any) => {
                                        updatedState.push(s)
                                    })
                                }

                                // Update Assets
                                mapService.updateAssetsData(updatedState);

                                //  === Update Asset in DB ===

                                // Format data for the request
                                let updateAssetProps:any = {
                                    'properties': [
                                        {
                                            "Key": "longitude",
                                            "Value": data.newCoords[0]
                                        },
                                        {
                                            "Key": "latitude",
                                            "Value": data.newCoords[1]
                                        }
                                    ]
                                }

                                // Create a request to update the data
                                await updateAssetReq(updateAssetProps);

                            }} allowDisabledFocus
                        />
                        <DefaultButton
                            text='Discard'
                            className={styles.deleteButton}
                            onClick={() => { 

                                // Change the new position in the state
                                let newAssetData = JSON.parse(JSON.stringify(assetData))

                                let currentAsset = newAssetData[editData.assetType].filter((asset: any) => asset.assetId === editData.assetId)[0]
                                let otherAssets = newAssetData[editData.assetType].filter((asset: any) => asset.assetId !== editData.assetId)

                                //  === Update Asset on the map ===

                                // Get the modified state
                                
                                currentAsset.position = {
                                    "longitude": data.coords[0],
                                    "latitude": data.coords[1]
                                };

                                currentAsset.draggable = "false";

                                

                                newAssetData = {
                                    ...newAssetData,
                                    [editData.assetType]: [currentAsset, ...otherAssets]
                                }

                                dispatch(updateAsset({
                                    type: editData.assetType,
                                    updatedAsset: [currentAsset, ...otherAssets]
                                }
                                ))

                                dispatch(hideDialog(DialogType.EditAssetPosition));


                                // Format state for mapService

                                let updatedState: any = []

                                for (let i in newAssetData) {
                                    newAssetData[i].forEach((s: any) => {
                                        updatedState.push(s)
                                    })
                                }

                                // Update Assets
                                mapService.updateAssetsData(updatedState);

                            }} allowDisabledFocus
                        />
                    </div>
                </>
            }
            isOpen={data.isVisible}
            // isOpen={true}
            styles={
                mergeStyleSets({
                    main: {
                        position: 'absolute',
                        top: '100px',
                        left: '100px'
                    }
                })
            }
            onDismiss={() => {
                dispatch(hideDialog(DialogType.EditAssetPosition));
            }}
        />
    );
}
