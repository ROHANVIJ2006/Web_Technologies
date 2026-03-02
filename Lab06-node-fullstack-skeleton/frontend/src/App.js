import React, { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f4f6f9",
    fontFamily: "Arial"
  };

  const cardStyle = {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center"
  };

  const buttonStyle = {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {!user ? (
          <>
            <h2>Multi-Role Login</h2>
            <input
              type="email"
              placeholder="Email"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button style={buttonStyle} onClick={handleLogin}>
              Login
            </button>
          </>
        ) : (
          <>
            <h2>Dashboard</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>

            {user.role === "SUPER_ADMIN" && (
              <p style={{ color: "green" }}>Full System Access</p>
            )}

            {user.role === "ADMIN" && (
              <p style={{ color: "orange" }}>User Management Access</p>
            )}

            {user.role === "USER" && (
              <p style={{ color: "gray" }}>Profile View Access</p>
            )}

            <br />
            <button style={{ ...buttonStyle, background: "red" }} onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;