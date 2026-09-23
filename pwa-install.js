(() => {
  let deferredPrompt = null;
  const page = location.pathname.split("/").pop() || "index.html";
  const labels = {
    "index.html": "📱 Instalar Electro Variety - Vendedores",
    "clientes.html": "🛍️ Instalar Electro Variety - Catálogo",
    "stock-deposito.html": "🏭 Instalar Electro Variety - Depósito",
    "stock-local.html": "🏪 Instalar Electro Variety - Local",
    "admin.html": "🔐 Instalar Electro Variety - Administrador"
  };
  const label = labels[page] || "📲 Instalar Electro Variety";

  function makeButton() {
    if (document.getElementById("evInstallPwa")) return;
    const b = document.createElement("button");
    b.id = "evInstallPwa";
    b.type = "button";
    b.textContent = label;
    Object.assign(b.style, {
      position:"fixed", left:"20px", right:"20px", bottom:"18px", zIndex:"99999",
      border:"0", borderRadius:"18px", padding:"16px 18px", background:"#16c75b",
      color:"#fff", fontSize:"16px", fontWeight:"900",
      boxShadow:"0 8px 28px rgba(0,0,0,.28)", cursor:"pointer",
      display:"none"
    });
    b.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      b.remove();
    });
    document.body.appendChild(b);
    return b;
  }

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    const b = makeButton();
    if (b) b.style.display = "block";
  });

  window.addEventListener("appinstalled", () => {
    const b = document.getElementById("evInstallPwa");
    if (b) b.remove();
    deferredPrompt = null;
  });

  // On browsers that do not expose beforeinstallprompt, the browser's own
  // Install/Add to Home Screen menu remains available.
  window.ElectroVarietyPWA = { page, label };
})();
