// Import Styles
import './SideNavBar.scss';

// Import Dependencies
import React, { useState } from 'react';
import { getId, IconButton, INavLink, Nav } from '@fluentui/react';
import { useSelector } from 'react-redux';

// Import Components
import { FavoritesSwitcher } from '../FavoritesSwitcher/FavoritesSwitcher';
import { LayersSwitcher } from '../LayersSwitcher/LayersSwitcher';
import { NavbarButton } from './NavbarButton/NavbarButton';
import { RoomsNavigator } from '../RoomsNavigator/RoomsNavigator';

// Import Reducers
import { selectRoomsCount } from '../../reducers/rooms';

// Sidebar Icon & Links
const links: INavLink[] = [
	{
		key: 'link1',
		name: 'Map',
		url: '/romania/sibiu/m6/l01',
		icon: 'Globe',
	},
	{
		key: 'link2',
		name: 'Dashboard',
		url: '/',
		disabled: false,
		icon: 'BarChartVertical',
	},
];

// SideNavBar Component
const SideNavBar: React.FC = () => {
	
	// States
	const [isCollapsed, setCollapsed] = useState(true);
	const [isFavoritesVisible, setFavoritesVisibility] = useState(false);
	const [isLayersSwitcherVisible, setLayersSwitcherVisibility] = useState(false);
	const [isRoomSearchVisible, setRoomSearchVisibility] = useState(false);
	
	// Constants
	const roomsCount: number = useSelector(selectRoomsCount);
	const toggleColapsed = () => setCollapsed(!isCollapsed);
	const favoritesButtonId: string = 'favorites-button';
	const layersButtonId = getId("layers-button");
	const searchRoomButtonId = getId('search-room-button');

	return (
		<div className={`sidenav-bar${isCollapsed ? ' collapsed' : ''}`}>
			<div className="top-group">
				<Nav
					groups={[{ links }]}
					selectedKey="link1"
					styles={{
						groupContent: "sidenav-group-content",
						link: 'sidenav-link'
					}}
				/>

				<NavbarButton
					id={favoritesButtonId}
					text={isCollapsed ? undefined : 'Favorites'}
					iconProps={{
						iconName: "FavoriteStarFill",
						className: 'favorites-button-icon',
					}}
					onClick={() => setFavoritesVisibility(!isFavoritesVisible)}
					ariaLabel="Favorites"
					title={isCollapsed ? 'Favorites' : undefined}
				/>

				<NavbarButton
					id={searchRoomButtonId}
					text={isCollapsed ? undefined : 'Search room'}
					disabled={roomsCount === 0}
					iconProps={{
						iconName: "Search",
					}}
					onClick={() => setRoomSearchVisibility(!isRoomSearchVisible)}
					ariaLabel="Search room"
					title={isCollapsed ? 'Search room' : undefined}
				/>
			</div>

			<NavbarButton
				id={layersButtonId}
				iconName="Settings"
				ariaLabel="Settings"
				onClick={() => setLayersSwitcherVisibility(!isLayersSwitcherVisible)}
				text={isCollapsed ? undefined : 'Settings'}
				title={isCollapsed ? 'Settings' : undefined}
			/>

			<div className="collapse-button-container">
				<IconButton
					onClick={toggleColapsed}
					iconProps={{
						className: `collapse-icon${isCollapsed ? ' collapsed' : ''}`,
						iconName: 'ChevronLeft'
					}}
					ariaLabel="Collapse"
				/>
			</div>

			{isFavoritesVisible && (
				<FavoritesSwitcher
					target={`#${favoritesButtonId}`}
					onDismiss={() => setFavoritesVisibility(false)}
				/>
			)}

			{isRoomSearchVisible && (
				<RoomsNavigator
					target={`#${searchRoomButtonId}`}
					onDismiss={() => setRoomSearchVisibility(false)}
				/>
			)}

			{isLayersSwitcherVisible && (
				<LayersSwitcher
					target={`#${layersButtonId}`}
					onDismiss={() => setLayersSwitcherVisibility(false)}
				/>
			)}
		</div>
	);
};

// Export SideNavBar component
export default SideNavBar;
