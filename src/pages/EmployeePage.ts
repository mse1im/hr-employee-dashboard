import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../components/EmployeeTable.ts";

@customElement("employee-page")
export class EmployeePage extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="p-6">
        <h1 class="text-3xl font-bold text-blue-600">Çalışan Listesi</h1>
        <employee-table></employee-table> <!-- 📌 Tablo burada çağrılıyor -->
      </div>
    `;
  }
}
