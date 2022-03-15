// Import Dependencies
import React from 'react';
import { DatePicker, defaultDatePickerStrings, Dropdown, getTheme, IDropdownOption, mergeStyleSets, PrimaryButton, TextField } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

// Import Components
import { Dialog } from '../Dialog';

// Import Models
import { DialogData, DialogType } from '../../../models/dialogData';

// Import Reducers
import { hideDialog, selectCreateAssetData } from '../../../reducers/dialog';

// Import Config
import { assetDataUrl } from '../../../config';
import { addAsset, selectAssetData } from '../../../reducers/assetData';
import { mapService } from '../../../services/mapService';
import { fetchAssetTypeProps, selectAssetTypesData } from '../../../reducers/assetTypesData';

// Styles
const theme = getTheme();
const styles = mergeStyleSets({
    bodyContainer: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    createButton: {
        backgroundColor: theme.palette.green,
        color: theme.palette.white,
        border: 'none',
        selectors: {
            ':hover': {
                backgroundColor: theme.palette.greenDark
            }
        },
        marginTop: '20px',
        marginBottom: '20px',
        alignSelf: 'flex-end'
    },
    input: {
        width: '90%',
        margin: '0 auto'
    }
});

export const formatDateToString = (date?: any): string => {
    return !date ? '' : date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getFullYear());
};

export const formatDateString = (date: string): string => {
    const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let splittedDate:string[] = date.split("/");
    splittedDate[1] = month[Number(splittedDate[1])];
    let newDate = splittedDate.join("-");
    
    return newDate;
};

// Export DeleteConfirmation Dialog
export const CreateAssetDialog = () => {
    const [newAssetProps, setNewAssetProps] = React.useState<any>({});
    const [selectedItem, setSelectedItem] = React.useState<any>();
    const [assetProps, setAssetProps] = React.useState<any>();
    const assetData: any = useSelector(selectAssetData);
    const assetTypesData: any = useSelector(selectAssetTypesData);


    const data: DialogData = useSelector(selectCreateAssetData);
    const dispatch = useDispatch();


    const onChangeNewAssetProp = (newValue: any, assetLabel: any, type:String) => {

        setNewAssetProps({
            ...newAssetProps,
            [assetLabel]: {
                'Type': type,
                'Value': newValue
            }
        });

    }

    const onChangeDropDown = async (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        setSelectedItem(option);
        let assetId = Number(option?.key)
        let data = await fetchAssetTypeProps(assetId)
        setAssetProps(data)
    }

    



    const createAssetReq = async (assetProps: any) => {
        try {
            const response: Response = await fetch(`${assetDataUrl}`, {
                method: 'POST',
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
            console.error("Failed to create the asset");
            return {};
        }
    }

    return (
        <Dialog
            title="Create Asset"
            body={
                <>
                    <div className={styles.bodyContainer}>
                        {/* <h1>{data.coords}</h1> */}
                        <Dropdown
                            label="Asset Type"
                            selectedKey={selectedItem ? selectedItem.key : undefined}
                            // eslint-disable-next-line react/jsx-no-bind
                            onChange={onChangeDropDown}
                            placeholder="Select an option"
                            options={assetTypesData}
                            className={styles.input}
                        />
                        {assetProps && assetProps.map((assetProp: any) => {

                            switch (assetProp?.form_type) {
                                case 'Text':
                                    return <TextField
                                        key={assetProp.id}
                                        label={assetProp.label}
                                        placeholder={assetProp.placeholder}
                                        value={newAssetProps[assetProp.label]?.Value}
                                        onChange={(e) => {
                                            onChangeNewAssetProp(e.currentTarget.value, assetProp.label, 'Text')
                                        }}
                                        className={styles.input}
                                    />
                                case 'Date':
                                    return <DatePicker
                                        key={assetProp.id}
                                        showWeekNumbers={true}
                                        firstWeekOfYear={1}
                                        label={assetProp.label}
                                        value={newAssetProps[assetProp.label]?.Value}
                                        showMonthPickerAsOverlay={true}
                                        placeholder={assetProp.placeholder}
                                        strings={defaultDatePickerStrings}
                                        className={styles.input}
                                        onSelectDate={(date: any) => { date !== null && onChangeNewAssetProp(date, assetProp.label, 'Date') }}
                                    />
                            }
                            return undefined;
                        })}

                        <PrimaryButton
                            text="Create"
                            className={styles.createButton}
                            onClick={async () => {
                                // data.coords
                                if (data.coords === undefined) return;

                                // create the return obj
                                let formattedAssetProps:any = {
                                    'assets': []
                                }

                                // Map over assetProps
                                assetProps && assetProps.map((assetProp:any) => {

                                    let Key = assetProp.label
                                    let Value = newAssetProps[assetProp.label]?.Value || ''

                                    if(newAssetProps[assetProp.label]?.Type === 'Date'){
                                        Value = formatDateToString(Value);
                                    }

                                    formattedAssetProps.assets.push({
                                        Key,
                                        Value
                                    })
                                    return undefined;
                                })

                                let standardProps = [];

                                standardProps.push({Key: 'longitude', Value: data.coords[0]})
                                standardProps.push({Key: 'latitude', Value: data.coords[1]})
                                standardProps.push({Key: 'assetType', Value: selectedItem?.key})
                                
                                let createAssetProps = [...formattedAssetProps.assets, ...standardProps]

                                // formattedAssetProps.assets.push(...standardProps)
                                
                                let response = await createAssetReq(createAssetProps);

                                let newFormatProps:any = {}
                                formattedAssetProps.assets.forEach((a:any) => {
                                    newFormatProps[a.Key] = a.Value
                                })

                                const newAsset = {
                                    position: {
                                        longitude: data.coords[0],
                                        latitude: data.coords[1]
                                    },
                                    ...newFormatProps,
                                    type: selectedItem?.text,
                                    assetId: response.id,
                                    iconID: selectedItem?.iconId
                                }


                                let newState = JSON.parse(JSON.stringify(assetData));

                                newState = {
                                    ...newState,
                                    [newAsset.type] : [
                                        ...newState[newAsset.type],
                                        newAsset
                                    ]
                                }

                                let updatedState:any = []

                                for (let i in newState) {
                                    newState[i].forEach((s:any) => {
                                        updatedState.push(s)
                                    })
                                }
                                
                                dispatch(addAsset({ type: newAsset.type, newAsset }))

                                dispatch(hideDialog(DialogType.CreateAsset));

                                // Reset The state after Asset Creation
                                setNewAssetProps({})
                                setSelectedItem(undefined)

                                console.log(updatedState)
                                mapService.updateAssetsData(updatedState);

                            }
                            }
                            allowDisabledFocus />
                    </div>
                </>
            }
            isOpen={data.isVisible}
            // isOpen={true}
            styles={
                mergeStyleSets({
                    main: {
                        width: '550px',
                    }
                })
            }
            onDismiss={() => {
                dispatch(hideDialog(DialogType.CreateAsset));
            }}
        />
    );
}
