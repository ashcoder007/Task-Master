import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button, Card, EmptyState, Input, Loader, Modal, PageHeader, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";

const schema = z.object({ title: z.string().min(2), description: z.string().optional() });

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const load = () => api.get("/projects").then(({ data }) => setProjects(data.data));
  useEffect(() => { load(); }, []);

  const submit = async (values) => {
    try {
      await api.post("/projects", values);
      toast.success("Project created");
      reset();
      setOpen(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create project");
    }
  };

  if (!projects) return <Loader />;

  return (
    <>
      <PageHeader title="Projects" description={isAdmin ? "Create, edit, and manage team workspaces." : "Projects you are assigned to."} action={isAdmin && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New project</Button>} />
      {projects.length === 0 ? <EmptyState title="No projects yet" description={isAdmin ? "Create your first workspace project." : "You have not been added to a project."} /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => <ProjectCard key={project.id} project={project} reload={load} />)}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Create project">
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <Input label="Project title" {...register("title")} error={errors.title?.message} />
          <Textarea label="Description" {...register("description")} />
          <Button disabled={isSubmitting}>Create project</Button>
        </form>
      </Modal>
    </>
  );
}

function ProjectCard({ project, reload }) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");

  const addMember = async () => {
    try {
      await api.post(`/projects/${project.id}/members`, { email });
      setEmail("");
      toast.success("Member added");
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add member");
    }
  };

  const removeProject = async () => {
    if (!confirm("Delete this project and all related tasks?")) return;
    await api.delete(`/projects/${project.id}`);
    toast.success("Project deleted");
    reload();
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div><Link to={`/app/projects/${project.id}`} className="text-lg font-bold hover:underline">{project.title}</Link><p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description || "No description"}</p></div>
        {isAdmin && <button onClick={removeProject} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>}
      </div>
      <div className="mt-5 flex -space-x-2">{project.members.slice(0, 5).map((member) => <img key={member.id} src={member.avatar} className="h-8 w-8 rounded-full border-2 border-white" alt="" />)}</div>
      <p className="mt-4 text-sm text-slate-500">{project.tasks.length} tasks · {project.members.length} members</p>
      {isAdmin && <div className="mt-4 flex gap-2"><Input placeholder="member@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /><Button variant="secondary" onClick={addMember}><UserPlus className="h-4 w-4" /></Button></div>}
    </Card>
  );
}
