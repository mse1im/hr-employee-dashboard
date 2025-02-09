import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('not-found-page')
export class NotFoundPage extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <h1 class="text-red-600 font-bold text-2xl">404 - Sayfa Bulunamadı</h1>
      <a href="/" class="text-blue-500 underline">Ana Sayfa'ya Dön</a>
    `;
  }
}
