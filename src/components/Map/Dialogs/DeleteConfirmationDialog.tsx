// Import Dependencies
import React from 'react';
import { DefaultButton, getTheme, mergeStyleSets, PrimaryButton } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

// Import Components
import { Dialog } from '../Dialog';

// Import Models
import { DialogData, DialogType } from '../../../models/dialogData';


// Import Reducers
import { hideDialog, selectDeleteConfirmationData } from '../../../reducers/dialog';
import { assetDataUrl } from '../../../config';
import { deleteAsset, selectAssetData } from '../../../reducers/assetData';
import { mapService } from '../../../services/mapService';

// Styles
const theme = getTheme();
const styles = mergeStyleSets({
    bodyContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    deleteButton: {
        backgroundColor: theme.palette.red,
        color: theme.palette.white,
        marginBottom: "10px",
        border: 'none',
        selectors: {
            ':hover': {
                backgroundColor: theme.palette.redDark
            }
        }
    }
});


const deleteAssetReq = async (assetId: number | undefined) => {
    try {
        const response: Response = await fetch(`${assetDataUrl}/${assetId}`, {
            method: 'DELETE'
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
        console.error("Failed to delete the asset");
        return {};
    }
}

// Export DeleteConfirmation Dialog
export const DeleteConfirmationDialog = () => {

    const data: DialogData = useSelector(selectDeleteConfirmationData);
    const assetData: any = useSelector(selectAssetData);
    const dispatch = useDispatch();

    return (
        <Dialog
            title="Delete Asset"
            body={
                <>
                    <p>Are you sure you want to delete this asset?</p>
                    <div className={styles.bodyContainer}>
                        <DefaultButton text="Don't Delete" onClick={() => { console.log('clicked') }} allowDisabledFocus />
                        <PrimaryButton
                            text="Delete Asset"
                            className={styles.deleteButton}
                            onClick={() => {

                                if (data.assetType){
                                    console.log(assetData, assetData[data.assetType])
                                    let newState = assetData[data.assetType].filter((asset:any) => asset.assetId !== data.assetId)
                                    console.log(newState)

                                    dispatch(deleteAsset({ type: data.assetType, newState }))

                                    deleteAssetReq(data.assetId)

                                    dispatch(hideDialog(DialogType.DeleteConfirmation));

                                    console.log({...assetData, [data.assetType]:[...assetData[data.assetType], ...newState]})
                                    
                                    let parsableState = JSON.parse(JSON.stringify(assetData));

                                    parsableState[data.assetType] = [...newState]

                                    let updatedState:any = []

                                    for (let i in parsableState) {
                                        parsableState[i].forEach((s:any) => {
                                            updatedState.push(s)
                                        })
                                    }

                                    console.log(updatedState)
                                    
                                    mapService.updateAssetsData([...updatedState]);
                                }
                            }}
                            allowDisabledFocus />
                    </div>
                </>
            }
            isOpen={data.isVisible}
            styles={
                mergeStyleSets({
                    main: {
                        width: '400px',
                        'selectors': {
                            '.title': {
                                color: 'red'
                            }
                        }
                    }
                })
            }
            onDismiss={() => {
                dispatch(hideDialog(DialogType.DeleteConfirmation));
            }}
        />
    );
}
