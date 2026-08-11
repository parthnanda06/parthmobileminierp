

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
        <h3 className="mt-2 text-sm font-semibold text-slate-900">No content loaded yet</h3>
        <p className="mt-1 text-sm text-slate-500">
          This module is part of a future milestone.
        </p>
      </div>
    </div>
  );
}
