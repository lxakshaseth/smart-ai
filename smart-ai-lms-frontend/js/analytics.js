import { apiRequest } from "./api.js";

async function loadAnalytics() {
    try {
        const data = await apiRequest("/analytics/overview");

        document.getElementById("riskScore").innerText = data.riskScore;
        document.getElementById("trend").innerText = data.performanceTrend;
        document.getElementById("confidence").innerText = data.confidenceLevel;
        document.getElementById("readiness").innerText = data.readinessStatus;

        renderMasteryChart(data.subjectStats);
        renderAccuracyGraph(data.weeklyAccuracyTrend);

    } catch (err) {
        console.error(err);
    }
}

loadAnalytics();
function renderMasteryChart(subjectStats) {
    const labels = subjectStats.map(s => s.subject);
    const values = subjectStats.map(s => s.mastery);

    new Chart(document.getElementById("masteryChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Subject Mastery",
                data: values
            }]
        }
    });
}
