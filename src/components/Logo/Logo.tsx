
// Import Dependencies
import React from 'react';
import { Link } from '@fluentui/react';

// Import Styles
import './Logo.scss';

const Logo: React.FC = () => {
    return (
        <Link
            href="/"
            aria-label="Continental Logo"
            className="link"
        >
            <img
                className="logo"
                src="/static/images/logo.png"
                alt="logo"
                role="presentation"
                aria-hidden={true}
            />
        </Link>
    );
};

export default Logo;

