import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Card, Loader, PageHeader } from "../components/ui";
import { api } from "../lib/api";
import { date, priorityClass, statusClass, titleCase } from "../lib/format";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then(({ data }) => setProject(data.data));
  }, [id]);

  if (!project) return <Loader />;

  return (
    <>
      <PageHeader title={project.title} description={project.description || "Project workspace"} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Project tasks</h2></div>
          <div className="divide-y divide-line">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div><p className="font-semibold">{task.title}</p><p className="text-sm text-slate-500">{task.description}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={priorityClass[task.priority]}>{titleCase(task.priority)}</Badge>
                  <Badge className={statusClass[task.status]}>{titleCase(task.status)}</Badge>
                  <span className="text-sm text-slate-500">{date(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Members</h2>
            <div className="space-y-3">{project.members.map((member) => <div key={member.id} className="flex items-center gap-3"><img src={member.avatar} className="h-9 w-9 rounded-full border border-line" alt="" /><div><p className="text-sm font-semibold">{member.name}</p><p className="text-xs text-slate-500">{member.email}</p></div></div>)}</div>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Activity</h2>
            <div className="space-y-4">{project.activities.map((activity) => <div key={activity.id}><p className="text-sm font-medium text-slate-700">{activity.message}</p><p className="text-xs text-slate-400">{date(activity.createdAt)}</p></div>)}</div>
          </Card>
        </div>
      </div>
    </>
  );
}
