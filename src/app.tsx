import React, {PureComponent} from 'react';
import {Consumer} from "coreact";
import {Route, Switch} from "react-router";
import {routes} from "@lib/routes";
import {Home} from "./home";
import {Nav} from "./home/nav";
import {AddAccount} from "./home/accounts/add";
import {Accounts} from "./home/accounts";

@Consumer
export class App extends PureComponent {
  render() {
    return <>
      <Nav/>
      <Switch>
        <Route path={routes.home} component={Home} exact/>
        <Route path={routes.accounts} component={Accounts} exact/>
        <Route path={routes.addAccount} component={AddAccount} exact/>
      </Switch>
    </>;
  }
}
