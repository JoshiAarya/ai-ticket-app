import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar.jsx";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets(); // Refresh list
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-3 mb-8">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ticket Title"
            className="input input-bordered w-full"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ticket Description"
            className="textarea textarea-bordered w-full"
            required
          ></textarea>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-2">All Tickets</h2>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              className="card shadow-md p-4 bg-gray-800"
              to={`/tickets/${ticket._id}`}
            >
              <h3 className="font-bold text-lg">{ticket.title}</h3>
              <p className="text-sm">{ticket.description}</p>
              <p className="text-sm text-gray-500">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
              {ticket.status && (
                <p className="text-sm mt-1">
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      marginRight: 8,
                      backgroundColor:
                        ticket.status === "IN_PROGRESS"
                          ? "#facc15" // yellow-400
                          : ticket.status === "DONE"
                          ? "#22c55e" // green-500
                          : "#a3a3a3", // gray-400
                    }}
                  ></span>
                  {ticket.status}
                </p>
              )}
            </Link>
          ))}
          {tickets.length === 0 && <p>No tickets submitted yet.</p>}
        </div>
      </div>
    </>
  );
}
