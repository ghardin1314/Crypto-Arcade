import React from "react";
import { Route, Switch } from "react-router-dom";

// import About from './containers/About'
import Astroids from './containers/Astroids'

const Page404 = ({ location }) => (
  <div>
    <h2>
      Sorry page <code>{location.pathname}</code> does not exist
    </h2>
  </div>
);

const BaseRouter = () => (
  <Switch>
    {/* <Route exact path="/" component={About} /> */}
    <Route exact path="/" component={Astroids} />
    <Route component={Page404} />
  </Switch>
);

export default BaseRouter;
