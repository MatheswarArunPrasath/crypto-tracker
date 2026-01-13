import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import TemporaryDrawer from "./drawer";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Button from "../button/Button"; // ✅ import your Button

function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u) setUser(u);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    toast.info("Logged out");
    navigate("/");
  };

  const handleLoginSuccess = (cred) => {
    try {
      const decoded = jwtDecode(cred.credential);
      localStorage.setItem("user", JSON.stringify(decoded));
      setUser(decoded);
      setOpen(false);
      toast.success(`Welcome, ${decoded.given_name || decoded.name || "user"}!`);
    } catch (e) {
      toast.error("Login failed");
      console.error(e);
    }
  };

  return (
    <div className="navbar">
      <h1 className="logo">
        CryptoTracker<span style={{ color: "var(--blue)" }}>.</span>
      </h1>

      {/* RIGHT SIDE: links + user */}
      <div className="nav-right">
        <div className="links">
          <Link to="/"><p className="link">Home</p></Link>
          <Link to="/watchlist"><p className="link">WatchList</p></Link>
          <Link to="/dashboard">
            {/* uses your Button component */}
            <Button text="Dashboard" />
          </Link>
        </div>

        {/* Profile/login trigger + dropdown */}
        <div ref={dropdownRef} className="user-area">
          {user ? (
            <button
              className="profile-trigger"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              title={user.email}
              type="button"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt="avatar"
                  style={{ width: 32, height: 32, borderRadius: "50%" }}
                />
              ) : (
                <div className="login-wrapper" onClick={() => setOpen((v) => !v)}>
    <button className="login-btn">Sign in</button>
  </div>
              )}
            </button>
          ) : (
            <button
              className="profile-trigger"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              title="Sign in"
              type="button"
            >
              L
            </button>
          )}

          {open && (
            <div className="dropdown-panel">
              {user ? (
                <>
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user.name}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>
                  <button className="dropdown-action" onClick={handleLogout} type="button">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="dropdown-header">
                    <div className="dropdown-name">Welcome</div>
                    <div className="dropdown-email">Sign in to continue</div>
                  </div>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => toast.error("Google Sign-In failed")}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <div className="mobile-drawer">
          <TemporaryDrawer />
        </div>
      </div>
    </div>
  );
}

export default Header;
