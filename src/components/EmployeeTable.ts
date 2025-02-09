import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import store, { RootState } from "../store/store";
import { setPage } from "../store/paginationSlice";
import { removeEmployee, Employee } from "../store/employeeSlice";

@customElement("employee-table")
export class EmployeeTable extends connect(store)(LitElement) {
  @state() employees: Employee[] = [];
  @state() currentPage: number = 1;
  @state() language: string = "en";

  itemsPerPage: number = 3; // Sayfa başına gösterilecek çalışan sayısı

  static styles = css`
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: left;
    }
    button {
      padding: 6px 12px;
      background-color: #ff4d4f;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }
    button:hover {
      background-color: #ff0000;
    }
  `;

stateChanged(state: RootState) {
  this.employees = JSON.parse(JSON.stringify(state.employees)); // 🔥 Derin Kopya
  console.log("🔄 EmployeeTable Güncellendi, yeni liste:", JSON.stringify(this.employees, null, 2));
  this.requestUpdate(); // 🔄 Zorunlu güncelleme
}




  getPaginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.employees.slice(startIndex, startIndex + this.itemsPerPage);
  }

  totalPages() {
    return Math.ceil(this.employees.length / this.itemsPerPage);
  }

  changePage(page: number) {
    store.dispatch(setPage(page));
  }

  deleteEmployee(empId: number) {
    store.dispatch(removeEmployee(empId));
  }

  render() {
    return html`
      <div class="border p-4 bg-gray-100 rounded-lg mt-4">
        <h2 class="text-xl font-bold text-gray-800">Çalışan Listesi</h2>
        
        <table class="w-full border mt-2">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Date of Employment</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.getPaginatedEmployees().map(emp => html`
              <tr>
                <td>${emp.firstName}</td>
                <td>${emp.lastName}</td>
                <td>${emp.employmentDate}</td>
                <td>${emp.position}</td>
                <td>
                  <a href="/edit-employee?id=${emp.id}" class="text-blue">✏️</a>
                  <button @click="${() => this.deleteEmployee(emp.id)}">🗑️</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>

        <!-- Sayfalama -->
        <div class="flex justify-center gap-2 mt-4">
          <button @click="${() => this.changePage(this.currentPage - 1)}" ?disabled="${this.currentPage === 1}">⬅️</button>
          ${Array.from({ length: this.totalPages() }, (_, i) => i + 1).map(page => html`
            <button
              @click="${() => this.changePage(page)}"
              class="${this.currentPage === page ? 'font-bold underline' : ''}"
            >
              ${page}
            </button>
          `)}
          <button @click="${() => this.changePage(this.currentPage + 1)}" ?disabled="${this.currentPage === this.totalPages()}">➡️</button>
        </div>
      </div>
    `;
  }
}
