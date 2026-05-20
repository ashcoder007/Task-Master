import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Card, Input, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registerSchema = loginSchema.extend({ name: z.string().min(2), role: z.enum(["ADMIN", "MEMBER"]) });

export function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const submit = async (values) => {
    try {
      await login(values);
      toast.success("Welcome back");
      navigate("/app/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return <AuthShell title="Log in to TaskMaster" subtitle="Access your workspace with your registered email and password.">
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
      <Button className="w-full" disabled={isSubmitting}>Log in <ArrowRight className="h-4 w-4" /></Button>
      <p className="text-center text-sm text-slate-500">New here? <Link className="font-semibold text-ink" to="/register">Create account</Link></p>
    </form>
  </AuthShell>;
}

export function Register() {
  const { register: createAccount } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", password: "", role: "MEMBER" } });

  const submit = async (values) => {
    try {
      await createAccount(values);
      toast.success("Account created");
      navigate("/app/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return <AuthShell title="Create your workspace account" subtitle="Choose Admin to manage projects and members, or Member to focus on assigned work.">
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Name" {...register("name")} error={errors.name?.message} />
      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
      <Select label="Role" {...register("role")}><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></Select>
      <Button className="w-full" disabled={isSubmitting}>Create account <ArrowRight className="h-4 w-4" /></Button>
      <p className="text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-ink" to="/login">Log in</Link></p>
    </form>
  </AuthShell>;
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-[#f7f8fb] lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 text-lg font-bold"><span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-ink">TM</span>TaskMaster</Link>
        <div className="max-w-xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-slate-300">Modern SaaS workspace</p>
          <h1 className="text-5xl font-bold leading-tight">Plan projects, move tasks, and measure team momentum.</h1>
          <p className="mt-5 text-lg text-slate-300">A clean operational layer for teams that need accountability without interface clutter.</p>
        </div>
      </section>
      <section className="grid place-items-center p-6">
        <Card className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </Card>
      </section>
    </div>
  );
}
