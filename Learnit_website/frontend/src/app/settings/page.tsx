// app/settings/page.tsx
'use client'

import SettingsPage from "./SettingsPage";  // Adjust the import path based on where you save the component
import { Toaster } from "sonner";

export default function Settings() {
  return (
    <>
      <SettingsPage />
      <Toaster />
    </>
  );
}