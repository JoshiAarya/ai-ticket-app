import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CheckAuth({ children, protected: protectedRoute }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (!protectedRoute) {
            navigate("/");
          } else {
            setLoading(false);
          }
        } else {
          setUser(null);
          if (protectedRoute) {
            navigate("/login");
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        setUser(null);
        if (protectedRoute) {
          navigate("/login");
        } else {
          setLoading(false);
        }
      }
    };
    checkAuth();
  }, [navigate, protectedRoute]);

  if (loading) {
    return <div>loading...</div>;
  }
  return children;
}

export default CheckAuth;
