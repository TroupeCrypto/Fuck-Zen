"use client";

import { useEffect, useState } from "react";

export default function IDecydeApplicantGenerator() {
  const [form, setForm] = useState({
    count: 1,
    job_title: "",
    department: "",
    subdepartment: "",
    with_avatar: false
  });
  const [created, setCreated] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/idecyde/employees/list");
      if (!res.ok) {
        throw new Error("Failed to load employees");
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.employees || [];
      setEmployees(list);
    } catch (err) {
      setError(err?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (form.with_avatar) {
        params.set("with_avatar", "true");
      }

      const res = await fetch(`/api/idecyde/employees/create${params.toString() ? `?${params.toString()}` : ""}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          count: Number(form.count) || 1,
          job_title: form.job_title,
          department: form.department,
          subdepartment: form.subdepartment
        })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Creation failed");
      }

      const data = await res.json();
      setCreated(data?.created || []);
      await fetchEmployees();
    } catch (err) {
      setError(err?.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">iDecyde Applicant Generator</h2>
        <button
          type="button"
          onClick={fetchEmployees}
          className="rounded-md border border-slate-600 px-3 py-1 text-sm font-medium text-slate-100 hover:bg-slate-800"
          disabled={loading || submitting}
        >
          {loading ? "Refreshing..." : "Refresh list"}
        </button>
      </div>

      {error ? <div className="rounded-md border border-red-500/60 bg-red-900/30 px-3 py-2 text-sm text-red-100">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Count (max 25)
            <input
              type="number"
              min="1"
              max="25"
              value={form.count}
              onChange={e => updateField("count", e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Job Title
            <input
              type="text"
              value={form.job_title}
              onChange={e => updateField("job_title", e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Department
            <input
              type="text"
              value={form.department}
              onChange={e => updateField("department", e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Subdepartment
            <input
              type="text"
              value={form.subdepartment}
              onChange={e => updateField("subdepartment", e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              required
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={form.with_avatar}
            onChange={e => updateField("with_avatar", e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
          />
          Generate avatar (if available)
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Generating..." : "Generate"}
          </button>
          {created.length > 0 ? (
            <div className="text-sm text-slate-200">
              Created: {created.map(item => item.name).join(", ")}
            </div>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-slate-100">Roster</h3>
        <div className="space-y-2">
          {employees.length === 0 ? (
            <div className="text-sm text-slate-300">No employees generated yet.</div>
          ) : (
            employees.map(person => (
              <div
                key={person.slug}
                className="flex flex-col justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/60 p-3 md:flex-row md:items-center"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-white">{person.name}</div>
                  <div className="text-sm text-slate-300">
                    {person.job_title} · {person.assigned_system}
                  </div>
                  <div className="text-xs text-slate-400">
                    {person.department} / {person.subdepartment}
                  </div>
                </div>
                <a
                  href={`/api/idecyde/employees/txt/${person.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Download TXT
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
