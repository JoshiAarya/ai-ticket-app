import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Refetch user info on every route change
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [location]);

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Ticket AI
        </Link>
      </div>
      <div className="flex gap-2">
        {!user ? (
          <>
            <Link to="/signup" className="btn btn-sm">
              Signup
            </Link>
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          </>
        ) : (
          <>
            <p>Hi, {user?.email}</p>
            {user && user?.role === "admin" ? (
              <Link to="/admin" className="btn btn-sm">
                Admin
              </Link>
            ) : null}
            <button onClick={logout} className="btn btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
