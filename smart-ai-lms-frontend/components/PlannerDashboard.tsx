"use client";

import { useState } from "react";

export default function PlannerDashboard() {
  const [data, setData] = useState<any>(null);

  async function analyzeGoal(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const body = {
      goalSubject: formData.get("subject"),
      targetPercent: formData.get("target"),
      currentPercent: formData.get("current"),
      examDate: formData.get("examDate")
    };

    const res = await fetch("http://localhost:5000/api/planner/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    setData(result);
  }

  return (
    <div className="p-10 text-white bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">AI Smart Study Planner</h1>

      <form onSubmit={analyzeGoal} className="bg-slate-800 p-6 rounded-xl space-y-4">
        <input name="subject" placeholder="Subject (DSA)" className="p-2 rounded bg-slate-700 w-full"/>
        <input name="target" placeholder="Target % (80)" className="p-2 rounded bg-slate-700 w-full"/>
        <input name="current" placeholder="Current % (60)" className="p-2 rounded bg-slate-700 w-full"/>
        <input name="examDate" type="date" className="p-2 rounded bg-slate-700 w-full"/>

        <button className="bg-blue-600 px-4 py-2 rounded">Analyze Goal</button>
      </form>

      {data && (
        <div className="mt-8 space-y-6">

          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold">Risk Level: {data.riskLevel}</h2>
            <div className="w-full bg-slate-700 h-3 rounded mt-2">
              <div
                className="h-3 bg-yellow-400 rounded"
                style={{ width: `${data.riskPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-blue-700 p-6 rounded-xl">
            <h2 className="font-semibold">Weekly Suggestion</h2>
            <p>{data.weeklySuggestion}</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="font-semibold">Today's Tasks</h2>
            <ul className="list-disc ml-5">
              {data.todayTasks?.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="font-semibold">Tomorrow Focus</h2>
            <ul className="list-disc ml-5">
              {data.tomorrowFocus?.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
