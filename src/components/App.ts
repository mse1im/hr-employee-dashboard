import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { Router } from "@vaadin/router";
import store, { RootState } from "../store/store";

import "./Navbar.ts";
import "../pages/EmployeePage.ts";
import "../pages/NotFoundPage.ts";

@customElement("app-container")
export class App extends connect(store)(LitElement) {
  @state() language: string = "tr";

  createRenderRoot() {
    return this;
  }

  stateChanged(state: RootState) {
    this.language = state.language.language;
    document.documentElement.lang = this.language;
  }

  firstUpdated() {
    const outlet = document.querySelector("#outlet");

    const router = new Router(outlet);
    router.setRoutes([
      { path: "/", component: "employee-page" },
      { path: "/employees", component: "employee-page" },
      { path: "(.*)", component: "not-found-page" }
    ]);
  }

  render() {
    return html`
      <app-navbar></app-navbar>
      <div id="outlet"></div>
    `;
  }
}
