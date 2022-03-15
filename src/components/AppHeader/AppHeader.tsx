import './AppHeader.scss';

import React from 'react';

// Import Components
import LocationBreadcrumb from '../LocationBreadcrumb/LocationBreadcrumb';
import Logo from '../Logo/Logo';
import UserControl from '../UserControl';

const AppHeader: React.FC = () => {
  return (
    <header className="app-header">
      <Logo />

      <LocationBreadcrumb />

      <UserControl />
    </header>
  );
};

export default AppHeader;

