
// Import Dependencies
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ContextualMenu, DefaultButton, IContextualMenuItem, Persona } from '@fluentui/react';

// Import Reducers
import { selectUserName, setUser } from '../../reducers/user';

// Import Styles
import './index.scss';
import { CreateAssetDialog } from '../Map/Dialogs/CreateAssetDialog';
import { showDialog } from '../../reducers/dialog';
import { DialogType } from '../../models/dialogData';


// Interfaces
interface PersonaButtonProps {
    userName?: string;
    onClick?: () => void;
}

// PersonaButton Component
const PersonaButton: React.FC<PersonaButtonProps> = ({
    userName = '',
    onClick,
}) => {
    return (
        <button
            className="persona-button"
            onClick={userName ? onClick : undefined}
            contentEditable={false}
        >
            <Persona
                text={userName}
                hidePersonaDetails
            />
        </button>
    );
};


// UserControl Component
const UserControl: React.FC = () => {


    const userName = useSelector(selectUserName)
    const [isMenuVisible, setMenuVisible] = React.useState(false);
    const toggleIsCalloutVisibility = () => { setMenuVisible(!isMenuVisible) };
    const dispatch = useDispatch();
    const handleSignout = useCallback(() => { 
        dispatch(setUser([]))
        // dispatch(logout(history))
    }, [dispatch]);
    const menuItems: IContextualMenuItem[] = [
        {
            key: 'signout',
            text: 'Sign Out',
            onClick: handleSignout,
            iconProps: {
                iconName: 'SignOut',
            }
        }
    ];

    const logIn = () => {
        dispatch(showDialog({
            type: DialogType.LogIn,
            isVisible: true
        }));
    }

    return (
        userName === undefined ? (
            <>
                <DefaultButton text="Log In" onClick={logIn} />
                <CreateAssetDialog />
            </>
        ) : (
            <React.Fragment>
                <PersonaButton
                    userName={userName}
                    onClick={toggleIsCalloutVisibility}
                />
                <ContextualMenu
                    isBeakVisible
                    target=".persona-button"
                    items={menuItems}
                    hidden={!isMenuVisible}
                    onDismiss={toggleIsCalloutVisibility}
                />
            </React.Fragment>
        )
    );
};

// Export UserControl Component
export default UserControl;
