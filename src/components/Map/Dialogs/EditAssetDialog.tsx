// Import Dependencies
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import Components
import { Dialog } from '../Dialog';

// Import Models
import { DialogType } from '../../../models/dialogData';

// Import Reducers
import { hideDialog, selectEditAssetData, showDialog } from '../../../reducers/dialog';
import { addDays, DatePicker, defaultDatePickerStrings, getTheme, mergeStyleSets, PrimaryButton, TextField } from '@fluentui/react';


import { fetchAssetTypeProps, selectAssetTypesData } from '../../../reducers/assetTypesData';
import { assetDataUrl } from '../../../config';
import { selectAssetData, selectAssetDataForEdit, updateAsset } from '../../../reducers/assetData';
import { formatDateToString } from './CreateAssetDialog';
import { mapService } from '../../../services/mapService';

// Import Config

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
    editButton: {
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
        marginLeft: '20px',
        alignSelf: 'flex-end'
    },
    input: {
        width: '90%',
        margin: '0 auto'
    }
});

export const formatStringToDate = (string?: any) => {

    if(typeof(string) === 'object') return string;

    let splittedDate:any = string?.split('/');
    
    return !string ? new Date() : new Date(Number(splittedDate[2]), Number(splittedDate[1]) - 1, Number(splittedDate[0]))
};

// Export EditAssetDialog
export const EditAssetDialog = () => {

    const [assetProps, setAssetProps] = React.useState<any>([]);


    const data: any = useSelector(selectEditAssetData);
    const assetData = useSelector(selectAssetData);
    const assetTypesData: any = useSelector(selectAssetTypesData);
    const assetDataProps: any = useSelector(selectAssetDataForEdit);
    const dispatch = useDispatch();

    const today = new Date(Date.now());

    const getAssetTypeIdByAssetTypeName = () => {
        let assetTypeData = assetTypesData.filter((assetType:any) => assetType.text === data.assetType)
        return assetTypeData[0]?.key
    }
    

    const fetchData = async () => {
        let assetId = getAssetTypeIdByAssetTypeName()
        if(assetId !== undefined) {
            let props =  await fetchAssetTypeProps(assetId)
            return props
        }
    }

    const getProps = async () => {

        if(data.assetType === undefined) return

        let defaultProps = await fetchData()

        
        let actualProps = assetDataProps[data.assetType].filter((a:any) => a.assetId === data.assetId)[0]

        

        let formattedDefaultProps:any = []
        defaultProps.forEach((prop:any) => {
            let newProp;

            if(!actualProps.hasOwnProperty(prop.label)){
                newProp = {
                    label : prop.label,
                    placeholder : prop.placeholder,
                    type : prop.form_type
                }
            }else {
                newProp = {
                    label: prop.label,
                    value: actualProps[prop.label],
                    placeholder: prop.placeholder,
                    type: prop.form_type
                }
            }

            formattedDefaultProps.push(newProp)
        });

        return formattedDefaultProps
    }

    const onChangeAssetProp = (newValue: any, assetLabel: any,type:String) => {

        let assetProps2 = JSON.parse(JSON.stringify(assetProps))
        
        assetProps2.forEach((asset:any, idx: number) => {
            if(asset.label === assetLabel){
                assetProps2[idx].value = newValue
                assetProps2[idx].type = type
            }

            if(asset.label === assetLabel && type === 'Date'){
                assetProps2[idx].value = formatDateToString(newValue)
            }
        })
        setAssetProps([
            ...assetProps2
        ]);

    }

    
    useEffect(() => {
        const h = async () => {
            let m = await getProps()    
            setAssetProps(m)
        }

        h()
        
    },[])


    const updateAssetReq = async (assetProps: any) => {
        try {
            const response: Response = await fetch(`${assetDataUrl}/${data.assetId}`, {
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
            title={`Edit Asset - ${data.assetType} #${data.assetId}`}
            body={
                <>
                    <div className={styles.bodyContainer}>
                        {assetProps && assetProps.map((assetProp: any, idx:number) => {
                            switch (assetProp?.type) {
                                case 'Text':
                                    return <TextField
                                        key={idx}
                                        label={assetProp.label}
                                        placeholder={assetProp.placeholder}
                                        value={assetProp.value}
                                        onChange={(e:any) => {
                                            onChangeAssetProp(e.currentTarget.value, assetProp.label, 'Text')
                                        }}
                                        className={styles.input} 
                                    />
                                case 'Date':

                                    if(data.assetType === 'Stand-Up Desk' ){
                                        return <DatePicker
                                                key={idx}
                                                showWeekNumbers={true}
                                                firstWeekOfYear={1}
                                                label={assetProp.label}
                                                value={formatStringToDate(assetProp.value)}
                                                showMonthPickerAsOverlay={true}
                                                placeholder={assetProp.placeholder}
                                                strings={defaultDatePickerStrings}
                                                className={styles.input}
                                                minDate={today}
                                                maxDate={addDays(today, 5)}
                                                onSelectDate={(date: any) => { date !== null && onChangeAssetProp(date, assetProp.label, 'Date') }}
                                            />
                                    }else {
                                        return <DatePicker
                                            key={idx}
                                            showWeekNumbers={true}
                                            firstWeekOfYear={1}
                                            label={assetProp.label}
                                            value={formatStringToDate(assetProp.value)}
                                            showMonthPickerAsOverlay={true}
                                            placeholder={assetProp.placeholder}
                                            strings={defaultDatePickerStrings}
                                            className={styles.input}
                                            onSelectDate={(date: any) => { date !== null && onChangeAssetProp(date, assetProp.label, 'Date') }}
                                        />
                                    }
                            }
                            return undefined;
                        })}
                        <PrimaryButton
                            text="Edit Asset Position"
                            className={styles.editButton}
                            onClick={async ()=>{
                                // dispatch(showPopover({
                                //     type: PopoverType.Menu,
                                //     isVisible: true,
                                //     target: { x: 0, y: 0 },
                                //     assetId: 0,
                                // }))

                                dispatch(hideDialog(DialogType.EditAsset));

                                dispatch(showDialog({
                                    type: DialogType.EditAssetPosition,
                                    coords: data.coords,
                                    isVisible: true
                                }));

                                // let updatedAsset = JSON.parse(JSON.stringify(assetData[data.assetType].filter((i:any) => i.assetId == data.assetId)[0]));
                                // updatedAsset.draggable = true;

                                let newAssetData = JSON.parse(JSON.stringify(assetData))

                                let currentAsset = newAssetData[data.assetType].filter((asset:any) => asset.assetId === data.assetId)[0]
                                let otherAssets = newAssetData[data.assetType].filter((asset:any) => asset.assetId !== data.assetId)

                                currentAsset.draggable = true;

                                dispatch(updateAsset({
                                    type: data.assetType,
                                    updatedAsset: [currentAsset, ...otherAssets]
                                    }
                                ))

                                //  === Update Asset on the map ===

                                    // Get the modified state

                                    newAssetData = {
                                        ...newAssetData,
                                        [data.assetType]: [currentAsset, ...otherAssets]
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


                                // console.log(data, assetDataProps);
                                // console.log(assetData,updatedAsset)

                            }}
                            allowDisabledFocus />
                        <PrimaryButton
                            text="Update"
                            className={styles.editButton}
                            onClick={async ()=>{
                                console.log(assetProps)

                                //  === Update Asset in DB ===

                                // Format data for the request
                                let updateAssetProps:any = {
                                    'properties': []
                                }

                                // Go through assetProps and format the data
                                assetProps && assetProps.map((assetProp:any) => {

                                    let Key = assetProp.label || ' '
                                    let Value = assetProp.value || ' '


                                    updateAssetProps.properties.push({
                                        Key,
                                        Value
                                    })

                                    return undefined;
                                })

                                // Create a request to update the data
                                await updateAssetReq(updateAssetProps);

                                //  === Change the state ===

                                // Create a copy of the current state
                                let newAssetData = JSON.parse(JSON.stringify(assetData))

                                // find the current asset
                                let currentAsset = newAssetData[data.assetType].filter((asset:any) => asset.assetId === data.assetId)[0]
                                let otherAssets = newAssetData[data.assetType].filter((asset:any) => asset.assetId !== data.assetId)
                                
                                // Update Asset
                                assetProps && assetProps.map((assetProp:any) => {
                                    // if(currentAsset.hasOwnProperty(assetProp.label)){
                                    // }else
                                    currentAsset[assetProp.label] = assetProp.value;

                                    return undefined;
                                })
                            
                                dispatch(updateAsset({
                                    type: data.assetType,
                                    updatedAsset: [currentAsset, ...otherAssets]
                                    }
                                ))

                                //  === Update Asset on the map ===

                                // Get the modified state
                                
                                newAssetData = {
                                    ...newAssetData,
                                    [data.assetType] : [currentAsset, ...otherAssets]
                                }

                                // Format state for mapService

                                let updatedState:any = []

                                for (let i in newAssetData) {
                                    newAssetData[i].forEach((s:any) => {
                                        updatedState.push(s)
                                    })
                                }

                                // Update Assets
                                mapService.updateAssetsData(updatedState);

                                //  === Reset the state ===
                                setAssetProps([])

                                //  === Hide the dialog ===
                                dispatch(hideDialog(DialogType.EditAsset));
                            }}
                            allowDisabledFocus />
                        
                    </div>
                </>
            }
            // isOpen={true}
            isOpen={data.isVisible}
            styles={
                mergeStyleSets({
                    main: {
                        width: '550px',
                    }
                })
            }
            onDismiss={() => {
                //  === Hide the dialog ===
                dispatch(hideDialog(DialogType.EditAsset));

                //  === Reset the state ===
                setAssetProps([])
            }}
        />
    );
}

