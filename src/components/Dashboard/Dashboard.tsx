// Import Dependencies
import React, { useEffect, useState } from 'react';
import { DetailsList, DetailsListLayoutMode, defaultDatePickerStrings, getTheme, mergeStyleSets, PrimaryButton, DatePicker, addDays, TextField, ScrollablePane } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentLocation } from '../../reducers/locationData';
import { selectUser } from '../../reducers/user';
import { assetDataUrl, deskBookingUrl, UserDataUrl } from '../../config';
import { sendWebSocketMessage } from '../../helpers/websocket';
import { selectBookDesk } from '../../reducers/dialog';
import { selectAssetData } from '../../reducers/assetData';
import { formatDateString, formatDateToString } from '../Map/Dialogs/CreateAssetDialog';


// Styles
const theme = getTheme();
const styles = mergeStyleSets({
    yourBookings: {
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
        marginLeft: '20px',
        alignSelf: 'flex-end',
        marginBottom: '5px'
    },
    dateInput: {
        width: '250px'
    },
    container: {
        display: 'flex',
        width: '100%'
    },
    officeBookings: {
        padding: "20px",
        marginLeft: '50px'
    },
    selectDate: {
        display: 'flex'
    },
    wrapper: {
        height: '70vh',
        width: '50vw',
        position: 'relative',
        maxHeight: 'inherit',
    },
});

const columns: any = [
    { key: 'column1', name: 'Desk Name', fieldName: 'desk_name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column2', name: 'Date', fieldName: 'booked_date', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Cancel Booking', fieldName: 'cancelButton', minWidth: 200, maxWidth: 400, isResizable: true },
]

const officeColumns: any = [
    { key: 'column1', name: 'Desk Name', fieldName: 'desk_name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column2', name: 'Date', fieldName: 'booked_date', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Username', fieldName: 'user_id', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column4', name: 'Cancel Booking', fieldName: 'cancelButton', minWidth: 200, maxWidth: 400, isResizable: true },
]


// Fetches bookings
const fetchBookings = async (user: any, area: any) => {
    try {
        const response: Response = await fetch(`${UserDataUrl}/booking/${user.userID}`, {
            headers: {
                'Content-Type': 'application/json',
                'area': area
            }
        })

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


const deleteReservation = async (bookingID: any) => {

    try {
        const response: Response = await fetch(`${assetDataUrl}/${bookingID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            const json = await response.json();
            return response.status;
        } else {
            throw new Error();
        }
    } catch {
        console.error("Failed to delete booking");
        return {};
    }
}

const fetchOfficeBookings = async (date: any, area: any) => {
    try {
        const response: Response = await fetch(`${deskBookingUrl}/admin/${area}`, {
            headers: {
                'Content-Type': 'application/json',
                'data': date
            }
        })

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

    const today = new Date(Date.now());

    const dispatch = useDispatch();
    const [bookings, setBookings] = useState([]);
    const [officeBookings, setOfficeBookings] = useState([]);
    const [sortedOfficeBookings, setSortedOfficeBookings] = useState([]);
    const [bookingDate, setBookingDate] = useState<any>(formatDateToString(today));

    // Get State
    const currentLocation: any = useSelector(selectCurrentLocation);
    const user: any = useSelector(selectUser);
    const assetData = useSelector(selectAssetData);

    let currentArea = currentLocation.path.split("/")[currentLocation.path.split("/").length - 1]

    const getBookings = async (user: any) => {
        const data = await fetchBookings(user, currentArea);
        setBookings(data)
    }

    const getOfficeBookings = async (date: any) => {
        const data = await fetchOfficeBookings(date, currentArea);
        setOfficeBookings(data)
    }

    const deleteBooking = async (bookingID: any, assetId: any) => {
        const res = await deleteReservation(bookingID);


        // Create a copy of the current state
        let newAssetData = JSON.parse(JSON.stringify(assetData))

        // find the current asset
        let currentAsset = newAssetData["Stand-Up Desk"].filter((asset: any) => asset.assetId === assetId)[0]
        let otherAssets = newAssetData["Stand-Up Desk"].filter((asset: any) => asset.assetId !== assetId)

        currentAsset["Reserved"] = 'false';

        // Message example
        // {
        //     "topic": "updateAsset",
        //     "type": "Stand-Up Desk",
        //     "assetId": 435,
        //     "props": {
        //         "Reserved": true,
        //     }
        // }

        // Send message to WebSocket with the modified values
        sendWebSocketMessage(JSON.stringify(
            {
                "topic": "updateAsset",
                "type": "Stand-Up Desk",
                "assetId": currentAsset.assetId,
                "props": {
                    "Reserved": "false",
                }
            }
        ));

        getBookings(user);

    }

    const onFilter = (e: any) => {

        if (e.currentTarget.value) {
            setSortedOfficeBookings(officeBookings.filter((i: any) => i.user_id.toLowerCase().indexOf(e.currentTarget.value) > -1))
        }
    }


    useEffect(() => {
        getBookings(user);
    }, [user])

    useEffect(() => {
        setSortedOfficeBookings(officeBookings)
    }, [officeBookings])


    return (
        <div className={styles.container}>

            <div className={styles.yourBookings}>
                <h1>Your Bookings for area: {currentArea}</h1>

                {/* Table with || Desk Name || Date || Cancel Button  */}
                {bookings.length > 0 ? (

                    <DetailsList
                        items={bookings}
                        columns={columns}
                        layoutMode={DetailsListLayoutMode.justified}
                        onRenderItemColumn={(item: any, index: any, column: any): JSX.Element => {
                            if (column.fieldName === 'cancelButton') {
                                return (
                                    <PrimaryButton
                                        text="Cancel Booking"
                                        className={styles.deleteButton}
                                        onClick={() => {
                                            deleteBooking(item.id, Number(item.desk_id))
                                            console.log(item)
                                        }}
                                    />
                                )
                            }
                            return item[column.fieldName];
                        }}
                        checkboxVisibility={2}
                    />
                ) : (
                    <h3>You don't have any bookings for this area</h3>
                )}
            </div>

            {user.adminLocations.includes(currentArea) && (

                <div className={styles.officeBookings}>
                    <h1>All Bookings for area: {currentArea}</h1>

                    <div className={styles.selectDate}>
                        <DatePicker
                            showWeekNumbers={true}
                            firstWeekOfYear={1}
                            label={"Date"}
                            value={today}
                            showMonthPickerAsOverlay={true}
                            strings={defaultDatePickerStrings}
                            minDate={today}
                            className={styles.dateInput}
                            onSelectDate={(date: any) => { if (date !== null) setBookingDate(formatDateToString(date)) }}
                        />
                        <PrimaryButton
                            className={styles.editButton}
                            text={"Get Bookings"}
                            onClick={() => { getOfficeBookings(bookingDate) }}
                            allowDisabledFocus
                        />
                    </div>

                    {officeBookings.length > 0 ? (
                        <>

                            <TextField
                                label="Filter by Username:"
                                onChange={onFilter}
                            />
                            <div className={styles.wrapper}>
                                <ScrollablePane>


                                    <DetailsList
                                        items={sortedOfficeBookings}
                                        columns={officeColumns}
                                        // layoutMode={DetailsListLayoutMode.justified}
                                        onRenderItemColumn={(item: any, index: any, column: any): JSX.Element => {
                                            if (column.fieldName === 'cancelButton') {
                                                return (
                                                    <PrimaryButton
                                                        text="Cancel Booking"
                                                        className={styles.deleteButton}
                                                        onClick={() => {
                                                            deleteBooking(item.id, Number(item.desk_id))
                                                            console.log(item)
                                                        }}
                                                    />
                                                )
                                            }
                                            return item[column.fieldName];
                                        }}
                                        checkboxVisibility={2}
                                    />
                                </ScrollablePane>
                            </div>
                        </>
                    ) : (
                        <h3>There are no bookings for this date.</h3>
                    )}
                </div>
            )}
        </div>
    );
}
