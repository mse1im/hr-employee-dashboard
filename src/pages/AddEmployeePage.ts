import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { addEmployee } from "../store/employeeSlice";
import store from "../store/store";

@customElement("add-employee-page")
export class AddEmployeePage extends LitElement {
  @state()
  employee = {
    id: Date.now(), // ID'yi benzersiz yapmak için Date.now() kullanıyoruz
    firstName: "",
    lastName: "",
    employmentDate: "",
    birthDate: "",
    phone: "",
    email: "",
    department: "",
    position: ""
  };

  updateField(e: Event, field: string) {
    const target = e.target as HTMLInputElement;
    this.employee = { ...this.employee, [field]: target.value };
  }

  submitForm() {
    store.dispatch(addEmployee(this.employee));
    alert("✅ Çalışan eklendi!");
    
    // ✅ Tablonun güncellenmesini sağla
    const table = document.querySelector("employee-table") as any;
    if (table) {
      table.employees = [...store.getState().employees]; // Redux'tan en güncel veriyi al
      table.requestUpdate(); // ✅ UI'yı zorla güncelle
    }
  
    window.location.href = "/employees";
  }
  

  render() {
    return html`
      <div class="p-6">
        <h1 class="text-3xl font-bold">Yeni Çalışan Ekle</h1>
        <form @submit="${(e: Event) => { e.preventDefault(); this.submitForm(); }}">
          <label>First Name: <input type="text" .value="${this.employee.firstName}" @input="${(e) => this.updateField(e, 'firstName')}" required /></label><br/>
          <label>Last Name: <input type="text" .value="${this.employee.lastName}" @input="${(e) => this.updateField(e, 'lastName')}" required /></label><br/>
          <label>Employment Date: <input type="date" .value="${this.employee.employmentDate}" @input="${(e) => this.updateField(e, 'employmentDate')}" required /></label><br/>
          <label>Birth Date: <input type="date" .value="${this.employee.birthDate}" @input="${(e) => this.updateField(e, 'birthDate')}" required /></label><br/>
          <label>Phone: <input type="tel" .value="${this.employee.phone}" @input="${(e) => this.updateField(e, 'phone')}" required /></label><br/>
          <label>Email: <input type="email" .value="${this.employee.email}" @input="${(e) => this.updateField(e, 'email')}" required /></label><br/>
          <label>Department: <input type="text" .value="${this.employee.department}" @input="${(e) => this.updateField(e, 'department')}" required /></label><br/>
          <label>Position: <input type="text" .value="${this.employee.position}" @input="${(e) => this.updateField(e, 'position')}" required /></label><br/>
          <button type="submit">Ekle</button>
        </form>
      </div>
    `;
  }
}
