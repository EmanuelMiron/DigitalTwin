
// Import Dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { initializeIcons } from '@uifabric/icons';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom";
import { store } from './store/store';

// Import Components
import App from './App';

// Import Styles
import './index.scss';

initializeIcons();

ReactDOM.render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>,
  document.getElementById('root')
);
