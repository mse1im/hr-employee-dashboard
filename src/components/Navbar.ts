import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import store, { RootState } from "../store/store";
import { setLanguage } from "../store/languageSlice";
import locales from "../locales";
import "./EmployeeTable";

@customElement("app-navbar")
export class Navbar extends connect(store)(LitElement) {
  createRenderRoot() {
    return this;
  }

  @state() language: "en" | "tr" = "en";
  @state() showModal: boolean = false;

  stateChanged(state: RootState) {
    this.language = state.language.language;
    this.requestUpdate("language");
  }

  handleLanguageChange(e: Event) {
    const selectEl = e.target as HTMLSelectElement;
    const newLang = selectEl.value as "en" | "tr";
    store.dispatch(setLanguage(newLang));
  }

  openUpsertModal() {
    const employeeTable = document.querySelector("employee-table") as any;
    if (employeeTable) {
      employeeTable.openUpsertModal(null);
    }
  }

  render() {
    const t = locales[this.language]?.navbar || locales["en"].navbar;

    return html`
      <nav class="mt-5 flex justify-between items-center bg-white p-5">
        <img src="/logo.png" alt="Ing Hubs" class="w-[50px] h-[50px]" />

        <div class="nav-links items-center flex flex-row gap-5 text-[#ff6101]">
          <a href="/employees" class="hover:underline">${t.employees}</a>

          <button
            class="add-btn cursor-pointer px-3 py-1 bg-[#ff6101] text-white rounded"
            @click="${this.openUpsertModal}"
          >
            + ${t.addNew}
          </button>

          <select
            class="p-2 border border-gray-300 rounded cursor-pointer"
            @change="${this.handleLanguageChange}"
          >
            <option
              value="en"
              ?selected="${this.language === 'en'}"
            >
              🇬🇧 English
            </option>

            <option
              value="tr"
              ?selected="${this.language === 'tr'}"
            >
              🇹🇷 Türkçe
            </option>
          </select>
        </div>
      </nav>
    `;
  }
}