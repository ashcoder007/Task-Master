import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Briefcase, CheckSquare, KanbanSquare, LayoutDashboard, LogOut, Menu, Settings, User, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  ["Dashboard", "/app/dashboard", LayoutDashboard],
  ["Users", "/app/users", Users],
  ["Projects", "/app/projects", Briefcase],
  ["Tasks", "/app/tasks", CheckSquare],
  ["Kanban", "/app/kanban", KanbanSquare],
  ["Analytics", "/app/analytics", BarChart3],
  ["Settings", "/app/settings", Settings]
];

const memberLinks = [
  ["Dashboard", "/app/dashboard", LayoutDashboard],
  ["Projects", "/app/projects", Briefcase],
  ["My Tasks", "/app/tasks", CheckSquare],
  ["Kanban", "/app/kanban", KanbanSquare],
  ["Analytics", "/app/analytics", BarChart3],
  ["Profile", "/app/profile", User]
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = isAdmin ? adminLinks : memberLinks;

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-line bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-line px-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-bold text-white">TM</div>
          <div>
            <p className="font-bold leading-tight">TaskMaster</p>
            <p className="text-xs text-slate-500">{user?.role === "ADMIN" ? "Admin Workspace" : "Member Workspace"}</p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {links.map(([label, href, Icon]) => (
            <NavLink
              key={href}
              to={href}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:px-8">
          <button className="rounded-lg border border-line p-2 lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
            <Users className="h-4 w-4" />
            Team task management
          </div>
          <div className="ml-auto flex items-center gap-3">
            <img src={user?.avatar} alt="" className="h-9 w-9 rounded-full border border-line" />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button onClick={signOut} className="rounded-lg border border-line p-2 text-slate-500 hover:bg-slate-100" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
