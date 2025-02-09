import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import store, { RootState } from "../store/store";
import { setPage } from "../store/paginationSlice";
import {
  removeEmployee,
  addEmployee,
  updateEmployee,
  Employee,
} from "../store/employeeSlice";
import locales from "../locales";

function toInputDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    return dateStr;
  }
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return dateStr;
}

function fromInputDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

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
  @state() localEmployee: Employee = this.createEmptyEmployee();

  @state() showDeleteModal: boolean = false;
  @state() employeeIdToDelete: number | null = null;

  itemsPerPage: number = 5;

  stateChanged(state: RootState) {
    this.employees = JSON.parse(JSON.stringify(state.employees));
    this.currentPage = state.pagination.currentPage;
    this.language = state.language.language;
    this.requestUpdate();
  }

  createEmptyEmployee(): Employee {
    return {
      id: Date.now(),
      firstName: "",
      lastName: "",
      employmentDate: "",
      birthDate: "",
      phone: "",
      email: "",
      department: "",
      position: "",
    };
  }

  openUpsertModal(emp: Employee | null = null) {
    this.selectedEmployee = emp ? { ...emp } : null;
    this.localEmployee = emp ? { ...emp } : this.createEmptyEmployee();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedEmployee = null;
    this.localEmployee = this.createEmptyEmployee();
  }

  updateField(e: Event, field: keyof Employee) {
    const target = e.target as HTMLInputElement;
    if (field === "id") {
      this.localEmployee.id = Number(target.value);
    } else if (field === "employmentDate" || field === "birthDate") {
      this.localEmployee[field] = fromInputDate(target.value);
    } else {
      this.localEmployee[field] = target.value;
    }
    this.requestUpdate();
  }

  validateEmployee(): boolean {
    const modalT = locales[this.language]?.modal || locales["en"].modal;

    if (
      !this.localEmployee.firstName.trim() ||
      !this.localEmployee.lastName.trim() ||
      !this.localEmployee.employmentDate ||
      !this.localEmployee.birthDate ||
      !this.localEmployee.phone.trim() ||
      !this.localEmployee.email.trim()
    ) {
      alert(modalT.fillRequiredFields || "Please fill all required fields.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.localEmployee.email)) {
      alert(modalT.invalidEmail || "Please enter a valid email address.");
      return false;
    }

    const phonePattern = /^\+?\d{10,}$/;
    if (!phonePattern.test(this.localEmployee.phone)) {
      alert(modalT.invalidPhone || "Please enter a valid phone number.");
      return false;
    }

    const isEmailTaken = this.employees.some(
      (e) =>
        e.email.toLowerCase() === this.localEmployee.email.toLowerCase() &&
        e.id !== this.localEmployee.id
    );
    if (isEmailTaken) {
      alert("This email is already in use by another employee.");
      return false;
    }

    return true;
  }

  saveEmployee() {
    if (!this.validateEmployee()) {
      return;
    }

    const isUpdate = !!this.selectedEmployee;
    if (isUpdate) {
      store.dispatch(updateEmployee(this.localEmployee));
    } else {
      store.dispatch(addEmployee(this.localEmployee));
    }
    this.closeModal();
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
    const modalT = locales[this.language]?.modal || locales["en"].modal;
    const btnT = locales[this.language]?.buttons || locales["en"].buttons;

    const departments = t.departments || [];
    const positions = t.positions || [];

    return html`
      <div class="overflow-x-auto">
        <table class="table-auto w-full border-collapse bg-white">
          <thead>
            <tr>
              <th class="p-[10px] border border-gray-300 text-left">${t.firstName}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.lastName}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.employmentDate}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.birthDate}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.phone}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.email}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.department}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.position}</th>
              <th class="p-[10px] border border-gray-300 text-left">${t.actions}</th>
            </tr>
          </thead>
          <tbody>
            ${this.getPaginatedEmployees().map(
              (emp) => html`
                <tr>
                  <td class="p-[10px] border border-gray-300">${emp.firstName}</td>
                  <td class="p-[10px] border border-gray-300">${emp.lastName}</td>
                  <td class="p-[10px] border border-gray-300">${emp.employmentDate}</td>
                  <td class="p-[10px] border border-gray-300">${emp.birthDate}</td>
                  <td class="p-[10px] border border-gray-300">${emp.phone}</td>
                  <td class="p-[10px] border border-gray-300">${emp.email}</td>
                  <td class="p-[10px] border border-gray-300">${emp.department}</td>
                  <td class="p-[10px] border border-gray-300">${emp.position}</td>
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
        <button
          class="px-4 py-2 cursor-pointer text-[#ff6101] rounded-full disabled:text-gray-400 disabled:cursor-not-allowed"
          @click="${() => this.changePage(this.currentPage - 1)}"
          ?disabled="${this.currentPage === 1}"
        >
          <
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
          >
        </button>
      </div>

      ${this.showModal
        ? html`
            <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-[999]" @click="${this.closeModal}"></div>
            <div
              class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                bg-white p-5 w-[450px] shadow-lg z-[1000] rounded"
            >
              <h2 class="text-xl font-bold mb-4">
                ${this.selectedEmployee ? modalT.editTitle : modalT.addTitle}
              </h2>

              <!-- Form Alanları... -->
              <label class="block mb-1 font-bold">${modalT.firstName}:</label>
              <input
                type="text"
                class="w-full p-2 mb-2 border border-gray-300 rounded"
                .value="${this.localEmployee.firstName}"
                @input="${(e: Event) => this.updateField(e, "firstName")}"
                required
              />

              <label class="block mb-1 font-bold">${modalT.lastName}:</label>
              <input
                type="text"
                class="w-full p-2 mb-2 border border-gray-300 rounded"
                .value="${this.localEmployee.lastName}"
                @input="${(e: Event) => this.updateField(e, "lastName")}"
                required
              />

              <label class="block mb-1 font-bold">${modalT.employmentDate}:</label>
              <input
                type="date"
                class="w-full p-2 mb-2 border border-gray-300 rounded"
                .value="${toInputDate(this.localEmployee.employmentDate)}"
                @input="${(e: Event) => this.updateField(e, "employmentDate")}"
                required
              />

              <label class="block mb-1 font-bold">${modalT.birthDate}:</label>
              <input
                type="date"
                class="w-full p-2 mb-2 border border-gray-300 rounded"
                .value="${toInputDate(this.localEmployee.birthDate)}"
                @input="${(e: Event) => this.updateField(e, "birthDate")}"
                required
              />

              <label class="block mb-1 font-bold">${modalT.phone}:</label>
              <input
                type="tel"
                class="w-full p-2 mb-2 border border-gray-300 rounded"
                .value="${this.localEmployee.phone}"
                @input="${(e: Event) => this.updateField(e, "phone")}"
                required
              />

              <label class="block mb-1 font-bold">${modalT.email}:</label>
              <input
                type="email"
                class="w-full p-2 mb-2 border border-gray-300 rounded"
                .value="${this.localEmployee.email}"
                @input="${(e: Event) => this.updateField(e, "email")}"
                required
              />

              <label class="block mb-1 font-bold">${modalT.department}:</label>
              <select
                class="w-full p-2 mb-2 border border-gray-300 rounded"
                @change="${(e: Event) => this.updateField(e, "department")}"
                required
              >
                <option value="" disabled ?selected="${!this.localEmployee.department}">
                  Select Department
                </option>
                ${departments.map(
                  (dept: string) => html`
                    <option
                      value="${dept}"
                      ?selected="${this.localEmployee.department === dept}"
                    >
                      ${dept}
                    </option>
                  `
                )}
              </select>

              <label class="block mb-1 font-bold">${modalT.position}:</label>
              <select
                class="w-full p-2 mb-4 border border-gray-300 rounded"
                @change="${(e: Event) => this.updateField(e, "position")}"
                required
              >
                <option value="" disabled ?selected="${!this.localEmployee.position}">
                  Select Position
                </option>
                ${positions.map(
                  (pos: string) => html`
                    <option
                      value="${pos}"
                      ?selected="${this.localEmployee.position === pos}"
                    >
                      ${pos}
                    </option>
                  `
                )}
              </select>

              <div class="mt-4 flex gap-2">
                <button
                  class="bg-green-600 cursor-pointer text-white px-3 py-2 rounded"
                  @click="${this.saveEmployee}"
                >
                  ${btnT.save}
                </button>
                <button
                  class="bg-red-600 cursor-pointer text-white px-3 py-2 rounded"
                  @click="${this.closeModal}"
                >
                  ${btnT.cancel}
                </button>
              </div>
            </div>
          `
        : ""}

      ${this.showDeleteModal
        ? html`
            <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-[999]" @click="${this.closeDeleteModal}"></div>
            <div
              class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              bg-white p-5 w-[350px] shadow-lg z-[1000] rounded"
            >
              <p class="text-base mb-4">${t.deleteConfirm}</p>
              <div class="flex gap-2 justify-end">
                <button
                  class="bg-green-600 cursor-pointer text-white px-3 py-2 rounded"
                  @click="${this.confirmDelete}"
                >
                  ${t.yes}
                </button>
                <button
                  class="bg-red-600 cursor-pointer text-white px-3 py-2 rounded"
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