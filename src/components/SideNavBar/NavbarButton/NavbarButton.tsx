// Import Dependencies
import React from "react";
import { DefaultButton, IButtonProps } from "@fluentui/react";

// Import Styles
import "./NavbarButton.scss";

// Interfaces
interface NavbarButtonProps {
    iconName?: string;
}

// Export NavbarButton Component
export const NavbarButton: React.FC<IButtonProps & NavbarButtonProps> = ({ iconName, iconProps, styles, ...rest }) => (
    <DefaultButton
        className="sidenav-button-button"
        styles={{
            flexContainer: 'sidenav-button-inner',
            textContainer: 'sidenav-button-text',
            ...styles,
        }}
        iconProps={{
            iconName,
            className: 'sidenav-button-icon',
            ...iconProps
        }}
        {...rest}
    />
);
