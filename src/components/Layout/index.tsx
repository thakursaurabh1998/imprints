import React from "react";
import HeaderDrawer from "../HeaderDrawer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderDrawer />
      <main>{children}</main>
    </>
  );
}
