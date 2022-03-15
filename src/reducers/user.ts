// Import Dependencies
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { History } from 'history';

// Import Types
import { AppThunk, RootState } from '../store/store';

// Types and Interfaces

type ClaimsData = { typ: string, val: string }[];

interface UserState {
    name?: string,
    email?: string,
}

// Declare Constants

const NAME_CLAIM = "name";
const EMAIL_CLAIM = "email";

const USER_LOGOUT_URL = `${process.env.PUBLIC_URL}/.auth/logout?post_logout_redirect_uri=${process.env.PUBLIC_URL}/`;

// Initialise the user state
const initialState: UserState = {};

const userSlice = createSlice({
    // State name
    name: 'user',
    // Initial value
    initialState,
    // Actions
    reducers: {
        // Creates a setUser action
        setUser: (state, action: PayloadAction<any>) => {

            console.log(action.payload)
            if(action.payload.length === 0){
                state.name = undefined;
                state.email = undefined;
            }else {

                action.payload.forEach((claim:any) => {
                // if the value is a name, save it in the store
                    if (claim.typ === NAME_CLAIM) {
                        state.name = claim.val;
                    }
    
                    // if the value is an email, save it in the store
                    if (claim.typ === EMAIL_CLAIM) {
                        state.email = claim.val;
                    }
                });
            }


        },
    },
});

// Fetches the User data and returns it
// let fetchUserData = async () => {
//     try {
//         const resp = await fetch(USER_INFO_URL);
//         const raw_data = await resp.json();
//         return raw_data[0];

//     // if there is an error console the following message
//     } catch (err) {
//         console.error("Failed to get current user info");
//         return {}
//     }   
// }

// If we are on the localhost, overwrite the fetchUserData function and return 
// if (window.location.hostname === 'localhost') {
//     fetchUserData = () => new Promise(resolve => {
//         setTimeout(() => resolve({
//             "user_claims": [
//                 {
//                     "typ": "email",
//                     "val": "user@localhost"
//                 },
//                 {
//                     "typ": "name",
//                     "val": "Example"
//                 }
//             ],
//             "user_id": "user@localhost"
//         }), 1000)
//     })
// }

// Export fetchUserInfo Action
// export const fetchUserInfo = (): AppThunk => async dispatch => {
//     // Save the user data in the data variable
//     const data = await fetchUserData();
//     return dispatch(userSlice.actions.setUser(data.user_claims));
// };

// Export logout function
export const logout = (history: History): AppThunk => () => {
    // Push logout url to the history stack
    history.push(USER_LOGOUT_URL);
};

// Export user state values from the store
export const selectUserName = (state: RootState) => state.user.name;
export const selectUserEmail = (state: RootState) => state.user.email;

export const { setUser } = userSlice.actions;

// Export the user Reducers
export default userSlice.reducer;