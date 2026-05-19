import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge, Button, Card, EmptyState, Input, Loader, Modal, PageHeader, Select, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { date, priorityClass, statusClass, titleCase } from "../lib/format";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  projectId: z.string().min(1),
  assignedTo: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional()
});

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { priority: "MEDIUM" } });

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    api.get("/tasks", { params }).then(({ data }) => setTasks(data.data));
    api.get("/projects").then(({ data }) => setProjects(data.data));
  };

  useEffect(() => { load(); }, [filters.status, filters.priority]);

  const submit = async (values) => {
    try {
      await api.post("/tasks", { ...values, dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null, assignedTo: values.assignedTo || null });
      toast.success("Task created");
      reset({ priority: "MEDIUM" });
      setOpen(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create task");
    }
  };

  const selectedProject = projects.find((project) => project.id === watch("projectId"));
  const members = selectedProject?.members || [];

  if (!tasks) return <Loader />;

  return (
    <>
      <PageHeader title={isAdmin ? "Tasks" : "My Tasks"} description={isAdmin ? "Search, filter, assign, and manage task execution." : "Track and update your assigned work."} action={isAdmin && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New task</Button>} />
      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input className="pl-9" placeholder="Search tasks" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option value="TODO">Todo</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></Select>
          <Select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select>
          <Button variant="secondary" onClick={load}>Apply</Button>
        </div>
      </Card>
      {tasks.length === 0 ? <EmptyState title="No tasks found" description="Try changing filters or creating a new task." /> : <TaskTable tasks={tasks} reload={load} />}
      <Modal open={open} onClose={() => setOpen(false)} title="Create task">
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <Input label="Title" {...register("title")} error={errors.title?.message} />
          <Textarea label="Description" {...register("description")} />
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Project" {...register("projectId")}><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</Select>
            <Select label="Assignee" {...register("assignedTo")}><option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</Select>
            <Select label="Priority" {...register("priority")}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select>
            <Input label="Due date" type="date" {...register("dueDate")} />
          </div>
          <Button disabled={isSubmitting}>Create task</Button>
        </form>
      </Modal>
    </>
  );
}

function TaskTable({ tasks, reload }) {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const updateStatus = async (task, status) => {
    await api.put(`/tasks/${task.id}`, { status });
    toast.success("Status updated");
    reload();
  };

  const remove = async (task) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${task.id}`);
    toast.success("Task deleted");
    reload();
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Task</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tasks.map((task) => (
              <tr key={task.id} className="bg-white">
                <td className="px-4 py-4"><p className="font-semibold text-slate-800">{task.title}</p><p className="text-slate-500">{task.description}</p></td>
                <td className="px-4 py-4">{task.project.title}</td>
                <td className="px-4 py-4">{task.assignee?.name || "Unassigned"}</td>
                <td className="px-4 py-4"><Badge className={priorityClass[task.priority]}>{titleCase(task.priority)}</Badge></td>
                <td className="px-4 py-4"><select value={task.status} onChange={(e) => updateStatus(task, e.target.value)} className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${statusClass[task.status]}`}><option value="TODO">Todo</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select></td>
                <td className="px-4 py-4">{date(task.dueDate)}</td>
                <td className="px-4 py-4 text-right">{isAdmin && <button onClick={() => remove(task)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
