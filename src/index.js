import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Live from './Live';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import * as serviceWorker from './serviceWorker';
import ipData from './config/ip.json'
const { ip } = ipData

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/live">
          <Live ip={ip} />
        </Route>
        <Route path="/">
          <App ip={ip} />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
