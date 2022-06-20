
// Import Dependencies
import React, { useEffect } from 'react';
import { initializeIcons } from '@uifabric/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

// Import Components
import AppHeader from './components/AppHeader/AppHeader';
import Map from './components/Map/Map';
import SideNavBar from './components/SideNavBar/SideNavBar';
// import { StatsSidebar } from './components/StatsSidebar/StatsSidebar';

// Import Reducers
import {
  fetchLocationsInfo,
  selectLocationsDataLoaded,
  updateCurrentLocation,
} from './reducers/locationData';
// import { fetchUserInfo } from './reducers/user';
import { fetchAssetsInfo } from './reducers/assetData';

// Import Styles
import './App.scss';
import { fetchAssetTypesInfo } from './reducers/assetTypesData';
import { fetchIcons } from './reducers/icons';
import { wsConnect } from './helpers/websocket';
import { fetchUserData } from './reducers/user';
import { Dashboard } from './components/Dashboard/Dashboard';
import { setLayerVisibility } from './reducers/layersData';

initializeIcons();

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const App: React.FC = () => {
  // Create a reference for the dispatch function of the Redux store.
  const dispatch = useDispatch();

  // Save the current history sequence in the history variable
  const history = useHistory();

  let query = useQuery();

  // save the pathname in the path variable
  const { pathname: path } = useLocation();


  useEffect(() => {

    // Dispatch the fetchUserInfo Action ( Saves the user information to the store )
    // dispatch(fetchUserInfo());

    // Dispatch the fetchLocationsInfo Action ( Saves the Location information to the store )
    dispatch(fetchLocationsInfo(path, history));


    // Dispatch the fetchAssetsInfo Action ( Requests and saves the Assets to the store )
    dispatch(fetchAssetTypesInfo());

    // Dispatch the fetchIcons Action ( Requests the icons saved in the db as svgs)
    dispatch(fetchIcons());

    

    // Don't add `path` to deps as we want to trigger this effect only once, not on every location change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, history]);

  // Gets store.locationData.isLoaded ( If the location data is loaded value is true )
  const isLoaded = useSelector(selectLocationsDataLoaded);
  useEffect(() => {
    // Only parse path and update current location when locations data has been loaded otherwise there is a race condition between this update and update triggered by`fetchLocationsInfo`
    if (isLoaded) {
        if( atob(query.get("auth") || "") !== "") {
            // Fetch userdata and dispatch it
            dispatch(fetchUserData(atob(query.get("auth") || "")));
        }
        

      if (path === "/dashboard") {
        console.log(query.get("auth"))
      } else if( path.search("auth") !== -1) {
        alert(path)
      }else {
        // Dispatch the updateCurrentLocation Action( Changes the locationData.current to the current location)
        dispatch(updateCurrentLocation(path, history));

        // Dispatch the fetchAssetsInfo Action ( Requests and saves the Assets to the store )
        dispatch(fetchAssetsInfo(path.split("/")[path.split("/").length - 1]));

        // Activate the Assets layer by default
        dispatch(setLayerVisibility({ id: "asset", isVisible: true }))
      }
      wsConnect()
    }
  }, [dispatch, history, isLoaded, path])

  return (
    <Switch>
      <Route path={"/dashboard"}>
        <div className="App">
          <AppHeader />
          <main>
            <SideNavBar />
            <Dashboard />
            {/* <StatsSidebar /> */}
          </main>
        </div>
      </Route>
      <Route path={""}>
        <div className="App">
          <AppHeader />
          <main>
            <SideNavBar />
            <Map />
            {/* <StatsSidebar /> */}
          </main>
        </div>
      </Route>
    </Switch>

  );
};

export default App;