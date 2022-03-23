// Import Dependencies
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import Components
import { Dialog } from '../Dialog';

// Import Models
import { DialogType } from '../../../models/dialogData';

// Import Reducers
import { hideDialog, selectBookDesk } from '../../../reducers/dialog';
import { addDays, DatePicker, defaultDatePickerStrings, getTheme, mergeStyleSets, PrimaryButton, TextField } from '@fluentui/react';

import { assetDataUrl, deskBookingUrl } from '../../../config';
import { selectAssetData, updateAsset } from '../../../reducers/assetData';
import { formatDateString, formatDateToString } from './CreateAssetDialog';
import { formatStringToDate } from './EditAssetDialog';
import { mapService } from '../../../services/mapService';
import { sendWebSocketMessage } from '../../../helpers/websocket';

// import DatePicker from "react-multi-date-picker"

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
        justifySelf: 'flex-end'
    },
    input: {
        width: '90%',
        margin: '0 auto'
    }
});

// Export BookDeskDialog
export const BookDeskDialog = () => {
    const today = new Date(Date.now());

    // State Variables
    const [startBookingDate, setStartBookingDate] = useState<any>(today);
    const [endBookingDate, setEndBookingDate] = useState<any>(today);
    const [email, setEmail] = useState<any>('email');
    const [bookedDates, setBookedDates] = useState<any>();
    const [bookedFormattedDates, setBookedFormattedDates] = useState<any>();
    const [nextAvailableDate, setNextAvailableDate] = useState<any>('Loading...');
    const [possibleDates, setPossibleDates] = useState<any>([today]);
    const [bookingButtonState, setBookingButtonState] = useState(false);
    const [bookingButtonText, setBookingButtonText] = useState('Book Desk')

    // useSelectorHooks
    const data: any = useSelector(selectBookDesk);
    const assetData = useSelector(selectAssetData);

    // Initialise Dispatch
    const dispatch = useDispatch();

    // Send a request to backend Service to handle the creation of the booking
    const createBooking = async (email: any, bookingDates: any) => {

        await fetch(`${deskBookingUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                bookingDates,
                Desk: data
            })
        })
        .catch(err => {
            console.error("Failed to book the desk", err);
        })
    }

    // Send a request to the backend Service to change the reservation state of the office desk
    const updateDesk = async () => {
        await fetch(`${assetDataUrl}/${data.assetId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "properties": [
                    {
                        "Key": "Reserved",
                        "Value": 'true'
                    }
                ]
            })
        })
        .catch(err => {
            console.error("Failed to update the asset", err);
        });
    }

    // This function is run whenever the possibleDates and bookedFormattedDates are changed
    const getNextAvailableDate = () => {
        // Check to see if the bookedFormattedDates is not undefined
        if (bookedFormattedDates === undefined) return;

        let n: any = [];
        // Format all booked Dates from strings to Dates
        bookedFormattedDates.forEach((date: any) => {
            n.push(formatDateToString(date))
        })

        let j: any = [];

        possibleDates.forEach((date: any) => {
            // Format each possible Date to String
            date = formatDateToString(date)
            // if The possible date isn't in the bookedDates array then add it to another array
            if (n.includes(date) === false) {
                j.push(date)
            }
        })

        // If there are no dates available you can't book this office 
        if (j.length < 1) {
            setStartBookingDate(undefined);
            setEndBookingDate(undefined);

            // Don't let the user press the Book button if there are no available dates
            setBookingButtonState(true);
            return "You can't book this office at this moment ( all dates are booked )"
        }

        // If there is more than one available dates, return only the first one
        setStartBookingDate(formatStringToDate(j[0]))
        return j[0]

    }


    const handleBooking = async () => {
        // Change the state of the button 
        setBookingButtonState(true);
        setBookingButtonText("Booking...");

        // Initialise Variables
        let formattedPossibleDates: any = []
        let formattedRestrictedDates: any = []

        // Save possibleDates in formattedPossibleDates as strings
        possibleDates.forEach((date: any, idx: number) => { formattedPossibleDates[idx] = formatDateToString(date) })

        // Save bookedFormattedDates in formattedRestrictedDates as strings
        bookedFormattedDates.forEach((date: any, idx: number) => { formattedRestrictedDates[idx] = formatDateToString(date) })

        // Save in selectedBookingDates the range of Dates selected by user ( from startBookingDate to endBookingDate)
        let selectedBookingDates = formattedPossibleDates.slice(formattedPossibleDates.indexOf(startBookingDate), formattedPossibleDates.indexOf(endBookingDate) + 1)

        // Loop through all the formattedRestrictedDates and delete them from the selectedBookingDates array
        formattedRestrictedDates.forEach((date: string) => {
            // Get the index of the current restricted date in the selectedBookingDates;
            let currentDateIndex = selectedBookingDates.indexOf(date);
            if(currentDateIndex !== -1){
                // Delete the previously selected index from the selectedBookingDates array
                selectedBookingDates.splice(currentDateIndex, 1);
            }
        })

        // Create the booking with the given email address and the array of dates
        createBooking(email, selectedBookingDates);

        // Create an array with the elements of the bookedFormattedDates and the startBookingDate
        let newDateArray = [
            ...bookedFormattedDates,
            formatStringToDate(startBookingDate)
        ];

        // Sort the array alphabetically
        let sortedDates = newDateArray.sort((a: any, b: any) => a - b)

        // Set the new BookedFormattedDates with the startBooking Date added
        setBookedFormattedDates(sortedDates)


        // If the start Booking date is today
        if (startBookingDate === formatDateToString(today)) {

            // Update the current desk to be Reserved
            updateDesk()

            //  === Change the state ===

            // Create a copy of the current state
            let newAssetData = JSON.parse(JSON.stringify(assetData))

            // find the current asset
            let currentAsset = newAssetData[data.assetType].filter((asset: any) => asset.assetId === data.assetId)[0]
            let otherAssets = newAssetData[data.assetType].filter((asset: any) => asset.assetId !== data.assetId)

            currentAsset["Reserved"] = 'true';

            // Send message to WebSocket with the modified values
            sendWebSocketMessage(JSON.stringify(
                {
                    state: {
                        type: data.assetType,
                        updatedAsset: [currentAsset, ...otherAssets]
                    },
                    mapData: {
                        ...newAssetData,
                        [data.assetType]: [currentAsset, ...otherAssets]
                    }
                }
            ));
        }

        // Reset the button 
        setBookingButtonState(false);
        setBookingButtonText("Booking");

        //  === Hide the dialog ===
        dispatch(hideDialog(DialogType.BookDesk));
    }

    // Fetches the booked Dates for a particular desk
    const getBookedDates = async () => {
        await fetch(`${deskBookingUrl}/${data.assetId}`)
        .then(response => response.json())
        .then(json => {
            setBookedDates(json)
            setBookingButtonState(false);
        })
        .catch(err => {
            console.error(`Fetching the booked dates for ${data.assetId} failed!`, err);
        })
        
    }

    // When the booking dialog opens, fetch the booked dates for that particular desk
    useEffect(() => {
        // Disable the Booking button so that you can't start the booking if the booked dates are not loaded yet
        setBookingButtonState(true);

        // Fetches the booked Dates
        getBookedDates();

        // Limit the possible Dates for booking to only 7
        let pDates = [...possibleDates];
        
        for (let i = 1; i <= 7; i++) {
            pDates.push(addDays(today, i))
        }

        setPossibleDates(pDates);
    }, [])


    // Whenever bookedDates changes, format them into Dates and order them alphabetically
    // Save it in bookedFormattedDates
    useEffect(() => {
        if (bookedDates !== undefined) {

            let datesArray: any = [];

            // Run through each bookedDate and format them into Dates
            bookedDates.forEach((bookedDate: any) => {
                datesArray.push(formatStringToDate(bookedDate.booked_date))
            })

            // Order them alphabetically
            let sortedDates = datesArray.sort((a: any, b: any) => a - b)
            
            // Set Formatted and Ordered booked Dates
            setBookedFormattedDates(sortedDates);
        }

    }, [bookedDates])

    // Whenever the possibleDates and bookedFormattedDates change, Get the new Next available date for booking
    useEffect(() => {
        const next = getNextAvailableDate();
        setNextAvailableDate(next);

    }, [possibleDates, bookedFormattedDates])

    return (
        <Dialog
            title={`Book Desk`}
            body={
                <>
                    <div className={styles.bodyContainer}>
                        <TextField
                            label={"Next Available Date"}
                            value={nextAvailableDate}
                            className={styles.input}
                            disabled={true}
                        />
                        <DatePicker
                            showWeekNumbers={true}
                            firstWeekOfYear={1}
                            label={"Start Date"}
                            // value={formatStringToDate(bookingDate)}
                            value={undefined}
                            showMonthPickerAsOverlay={true}
                            strings={defaultDatePickerStrings}
                            className={styles.input}
                            minDate={today}
                            maxDate={addDays(today, 7)}
                            onSelectDate={(date: any) => { date !== null && setStartBookingDate(formatDateToString(date)) }}
                            calendarProps={{
                                calendarDayProps: {
                                    restrictedDates: bookedFormattedDates
                                }
                            }}
                            isRequired={true}

                        />
                        <DatePicker
                            showWeekNumbers={true}
                            firstWeekOfYear={1}
                            label={"End Date"}
                            value={undefined}
                            showMonthPickerAsOverlay={true}
                            strings={defaultDatePickerStrings}
                            className={styles.input}
                            minDate={today}
                            maxDate={addDays(today, 7)}
                            onSelectDate={(date: any) => { date !== null && setEndBookingDate(formatDateToString(date)) }}
                            calendarProps={{
                                calendarDayProps: {
                                    restrictedDates: bookedFormattedDates
                                }
                            }}
                            isRequired={true}
                        />
                        <TextField
                            label={"Email Address"}
                            placeholder={"uiexxxxxx@contiwan.com"}
                            value={email}
                            onChange={(e: any) => {
                                setEmail(e.currentTarget.value)
                            }}
                            className={styles.input}
                            required={true}
                        />
                        <PrimaryButton
                            className={styles.editButton}
                            text={bookingButtonText}
                            disabled={bookingButtonState}
                            onClick={handleBooking}
                            allowDisabledFocus />
                    </div>

                </>
            }
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
                dispatch(hideDialog(DialogType.BookDesk));
            }}
        />
    );
}

