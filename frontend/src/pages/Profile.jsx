import { Card, PageHeader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { date } from "../lib/format";

export default function Profile() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Profile" description="Your account details and workspace role." />
      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-4"><img src={user.avatar} className="h-16 w-16 rounded-full border border-line" alt="" /><div><h2 className="text-xl font-bold">{user.name}</h2><p className="text-sm text-slate-500">{user.email}</p></div></div>
        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Role" value={user.role} />
          <Info label="Joined" value={date(user.createdAt)} />
        </dl>
      </Card>
    </>
  );
}

const Info = ({ label, value }) => <div className="rounded-lg border border-line p-4"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
