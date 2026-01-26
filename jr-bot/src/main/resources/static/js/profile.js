document.addEventListener("DOMContentLoaded", () => {
    loadStats();
});

async function loadStats() {
    const user = localStorage.getItem("username");
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`/api/platform/stats?username=${user}`);
        if (!response.ok) throw new Error("Erreur réseau");

        const data = await response.json(); // On reçoit la Map<String, StatsDTO>

        // 1. Afficher Global
        updateGlobalStats(data.Global);

        // 2. Afficher les catégories
        updateCategoryCard("bullet-container", data.Bullet);
        updateCategoryCard("blitz-container", data.Blitz);
        updateCategoryCard("rapide-container", data.Rapide);
        updateCategoryCard("daily-container", data.Daily);

    } catch (e) {
        console.error("Erreur stats:", e);
    }
}

function updateGlobalStats(stats) {
    if (!stats || stats.total === 0) {
        document.getElementById("g-total").innerText = "0";
        return;
    }

    document.getElementById("g-wins").innerText = stats.wins;
    document.getElementById("g-losses").innerText = stats.losses;
    document.getElementById("g-draws").innerText = stats.draws;
    document.getElementById("g-total").innerText = stats.total;

    // Pourcentages
    document.getElementById("g-wins-p").innerText = `(${getPercent(stats.wins, stats.total)}%)`;
    document.getElementById("g-losses-p").innerText = `(${getPercent(stats.losses, stats.total)}%)`;
    document.getElementById("g-draws-p").innerText = `(${getPercent(stats.draws, stats.total)}%)`;
}

function updateCategoryCard(elementId, stats) {
    const container = document.getElementById(elementId);
    
    if (!stats || stats.total === 0) {
        container.innerHTML = "<p style='color:#777; font-style:italic;'>Aucune partie jouée</p>";
        return;
    }

    const winP = getPercent(stats.wins, stats.total);
    const drawP = getPercent(stats.draws, stats.total);
    const lossP = getPercent(stats.losses, stats.total);

    // HTML dynamique pour la carte
    const html = `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span style="color:#4caf50">V: ${stats.wins} (${winP}%)</span>
            <span style="color:#90a4ae">N: ${stats.draws} (${drawP}%)</span>
            <span style="color:#e57373">D: ${stats.losses} (${lossP}%)</span>
        </div>
        <div class="progress-bar">
            <div class="pb-win" style="width: ${winP}%"></div>
            <div class="pb-draw" style="width: ${drawP}%"></div>
            <div class="pb-loss" style="width: ${lossP}%"></div>
        </div>
        <div style="text-align:right; font-size:0.8em; margin-top:5px; color:#aaa;">
            Total: ${stats.total}
        </div>
    `;

    container.innerHTML = html;
}

function getPercent(val, total) {
    if (total === 0) return 0;
    return ((val / total) * 100).toFixed(1);
}