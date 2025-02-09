import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../components/EmployeeTable";
import store, { RootState } from "../store/store";
import locales from "../locales";
import { connect } from "pwa-helpers";

@customElement("employee-page")
export class EmployeePage extends connect(store)(LitElement) {
  createRenderRoot() {
    return this;
  }

  @state() language: string = "en";

  stateChanged(state: RootState) {
    this.language = state.language.language;
    this.requestUpdate();
  }

  render() {
    const t = locales[this.language]?.table || locales["en"].table;

    return html`
      <div class="p-6">
        <h1 class="text-3xl font-bold text-[#ff6101] mb-5">${t.employees}</h1>
        <employee-table></employee-table>
      </div>
    `;
  }
}