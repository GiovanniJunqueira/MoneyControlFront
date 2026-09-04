import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-5 pb-24 pt-6 md:px-10 md:pb-10 md:pt-10">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
