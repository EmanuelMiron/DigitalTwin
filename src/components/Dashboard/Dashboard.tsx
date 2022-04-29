// Import Dependencies
import React from 'react';
import { DetailsList, DetailsListLayoutMode, getTheme, mergeStyleSets, PrimaryButton } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentLocation } from '../../reducers/locationData';


// Styles
const theme = getTheme();
const styles = mergeStyleSets({
    bodyContainer: {
        padding: "20px"
    },
    deleteButton: {
        backgroundColor: theme.palette.red,
        color: theme.palette.white,
        marginBottom: "10px",
        border: 'none',
        selectors: {
            ':hover': {
                backgroundColor: theme.palette.redDark,
                border: "none"
            }
        }
    }
});

const items:any = [
    {
        deskName: "1",
        date: "12 APR",
        cancelButton: "Something"
    },
    {
        deskName: "67",
        date: "13 APR",
        cancelButton: "Something"
    }
]

const columns: any = [
    { key: 'column1', name: 'Desk Name', fieldName: 'deskName', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column2', name: 'Date', fieldName: 'date', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Cancel Booking', fieldName: 'cancelButton', minWidth: 200, maxWidth: 400, isResizable: true },
]



// Export DeleteConfirmation Dialog
export const Dashboard = () => {

    const dispatch = useDispatch();
    const currentLocation: any = useSelector(selectCurrentLocation);

    let currentArea = currentLocation.path.split("/")[currentLocation.path.split("/").length - 1]

    return (
        <div className={styles.bodyContainer}>
            <h1>Your Bookings {currentArea}</h1>

            {/* Table with || Desk Name || Date || Cancel Button  */}

            <DetailsList
                items={items}
                columns={columns}
                layoutMode={DetailsListLayoutMode.justified}
                checkButtonAriaLabel="select row"
                onRenderItemColumn={(item: any, index: any, column: any): JSX.Element => {
                    if (column.fieldName === 'cancelButton') {
                        return (
                            <PrimaryButton
                            text="Cancel Booking"
                            className={styles.deleteButton}
                            onClick={() => {console.log(item, index, column)}}
                            allowDisabledFocus />
                        )
                    }
                    return item[column.fieldName];
                }}
                checkboxVisibility={2}
            />
        </div>
    );
}
