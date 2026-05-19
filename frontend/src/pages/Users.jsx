import { ShieldCheck, Trash2, UserRoundCheck, Users as UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, Loader, PageHeader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { date } from "../lib/format";

export default function Users() {
  const [users, setUsers] = useState(null);
  const { isAdmin, user: currentUser } = useAuth();
  const toast = useToast();

  const load = () => api.get("/users").then(({ data }) => setUsers(data.data));

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const removeUser = async (user) => {
    if (!confirm(`Remove ${user.name} from TaskMaster? Their assigned tasks will become unassigned.`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      toast.success("User removed");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove user");
    }
  };

  if (!isAdmin) {
    return <EmptyState title="Admin access required" description="Only workspace admins can manage active users." />;
  }

  if (!users) return <Loader />;

  const admins = users.filter((item) => item.role === "ADMIN").length;
  const members = users.length - admins;

  return (
    <>
      <PageHeader title="Active Users" description="View every active workspace account and remove users when access should end." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SummaryCard icon={UsersIcon} label="Active users" value={users.length} />
        <SummaryCard icon={ShieldCheck} label="Admins" value={admins} />
        <SummaryCard icon={UserRoundCheck} label="Members" value={members} />
      </div>

      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No users found" description="Active users will appear here after registration." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Assigned tasks</th>
                  <th className="px-5 py-3 font-semibold">Projects</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="h-10 w-10 rounded-full border border-line" />
                        <div>
                          <p className="font-semibold text-ink">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={user.role === "ADMIN" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{user._count.assignedTasks}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{user._count.projects}</td>
                    <td className="px-5 py-4 text-slate-500">{date(user.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="danger"
                        className="px-3"
                        disabled={user.id === currentUser.id}
                        onClick={() => removeUser(user)}
                        title={user.id === currentUser.id ? "Current admin cannot be removed" : "Remove user"}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </Card>
  );
}
