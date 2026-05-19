import { ArrowRight, BarChart3, CheckCircle2, KanbanSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function Landing() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 font-bold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">TM</span>TaskMaster</Link>
        <div className="flex gap-2">
          <Link to="/login"><Button variant="secondary">Login</Button></Link>
          <Link to="/register"><Button>Get started</Button></Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_520px] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Task management SaaS</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-ink md:text-6xl">Run focused team work from one calm dashboard.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Projects, role-aware dashboards, Kanban movement, comments, activity logs, and analytics in a production-ready React and Express application.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register"><Button>Launch workspace <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/login"><Button variant="secondary">View demo account</Button></Link>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-[#f7f8fb] p-4 shadow-xl">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-bold">Launch Board</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live</span>
            </div>
            {[
              ["Finalize onboarding", "High", CheckCircle2],
              ["Review sprint capacity", "Medium", KanbanSquare],
              ["Publish metrics report", "Low", BarChart3]
            ].map(([task, priority, Icon]) => (
              <div key={task} className="mb-3 flex items-center gap-3 rounded-lg border border-line bg-white p-4">
                <Icon className="h-5 w-5 text-slate-500" />
                <div className="flex-1"><p className="font-semibold">{task}</p><p className="text-sm text-slate-500">{priority} priority</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
