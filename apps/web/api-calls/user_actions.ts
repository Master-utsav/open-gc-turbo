"use server";

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HTTP_API_URL! || "https://localhost:3001/api/v1",
});


export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const about = formData.get("about") as string;

  await api.post("/users", { email, name, about });
}

export async function getUsers() {
  const { data } = await api.get("/users");
  return data.users;
}