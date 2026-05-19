import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function NotFound() {
  return <div className="grid min-h-screen place-items-center bg-[#f7f8fb] p-6 text-center"><div><p className="text-sm font-bold uppercase tracking-widest text-slate-500">404</p><h1 className="mt-3 text-4xl font-bold">Page not found</h1><p className="mt-3 text-slate-500">The page you are looking for does not exist.</p><Link to="/app/dashboard" className="mt-6 inline-block"><Button>Go to dashboard</Button></Link></div></div>;
}
