import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { Router } from "@vaadin/router";
import store, { RootState } from "../store/store";

import "./Navbar.ts";
import "../pages/AddEmployeePage.ts";
import "../pages/EditEmployeePage.ts";
import "../pages/EmployeePage.ts";
import "../pages/NotFoundPage.ts";

@customElement("app-container")
export class App extends connect(store)(LitElement) {
  @state() language: string = "tr"; // ✅ Varsayılan dil

  createRenderRoot() {
    return this;
  }

  stateChanged(state: RootState) {
    this.language = state.language.language;
    document.documentElement.lang = this.language; // ✅ HTML `lang` güncellemesi
  }

  firstUpdated() {
    const outlet = document.querySelector("#outlet");

    const router = new Router(outlet);
    router.setRoutes([
      { path: "/", component: "employee-page" },
      { path: "/employees", component: "employee-page" },
      { path: "/add-employee", component: "add-employee-page" },
      { path: "/edit-employee", component: "edit-employee-page" },
      { path: "(.*)", component: "not-found-page" }
    ]);
  }

  render() {
    return html`
      <app-navbar></app-navbar> <!-- 📌 Navbar burada çağrıldı! -->
      <div id="outlet"></div> <!-- 📌 Sayfa içerikleri burada değişecek -->
    `;
  }
}
