// Import Dependencies
import React, { useState } from 'react';
import { DefaultButton, getTheme, mergeStyleSets, TextField } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

// Import Components
import { Dialog } from '../Dialog';

// Import Models
import { DialogType } from '../../../models/dialogData';

// Import Reducers
import { hideDialog, selectLogIn } from '../../../reducers/dialog';
import { UserDataUrl } from '../../../config';
import { setUser } from '../../../reducers/user';

// Styles
const theme = getTheme();
const styles = mergeStyleSets({
    bodyContainer: {
        width: '100%',
        height: '210px',
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
        alignSelf: 'flex-end'
    },
    input: {
        width: '90%',
        margin: '0 auto'
    }
});

const fetchUserData = async (username: string) => {
    try {
        const response: Response = await fetch(`${UserDataUrl}/${username}`);

        // If the response is ok, returns the json obj, if it is empty return an empty obj.
        if (response.ok) {
            const json = await response.json();
            return json ?? {};
        } else {
            throw new Error();
        }
    } catch {
        // If there is a problem, return to the console the following error
        console.error("Failed to get User data");
        return {};
    }
}

// Export DeleteConfirmation Dialog
export const LoginDialog = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginButtonState, setLoginButtonState] = useState(false);
    const [loginButtonText, setLoginButtonText] = useState('Log In')

    const data = useSelector(selectLogIn);

    const dispatch = useDispatch();

    const verifyCredentials = async () => {

        setLoginButtonState(true); 
        setLoginButtonText('Log In...')

        const userData = await fetchUserData(username)

        if (userData[0].password === password) {
            dispatch(setUser(
                [
                    {
                        "typ": "email",
                        "val": "admin@localhost"
                    },
                    {
                        "typ": "name",
                        "val": username
                    }
                ]
            ))

            dispatch(hideDialog(DialogType.LogIn));
            setLoginButtonState(false); 
            setLoginButtonText('Log In');
        } else {
            setLoginButtonState(false); 
            setLoginButtonText('Log In');
            alert('Wrong Username or password!')
        }
    }

    return (
        <Dialog
            title="Log In"
            isModeless={true}
            draggable={true}
            body={
                <>
                    <div className={styles.bodyContainer}>
                        <TextField
                            label={"Username"}
                            placeholder={"Username"}
                            onChange={(e: any) => {
                                setUsername(e.currentTarget.value)
                            }}
                            className={styles.input}
                        />
                        <TextField
                            label={"Password"}
                            placeholder={"Password"}
                            type="password"
                            onChange={(e: any) => {
                                setPassword(e.currentTarget.value)
                            }}
                            className={styles.input}
                        />
                        <DefaultButton
                            disabled={loginButtonState}
                            text={loginButtonText}
                            onClick={() => verifyCredentials()} allowDisabledFocus
                        />
                    </div>
                </>
            }
            isOpen={data.isVisible}
            styles={
                mergeStyleSets({
                    main: {

                    }
                })
            }
            onDismiss={() => {
                dispatch(hideDialog(DialogType.LogIn));
            }}
        />
    );
}
