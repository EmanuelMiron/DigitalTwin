// Import Dependencies
import React, { useEffect, useState } from 'react';
import { DetailsList, DetailsListLayoutMode, getTheme, mergeStyleSets, PrimaryButton } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentLocation } from '../../reducers/locationData';
import { selectUser } from '../../reducers/user';
import { UserDataUrl } from '../../config';


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

const columns: any = [
    { key: 'column1', name: 'Desk Name', fieldName: 'desk_name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column2', name: 'Date', fieldName: 'booked_date', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Cancel Booking', fieldName: 'cancelButton', minWidth: 200, maxWidth: 400, isResizable: true },
]

// Fetches bookings
const fetchBookings = async (user:any) => {
    try {
        const response: Response = await fetch(`${UserDataUrl}/booking/${user.userID}`);

        // If the response is ok, returns the json obj, if it is empty return an empty obj.
        if (response.ok) {
            const json = await response.json();
            return json ?? [];
        } else {
            throw new Error();
        }
    } catch {
        // If there is a problem, return to the console the following error
        console.error("Failed to fetch bookings");
        return {};
    }
}





// Export DeleteConfirmation Dialog
export const Dashboard = () => {

    const dispatch = useDispatch();
    const [bookings, setBookings] = useState([]);
    
    // Get State
    const currentLocation: any = useSelector(selectCurrentLocation);
    const user:any = useSelector(selectUser);

    const getBookings = async (user:any) => {
        const data = await fetchBookings(user);
        console.log(data);
        setBookings(data)
    }


    useEffect(() => {
        getBookings(user)
    }, [user])

    let currentArea = currentLocation.path.split("/")[currentLocation.path.split("/").length - 1]

    return (
        <div className={styles.bodyContainer}>
            <h1>Your Bookings {currentArea}</h1>

            {/* Table with || Desk Name || Date || Cancel Button  */}

            <DetailsList
                items={bookings}
                columns={columns}
                layoutMode={DetailsListLayoutMode.justified}
                checkButtonAriaLabel="select row"
                onRenderItemColumn={(item: any, index: any, column: any): JSX.Element => {
                    if (column.fieldName === 'cancelButton') {
                        return (
                            <PrimaryButton
                            text="Cancel Booking"
                            className={styles.deleteButton}
                            onClick={() => {console.log(item)}}
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
