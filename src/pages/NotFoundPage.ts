import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import locales from "../locales";
import { RootState } from '../store/store';
@customElement('not-found-page')
export class NotFoundPage extends LitElement {
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
      <h1 class="text-[#ff6101] font-bold text-2xl">${t.notfound}</h1>
      <a href="/" class="text-[#ff6101] underline">${t.notfoundhome}</a>
    `;
  }
}
