import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INITIAL_EMPLOYEES } from "../constants/employees";
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employmentDate: string;
  birthDate: string;
  phone: string;
  email: string;
  department: string;
  position: string;
}

const initialState: Employee[] = [...INITIAL_EMPLOYEES];

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    removeEmployee: (state, action: PayloadAction<number>) => {
      return state.filter(emp => emp.id !== action.payload);
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      const newEmployee = { ...action.payload, id: state.length + 1 };
      state.push(newEmployee);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    }
  }
});

export const { addEmployee, removeEmployee, updateEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
