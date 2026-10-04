# 🔐 Login Authentication System

A client-side authentication system built using **HTML, CSS, and JavaScript** with **localStorage**. It lets users register, log in, view a protected dashboard, and log out, with passwords stored as salted SHA-256 hashes instead of plain text.

## ✨ Features

- Registration page with username, email, and password fields.
- Password validation: minimum 8 characters and at least 1 number.
- Duplicate username and email check with clear error messages.
- Login page that accepts either username or email.
- A single generic error for wrong credentials, so it never reveals which field is incorrect.
- Protected dashboard that redirects to the login page if opened without a session.
- Logout button that clears the session and redirects to the login page.
- Passwords are hashed with SHA-256 and a random salt, never stored as plain text.
- Form validation on both pages, so empty submissions are blocked.
- Responsive design for different screen sizes.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure of the register, login, and dashboard pages |
| CSS3 | Styling and responsive design |
| JavaScript | Validation, hashing, session handling, and redirects |
| localStorage | Storing users and the login session in the browser |
| Web Crypto API | SHA-256 hashing with a random salt |

## 📁 Project Structure

```
Login-Authentication-System/
│
├── register.html
├── login.html
├── dashboard.html
├── style.css
└── script.js
```

## Installation

Clone the repository using the following command:

```
git clone https://github.com/shiprasonal/Login-Authentication-System.git
```

Open the cloned project folder and launch `register.html` using a local server such as the VS Code **Live Server** extension. The Web Crypto API needs `localhost` (or HTTPS) to work, so opening the file directly may not work.

**Repository Link:** [Login Authentication System](https://github.com/shiprasonal/Login-Authentication-System)

## 🔎 How It Works

1. **Register:** the input is validated, the username and email are checked for duplicates, then a random salt is generated and the password is hashed with SHA-256. Only the salt and the hash are saved.
2. **Login:** the entered password is hashed with the stored salt and compared with the saved hash. A session is created in localStorage on success.
3. **Dashboard:** checks for a valid session on load. If there is none, the user is redirected to the login page.
4. **Logout:** removes the session and redirects to the login page.

## ⚠️ Limitations

This project is made for learning. Client-side authentication can be changed by anyone using the browser DevTools, so real applications must verify users on a server (for example with Node.js, Express, and bcrypt) and use secure server-side sessions or cookies.

## 📚 Sources

- Concepts: tutorials on JavaScript login systems with localStorage.
- Sessions: MDN article on HTTP cookies and sessions.
- Hashing: MDN documentation for the Web Crypto API (`crypto.subtle.digest`).

## 💡 What I Learned

- Validating forms and handling user input in JavaScript.
- Storing and reading data with localStorage.
- Why passwords should be hashed, and how salting works.
- Protecting a page by checking for a session and redirecting.
- Sharing one JavaScript file across multiple pages.
- The difference between client-side and server-side authentication.

## 👩‍💻 Author

**Shipra Sonal**

[GitHub](https://github.com/shiprasonal) · [LinkedIn](https://www.linkedin.com/in/shipra-sonal-554a50258)

---

⭐ If you find this project interesting, feel free to explore the repository!
