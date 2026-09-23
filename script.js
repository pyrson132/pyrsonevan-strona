const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Copy IP Functionality
document.getElementById("copyIp")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("pyrsonevan.pl");
    showToast("IP pyrsonevan.pl zostało skopiowane!");
  } catch {
    showToast("IP serwera: pyrsonevan.pl");
  }
});

// Mobile Menu Toggle
document.querySelector(".menu-toggle")?.addEventListener("click", () => {
  document.querySelector(".nav-links")?.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => {
  document.querySelector(".nav-links")?.classList.remove("open");
}));

// Fetch Real Minecraft Server Status from Backend
async function updateServerStatus() {
  try {
    const res = await fetch("https://pyrsonevan-strona.onrender.com/api/status");
    const data = await res.json();

    const onlinePlayersEl = document.getElementById("onlinePlayers");
    const statPlayersEl = document.getElementById("statPlayers");

    if (onlinePlayersEl && statPlayersEl) {
      if (data.online) {
        onlinePlayersEl.textContent = data.players;
        statPlayersEl.textContent = `${data.players} / ${data.maxPlayers}`;
      } else {
        onlinePlayersEl.textContent = "0";
        statPlayersEl.textContent = "Offline";
      }
    }
  } catch (err) {
    const onlinePlayersEl = document.getElementById("onlinePlayers");
    const statPlayersEl = document.getElementById("statPlayers");
    if (onlinePlayersEl) onlinePlayersEl.textContent = "0";
    if (statPlayersEl) statPlayersEl.textContent = "Błąd API";
  }
}
updateServerStatus();
setInterval(updateServerStatus, 30000); // Refresh every 30s

// Shop Checkout Handler
document.querySelectorAll(".buy-btn").forEach(button => {
  button.addEventListener("click", async () => {
    const rank = button.dataset.rank;
    
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rank })
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message);
      } else {
        showToast(data.message || "Błąd podczas zakupu.");
      }
    } catch (err) {
      showToast("Nie można połączyć się z serwerem płatności.");
    }
  });
});

// Scroll Reveal Observer
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
