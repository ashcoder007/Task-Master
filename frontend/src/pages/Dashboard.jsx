import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Briefcase, CheckSquare, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Loader, PageHeader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { date } from "../lib/format";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Loader />;

  const statusData = ["TODO", "IN_PROGRESS", "DONE"].map((name) => ({ name: name.replace("_", " "), value: stats.status[name] || 0 }));
  const priorityData = ["LOW", "MEDIUM", "HIGH"].map((name) => ({ name, value: stats.priority[name] || 0 }));

  return (
    <>
      <PageHeader title={`${isAdmin ? "Admin" : "Member"} Dashboard`} description={`Welcome back, ${user.name}. Here is the current workspace signal.`} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Briefcase} label="Projects" value={stats.totals.projects} />
        <Metric icon={Users} label={isAdmin ? "Users" : "Collaborators"} value={stats.totals.users} onClick={isAdmin ? () => navigate("/app/users") : undefined} />
        <Metric icon={CheckSquare} label={isAdmin ? "Total tasks" : "Assigned tasks"} value={stats.totals.tasks} />
        <Metric icon={AlertTriangle} label="Overdue" value={stats.totals.overdue} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Tasks by status</h2>
          <div className="h-72"><ResponsiveContainer><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#111827" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">{isAdmin ? "Team productivity" : "Personal task mix"}</h2>
          <div className="h-72"><ResponsiveContainer><AreaChart data={isAdmin && stats.productivity.length ? stats.productivity : priorityData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey={isAdmin && stats.productivity.length ? "done" : "value"} stroke="#0f766e" fill="#ccfbf1" /></AreaChart></ResponsiveContainer></div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">{isAdmin ? "Recent activity" : "Your recent activity"}</h2>
          <div className="space-y-4">
            {stats.activities.map((activity) => <Activity key={activity.id} activity={activity} />)}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Upcoming deadlines</h2>
          <div className="space-y-3">
            {stats.upcoming.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-line p-3">
                <div><p className="font-semibold">{task.title}</p><p className="text-sm text-slate-500">{task.project.title}</p></div>
                <span className="flex items-center gap-1 text-sm font-medium text-slate-600"><Clock className="h-4 w-4" />{date(task.dueDate)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value, onClick }) {
  const content = <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100"><Icon className="h-5 w-5 text-slate-700" /></div></div>;

  if (onClick) {
    return <button onClick={onClick} className="rounded-lg text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-slate-200"><Card className="p-5">{content}</Card></button>;
  }

  return <Card className="p-5">{content}</Card>;
}

function Activity({ activity }) {
  return <div className="flex gap-3"><img src={activity.user?.avatar} className="h-9 w-9 rounded-full border border-line" alt="" /><div><p className="text-sm font-medium text-slate-700">{activity.message}</p><p className="text-xs text-slate-400">{date(activity.createdAt)}</p></div></div>;
}
