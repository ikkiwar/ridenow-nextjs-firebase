"use client";
import RequireAuth from "../components/RequireAuth";
import HomePage from "./HomePage";

export default function Home() {
  return (
    <RequireAuth>
      <HomePage />
    </RequireAuth>
  );
}
