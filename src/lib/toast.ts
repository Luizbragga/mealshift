// src/lib/toast.ts
import * as React from "react";

type ToastOpts = {
  description?: string;
  icon?: React.ReactNode;
  variant?: any;
};

// Aceita os dois formatos:
// 1) toast("Título", { description, icon })
// 2) toast({ title: "Título", description, icon, variant })
export function toast(
  titleOrObj: string | ({ title: string } & ToastOpts),
  opts?: ToastOpts
) {
  if (typeof titleOrObj === "string") {
    const title = titleOrObj;
    console.log("[toast]", { title, ...(opts ?? {}) });
    return;
  }
  const { title, ...rest } = titleOrObj;
  console.log("[toast]", { title, ...rest });
}
