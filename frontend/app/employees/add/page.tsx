"use client";

import { useState } from "react";
import { employeeApi } from "@/lib/employee-api";
import { useRouter } from "next/navigation";

export default function AddEmployee() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    department_id: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await employeeApi.create(form);
      router.push("/employees");
    } catch (err) {
      console.error(err);
      alert("Failed to create employee");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="full_name" placeholder="Full Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input name="position" placeholder="Position" onChange={handleChange} />
      <input name="department_id" placeholder="Department ID" onChange={handleChange} />

      <button type="submit">Create</button>
    </form>
  );
}