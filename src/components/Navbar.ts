import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import store, { RootState } from "../store/store";
import { setLanguage } from "../store/languageSlice";
import locales from "../locales";

@customElement("app-navbar")
export class Navbar extends connect(store)(LitElement) {
  @state()
  language: "en" | "tr" = "en"; // ✅ TypeScript ile doğru tür belirtildi

  static styles = css`
    nav {
      background-color: #f3f4f6;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-links {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    select {
      padding: 5px;
      border-radius: 5px;
      border: 1px solid #ccc;
    }
    img {
      height: 32px;
    }
    a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
    }
    a:hover {
      color: #007bff;
    }
  `;

  stateChanged(state: RootState) {
    this.language = state.language.language; // ✅ Redux Store'dan dili al
    this.requestUpdate("language"); // ✅ Değişiklikleri algılaması için zorla güncelle
  }

  changeLanguage(event: Event) {
    const lang = (event.target as HTMLSelectElement).value as "en" | "tr";
    store.dispatch(setLanguage(lang));
  }

  render() {
    const t = locales[this.language]?.navbar || locales["en"].navbar;
    return html`
      <nav>
        <img src="/logo.png" alt="Logo" />
        <div class="nav-links">
          <a href="/employees">${t.employees}</a>
          <a href="/add-employee">${t.addNew}</a>
          <select @change="${this.changeLanguage}">
            <option value="en" ?selected="${this.language === 'en'}">English</option>
            <option value="tr" ?selected="${this.language === 'tr'}">Türkçe</option>
          </select>
        </div>
      </nav>
    `;
  }
}
