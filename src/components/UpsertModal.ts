import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import store from "../store/store";
import { addEmployee, updateEmployee, Employee } from "../store/employeeSlice";
import locales from "../locales";

function toInputDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
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

@customElement("upsert-modal")
export class UpsertModal extends connect(store)(LitElement) {
  createRenderRoot() {
    return this;
  }

  @property({ type: Boolean }) showModal = false;
  @property({ type: String }) language = "en";
  @property({ type: Object }) selectedEmployee: Employee | null = null;
  @state() localEmployee: Employee = this.createEmptyEmployee();

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (changedProps.has("selectedEmployee") || changedProps.has("showModal")) {
      if (this.showModal) {
        if (this.selectedEmployee) {
          this.localEmployee = { ...this.selectedEmployee };
        } else {
          this.localEmployee = this.createEmptyEmployee();
        }
      }
    }
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

  updateField(e: Event, field: keyof Employee) {
    const target = e.target as HTMLInputElement;
    this.localEmployee = {
      ...this.localEmployee,
      [field]:
        field === "employmentDate" || field === "birthDate"
          ? fromInputDate(target.value)
          : target.value,
    };
  }

  validateEmployee(): boolean {
    const modalT = locales[this.language]?.modal || locales["en"].modal;
    const emp = this.localEmployee;
    if (
      !emp.firstName.trim() ||
      !emp.lastName.trim() ||
      !emp.employmentDate ||
      !emp.birthDate ||
      !emp.phone.trim() ||
      !emp.email.trim()
    ) {
      alert(modalT.fillRequiredFields || "Please fill all required fields.");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emp.email)) {
      alert(modalT.invalidEmail || "Please enter a valid email address.");
      return false;
    }
    const phonePattern = /^\+?\d{10,}$/;
    if (!phonePattern.test(emp.phone)) {
      alert(modalT.invalidPhone || "Please enter a valid phone number.");
      return false;
    }
    return true;
  }

  saveEmployee() {
    if (!this.validateEmployee()) return;
    if (this.selectedEmployee) {
      store.dispatch(updateEmployee(this.localEmployee));
    } else {
      store.dispatch(addEmployee(this.localEmployee));
    }
    this.closeModal();
  }

  closeModal() {
    this.dispatchEvent(new CustomEvent("close-modal", { bubbles: true, composed: true }));
  }

  render() {
    if (!this.showModal) {
      return html``;
    }
    const modalT = locales[this.language]?.modal || locales["en"].modal;
    const btnT = locales[this.language]?.buttons || locales["en"].buttons;
    const tableT = locales[this.language]?.table || locales["en"].table;
    const departments = tableT.departments || [];
    const positions = tableT.positions || [];
    const emp = this.localEmployee;
    return html`
      <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-[999]" @click="${this.closeModal}"></div>
      <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 w-[450px] shadow-lg z-[1000] rounded">
        <h2 class="text-xl font-bold mb-4">${this.selectedEmployee ? modalT.editTitle : modalT.addTitle}</h2>
        <label class="block mb-1 font-bold">${modalT.firstName}:</label>
        <input
          type="text"
          class="w-full p-2 mb-2 border border-gray-300 rounded"
          .value="${emp.firstName}"
          @input="${(e: Event) => this.updateField(e, "firstName")}"
        />
        <label class="block mb-1 font-bold">${modalT.lastName}:</label>
        <input
          type="text"
          class="w-full p-2 mb-2 border border-gray-300 rounded"
          .value="${emp.lastName}"
          @input="${(e: Event) => this.updateField(e, "lastName")}"
        />
        <label class="block mb-1 font-bold">${modalT.employmentDate}:</label>
        <input
          type="date"
          class="w-full p-2 mb-2 border border-gray-300 rounded"
          .value="${toInputDate(emp.employmentDate)}"
          @input="${(e: Event) => this.updateField(e, "employmentDate")}"
        />
        <label class="block mb-1 font-bold">${modalT.birthDate}:</label>
        <input
          type="date"
          class="w-full p-2 mb-2 border border-gray-300 rounded"
          .value="${toInputDate(emp.birthDate)}"
          @input="${(e: Event) => this.updateField(e, "birthDate")}"
        />
        <label class="block mb-1 font-bold">${modalT.phone}:</label>
        <input
          type="tel"
          class="w-full p-2 mb-2 border border-gray-300 rounded"
          .value="${emp.phone}"
          @input="${(e: Event) => this.updateField(e, "phone")}"
        />
        <label class="block mb-1 font-bold">${modalT.email}:</label>
        <input
          type="email"
          class="w-full p-2 mb-2 border border-gray-300 rounded"
          .value="${emp.email}"
          @input="${(e: Event) => this.updateField(e, "email")}"
        />
        <label class="block mb-1 font-bold">${modalT.department}:</label>
        <select
          class="w-full p-2 mb-2 border border-gray-300 rounded"
          @change="${(e: Event) => this.updateField(e, "department")}"
        >
          <option value="" disabled ?selected="${!emp.department}">Select Department</option>
          ${departments.map((dept: string) => html`
            <option value="${dept}" ?selected="${emp.department === dept}">${dept}</option>
          `)}
        </select>
        <label class="block mb-1 font-bold">${modalT.position}:</label>
        <select
          class="w-full p-2 mb-4 border border-gray-300 rounded"
          @change="${(e: Event) => this.updateField(e, "position")}"
        >
          <option value="" disabled ?selected="${!emp.position}">Select Position</option>
          ${positions.map((pos: string) => html`
            <option value="${pos}" ?selected="${emp.position === pos}">${pos}</option>
          `)}
        </select>
        <div class="mt-4 flex gap-2 justify-end">
          <button class="bg-green-600 cursor-pointer text-white px-3 py-2 rounded" @click="${this.saveEmployee}">${btnT.save}</button>
          <button class="bg-red-600 cursor-pointer text-white px-3 py-2 rounded" @click="${this.closeModal}">${btnT.cancel}</button>
        </div>
      </div>
    `;
  }
}