const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Copy IP Functionality
document.getElementById("copyIp").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("pyrsonevan.pl");
    showToast("IP pyrsonevan.pl zostało skopiowane!");
  } catch {
    showToast("IP serwera: pyrsonevan.pl");
  }
});

// Mobile Menu Toggle
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => {
  document.querySelector(".nav-links").classList.remove("open");
}));

// Fetch Real Minecraft Server Status from Backend
async function updateServerStatus() {
  try {
   const res = await fetch("https://pyrsonevan-strona.onrender.com/api/status");
    const data = await res.json();

    const onlinePlayersEl = document.getElementById("onlinePlayers");
    const statPlayersEl = document.getElementById("statPlayers");

    if (data.online) {
      onlinePlayersEl.textContent = data.players;
      statPlayersEl.textContent = `${data.players} / ${data.maxPlayers}`;
    } else {
      onlinePlayersEl.textContent = "0";
      statPlayersEl.textContent = "Offline";
    }
  } catch (err) {
    document.getElementById("onlinePlayers").textContent = "0";
    document.getElementById("statPlayers").textContent = "Błąd API";
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

// Authentication Handler
document.getElementById("authForm").addEventListener("submit", async e => {
  e.preventDefault();

  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  try {
    // Attempt login first
  let res = await fetch("https://pyrsonevan-strona.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    let data = await res.json();

    // If login fails because user doesn't exist, attempt auto-registration
    if (!res.ok && data.message === "Błędny e-mail lub hasło!") {
    res = await fetch("https://pyrsonevan-strona.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      data = await res.json();
    }

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      showToast(data.message || "Zalogowano pomyślnie!");
    } else {
      showToast(data.message || "Błąd uwierzytelniania.");
    }
  } catch (err) {
    showToast("Błąd połączenia z serwerem backendu.");
  }
});

// OAuth Redirects
document.getElementById("googleLogin").addEventListener("click", () => {
  window.location.href = "/api/auth/google";
});
document.getElementById("discordLogin").addEventListener("click", () => {
  window.location.href = "/api/auth/discord";
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

document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  if (!email || !password) return alert('Uzupełnij e-mail i hasło!');

 const loginBtn = document.getElementById('loginBtn') || document.querySelector('.login-card button');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerText = 'Logowanie...';
        }

        const res = await fetch('https://pyrsonevan-strona.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok || data.token) {
            alert(data.message || 'Zalogowano pomyślnie!');
            
            // Ukrywamy okno logowania po sukcesie
            const authCard = document.querySelector('.login-card') || document.querySelector('.auth-container') || document.querySelector('main');
            if (authCard) {
                authCard.style.display = 'none';
            }
        } else {
            alert(data.message || 'Błąd logowania');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerText = 'Zaloguj się';
            }
        }
// Czysta obsługa logowania
document.getElementById('loginBtn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerText = 'Logowanie...';

    const email = document.getElementById('emailInput')?.value;
    const password = document.getElementById('passwordInput')?.value;

    if (!email || !password) {
        alert('Uzupełnij e-mail i hasło!');
        btn.disabled = false;
        btn.innerText = originalText;
        return;
    }

    try {
        const res = await fetch('https://pyrsonevan-strona.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok || data.token) {
            alert(data.message || 'Zalogowano pomyślnie!');
            const authCard = document.querySelector('.login-card') || document.querySelector('.auth-container') || document.querySelector('main');
            if (authCard) authCard.style.display = 'none';
        } else {
            alert(data.message || 'Błąd logowania');
            btn.disabled = false;
            btn.innerText = originalText;
        }
    } catch (err) {
        alert('Błąd połączenia z serwerem.');
        btn.disabled = false;
        btn.innerText = originalText;
    }
});

// Czysta obsługa rejestracji
document.getElementById('registerBtn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerText = 'Rejestracja...';

    const email = document.getElementById('emailInput')?.value;
    const password = document.getElementById('passwordInput')?.value;

    if (!email || !password) {
        alert('Uzupełnij e-mail i hasło!');
        btn.disabled = false;
        btn.innerText = originalText;
        return;
    }

    try {
        const res = await fetch('https://pyrsonevan-strona.onrender.com/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            alert(data.message || 'Konto utworzone!');
            const authCard = document.querySelector('.login-card') || document.querySelector('.auth-container') || document.querySelector('main');
            if (authCard) authCard.style.display = 'none';
        } else {
            alert(data.message || 'Błąd podczas rejestracji.');
            btn.disabled = false;
            btn.innerText = originalText;
        }
    } catch (err) {
        alert('Błąd połączenia z serwerem.');
        btn.disabled = false;
        btn.innerText = originalText;
    }
});
