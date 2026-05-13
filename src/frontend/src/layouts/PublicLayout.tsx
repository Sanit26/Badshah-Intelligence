import { Outlet } from "@tanstack/react-router";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Outlet />
    </div>
  );
}
