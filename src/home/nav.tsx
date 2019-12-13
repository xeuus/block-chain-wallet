import './nav.sass';
import React, {PureComponent} from 'react';
import {NavLink} from "react-router-dom";
import {routes} from "@lib/routes";

export class Nav extends PureComponent{
  render() {
    return <nav className="simple-nav">
      <NavLink className="nav-link" to={routes.home} exact replace>
        <i className="icon outlined">account_circle</i>
        Aryan Alikhani
      </NavLink>

      <NavLink className="nav-link" to={routes.accounts} exact replace>
        <i className="icon">payment</i>
        Accounts
      </NavLink>
      <div className="mx-auto"/>
      <NavLink className="nav-link" to={routes.addAccount} exact replace>
        Create Wallet
        <i className="icon">add</i>
      </NavLink>
    </nav>;
  }
}