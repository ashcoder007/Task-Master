import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, PageHeader } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { date, priorityClass, titleCase } from "../lib/format";

const columns = [
  ["TODO", "Todo"],
  ["IN_PROGRESS", "In Progress"],
  ["DONE", "Done"]
];

export default function Kanban() {
  const [tasks, setTasks] = useState(null);
  const toast = useToast();

  const load = () => api.get("/tasks", { params: { limit: 100 } }).then(({ data }) => setTasks(data.data));
  useEffect(() => { load(); }, []);

  const drop = async (event, status) => {
    const id = event.dataTransfer.getData("task");
    const task = tasks.find((item) => item.id === id);
    if (!task || task.status === status) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    await api.put(`/tasks/${id}`, { status });
    toast.success("Task moved");
  };

  if (!tasks) return <Loader />;

  return (
    <>
      <PageHeader title="Kanban Board" description="Drag tasks across workflow states." />
      {tasks.length === 0 ? <EmptyState title="No tasks to move" description="Create or assign tasks to populate the board." /> : (
        <div className="grid gap-5 lg:grid-cols-3">
          {columns.map(([status, label]) => (
            <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, status)} className="min-h-[520px] rounded-lg border border-line bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between px-1"><h2 className="font-bold">{label}</h2><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{tasks.filter((task) => task.status === status).length}</span></div>
              <div className="space-y-3">
                {tasks.filter((task) => task.status === status).map((task) => (
                  <Card key={task.id} className="cursor-grab p-4 active:cursor-grabbing" draggable onDragStart={(event) => event.dataTransfer.setData("task", task.id)}>
                    <div className="flex items-start justify-between gap-3"><p className="font-semibold">{task.title}</p><Badge className={priorityClass[task.priority]}>{titleCase(task.priority)}</Badge></div>
                    <p className="mt-2 text-sm text-slate-500">{task.project.title}</p>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500"><span>{task.assignee?.name || "Unassigned"}</span><span>{date(task.dueDate)}</span></div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
