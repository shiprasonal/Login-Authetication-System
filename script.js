/* =========================================================
   Simple client-side auth (localStorage + SHA-256 with salt)
   Ek hi file teeno pages par chalti hai. Page ka naam
   <body data-page="..."> se pata chalta hai.
   ========================================================= */

const USERS_KEY = "auth_users";
const SESSION_KEY = "auth_session";

/* ---------- Storage helpers ---------- */
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
}

/* ---------- Hashing (plain-text password kabhi save nahi hota) ---------- */
function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function hashingAvailable() {
  return !!(window.crypto && window.crypto.subtle);
}

/* ---------- UI helpers ---------- */
function showMessage(el, text, type) {
  el.textContent = text;
  el.className = "message " + type;
  el.hidden = false;
}

function clearMessage(el, fields) {
  el.hidden = true;
  el.textContent = "";
  fields.forEach((f) => f.classList.remove("invalid"));
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,20}$/;

/* =========================================================
   REGISTER PAGE
   ========================================================= */
function initRegister() {
  // Pehle se login hai to seedha dashboard
  if (getSession()) {
    location.replace("dashboard.html");
    return;
  }

  const form = document.getElementById("registerForm");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("message");
  const fields = [usernameInput, emailInput, passwordInput];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage(message, fields);

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // 1. Khali fields
    if (!username || !email || !password) {
      if (!username) usernameInput.classList.add("invalid");
      if (!email) emailInput.classList.add("invalid");
      if (!password) passwordInput.classList.add("invalid");
      showMessage(message, "Please fill in all fields.", "error");
      return;
    }

    // 2. Username aur email ka format
    if (!USERNAME_PATTERN.test(username)) {
      usernameInput.classList.add("invalid");
      showMessage(message, "Username must be 3-20 characters: letters, numbers, _ or . only.", "error");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      emailInput.classList.add("invalid");
      showMessage(message, "Please enter a valid email address.", "error");
      return;
    }

    // 3. Password rules: kam se kam 8 characters aur 1 number
    if (password.length < 8) {
      passwordInput.classList.add("invalid");
      showMessage(message, "Password must be at least 8 characters long.", "error");
      return;
    }
    if (!/\d/.test(password)) {
      passwordInput.classList.add("invalid");
      showMessage(message, "Password must contain at least 1 number.", "error");
      return;
    }

    // 4. Duplicate username / email check
    const users = getUsers();
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      usernameInput.classList.add("invalid");
      showMessage(message, "This username is already taken.", "error");
      return;
    }
    if (users.some((u) => u.email === email)) {
      emailInput.classList.add("invalid");
      showMessage(message, "An account with this email already exists.", "error");
      return;
    }

    if (!hashingAvailable()) {
      showMessage(message, "Secure hashing is unavailable. Open this page with Live Server (localhost).", "error");
      return;
    }

    // 5. Password hash karke save karo
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    users.push({
      username: username,
      email: email,
      salt: salt,
      passwordHash: passwordHash,
      createdAt: Date.now(),
    });
    saveUsers(users);

    location.href = "login.html?registered=1";
  });
}

/* =========================================================
   LOGIN PAGE
   ========================================================= */
function initLogin() {
  if (getSession()) {
    location.replace("dashboard.html");
    return;
  }

  const form = document.getElementById("loginForm");
  const identifierInput = document.getElementById("identifier");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("message");
  const fields = [identifierInput, passwordInput];

  // Registration ke baad success message
  if (new URLSearchParams(location.search).get("registered") === "1") {
    showMessage(message, "Account created. Please login.", "success");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage(message, fields);

    const identifier = identifierInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // Khali submission roko
    if (!identifier || !password) {
      if (!identifier) identifierInput.classList.add("invalid");
      if (!password) passwordInput.classList.add("invalid");
      showMessage(message, "Please enter your username/email and password.", "error");
      return;
    }

    if (!hashingAvailable()) {
      showMessage(message, "Secure hashing is unavailable. Open this page with Live Server (localhost).", "error");
      return;
    }

    const user = getUsers().find(
      (u) => u.username.toLowerCase() === identifier || u.email === identifier
    );
    const hash = user ? await hashPassword(password, user.salt) : null;

    // Ek hi message, chahe username galat ho ya password
    if (!user || hash !== user.passwordHash) {
      showMessage(message, "Invalid username/email or password.", "error");
      return;
    }

    // Session banao
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ username: user.username, token: generateSalt(), loginAt: Date.now() })
    );
    location.href = "dashboard.html";
  });
}

/* =========================================================
   DASHBOARD PAGE (protected)
   ========================================================= */
function initDashboard() {
  const session = getSession();
  const user = session
    ? getUsers().find((u) => u.username === session.username)
    : null;

  // Session nahi hai to login page par bhejo
  if (!session || !user) {
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html");
    return;
  }

  const format = (ts) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    });

  document.getElementById("welcomeName").textContent = user.username;
  document.getElementById("infoUsername").textContent = user.username;
  document.getElementById("infoEmail").textContent = user.email;
  document.getElementById("infoCreated").textContent = format(user.createdAt);
  document.getElementById("infoLogin").textContent = format(session.loginAt);

  // Check pass hone ke baad hi page dikhao
  document.getElementById("dashboard").hidden = false;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html");
  });
}

/* ---------- Kaunsa page hai, wahi function chalao ---------- */
const page = document.body.dataset.page;
if (page === "register") initRegister();
else if (page === "login") initLogin();
else if (page === "dashboard") initDashboard();