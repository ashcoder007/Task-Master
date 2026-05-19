import { Card, PageHeader } from "../components/ui";

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Workspace deployment and security configuration." />
      <Card className="max-w-3xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Setting title="JWT authentication" value="Enabled" />
          <Setting title="Role permissions" value="Admin / Member" />
          <Setting title="Rate limiting" value="300 requests / 15 min" />
          <Setting title="Deployment" value="Railway ready" />
        </div>
      </Card>
    </>
  );
}

const Setting = ({ title, value }) => <div className="rounded-lg border border-line p-4"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{value}</p></div>;
