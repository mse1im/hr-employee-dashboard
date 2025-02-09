import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import store, { RootState } from "../store/store";
import { setPage } from "../store/paginationSlice";
import { removeEmployee, Employee } from "../store/employeeSlice";
import locales from "../locales";
import "./UpsertModal";

@customElement("employee-table")
export class EmployeeTable extends connect(store)(LitElement) {
  createRenderRoot() {
    return this;
  }

  @state() employees: Employee[] = [];
  @state() currentPage: number = 1;
  @state() language: string = "en";

  @state() selectedEmployee: Employee | null = null;
  @state() showModal: boolean = false;

  @state() showDeleteModal: boolean = false;
  @state() employeeIdToDelete: number | null = null;

  itemsPerPage: number = 5;

  stateChanged(state: RootState) {
    this.employees = JSON.parse(JSON.stringify(state.employees));
    this.currentPage = state.pagination.currentPage;
    this.language = state.language.language;
    this.requestUpdate();
  }

  openUpsertModal(emp: Employee | null = null) {
    this.selectedEmployee = emp ? { ...emp } : null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedEmployee = null;
  }

  openDeleteModal(empId: number) {
    this.employeeIdToDelete = empId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.employeeIdToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (this.employeeIdToDelete !== null) {
      store.dispatch(removeEmployee(this.employeeIdToDelete));
    }
    this.closeDeleteModal();
  }

  totalPages() {
    return Math.ceil(this.employees.length / this.itemsPerPage);
  }

  getPaginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return [...this.employees].slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      store.dispatch(setPage(page));
      this.requestUpdate();
    }
  }

  generatePageNumbers() {
    const total = this.totalPages();
    const current = this.currentPage;
    const range: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        range.push(i);
      }
    } else {
      range.push(1);
      if (current > 4) {
        range.push("...");
      }
      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      if (current < total - 3) {
        range.push("...");
      }
      range.push(total);
    }
    return range;
  }

  render() {
    const t = locales[this.language]?.table || locales["en"].table;
    const btnT = locales[this.language]?.buttons || locales["en"].buttons;

    return html`
      <div class="overflow-x-auto">
        <table class="table-auto w-full border-collapse bg-white">
          <thead>
            <tr>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.firstName}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.lastName}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.employmentDate}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.birthDate}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.phone}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.email}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.department}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.position}
              </th>
              <th class="p-[10px] border border-gray-300 text-left">
                ${t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            ${this.getPaginatedEmployees().map(
              (emp) => html`
                <tr>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.firstName}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.lastName}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.employmentDate}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.birthDate}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.phone}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.email}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.department}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    ${emp.position}
                  </td>
                  <td class="p-[10px] border border-gray-300">
                    <button
                      class="bg-[#ff6101] text-white px-3 py-1 rounded cursor-pointer"
                      @click="${() => this.openUpsertModal(emp)}"
                    >
                      ${btnT.edit}
                    </button>
                    <button
                      class="bg-[#ff6101] text-white px-3 py-1 rounded ml-2 cursor-pointer"
                      @click="${() => this.openDeleteModal(emp.id)}"
                    >
                      ${btnT.delete}
                    </button>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>

      <div class="flex justify-center gap-2 mt-4">
        <!-- Önceki Sayfa -->
        <button
          class="px-4 py-2 cursor-pointer text-[#ff6101] rounded-full disabled:text-gray-400 disabled:cursor-not-allowed"
          @click="${() => this.changePage(this.currentPage - 1)}"
          ?disabled="${this.currentPage === 1}"
        >
          ${t.prev}
        </button>

        ${this.generatePageNumbers().map((page) =>
          typeof page === "number"
            ? html`
                <button
                  class="cursor-pointer py-2 px-4 text-gray-500 rounded-full
                  ${this.currentPage === page ? "bg-[#ff6101] text-white" : ""}"
                  @click="${() => this.changePage(page)}"
                >
                  ${page}
                </button>
              `
            : html`<span class="px-2">...</span>`
        )}

        <button
          class="px-4 py-2 cursor-pointer text-[#ff6101] rounded-full disabled:text-gray-400 disabled:cursor-not-allowed"
          @click="${() => this.changePage(this.currentPage + 1)}"
          ?disabled="${this.currentPage === this.totalPages()}"
        >
          ${t.next}
        </button>
      </div>

      <upsert-modal
        .showModal="${this.showModal}"
        .language="${this.language}"
        .selectedEmployee="${this.selectedEmployee}"
        @close-modal="${this.closeModal}"
      ></upsert-modal>

      ${this.showDeleteModal
        ? html`
            <div
              class="fixed top-0 left-0 w-full h-full bg-black/50"
              @click="${this.closeDeleteModal}"
            ></div>
            <div
              class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
               bg-white p-5 w-[350px] shadow-lg z-[1000] rounded"
            >
              <p>${t.deleteConfirm}</p>
              <div class="flex gap-2 justify-end mt-4">
                <button
                  class="bg-green-600 text-white px-3 py-2 rounded"
                  @click="${this.confirmDelete}"
                >
                  ${t.yes}
                </button>
                <button
                  class="bg-red-600 text-white px-3 py-2 rounded"
                  @click="${this.closeDeleteModal}"
                >
                  ${t.no}
                </button>
              </div>
            </div>
          `
        : ""}
    `;
  }
}