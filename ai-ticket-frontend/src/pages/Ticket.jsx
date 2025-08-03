import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [markingDone, setMarkingDone] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
    };
    fetchTicket();
    fetchUser();
  }, [id]);

  const handleMarkDone = async () => {
    setMarkingDone(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}/done`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
      } else {
        alert(data.message || "Failed to mark as done");
      }
    } catch (err) {
      alert("Error marking as done");
      console.error(err);
    } finally {
      setMarkingDone(false);
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading ticket details...</div>;
  if (!ticket) return <div className="text-center mt-10">Ticket not found</div>;

  const canMarkDone =
    user &&
    ticket.status !== "DONE" &&
    (user.role === "admin" ||
      (ticket.assignedTo && ticket.assignedTo._id === user._id));

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>

      {/* Main content area with side-by-side layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Original Ticket Information */}
        <div className="lg:w-[45%]">
          <div className="card bg-gray-800 shadow p-4 space-y-4">
            <h3 className="text-xl font-semibold text-blue-400">Original Ticket</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-300">Title</h4>
                <p className="text-white">{ticket.title}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-300">Description</h4>
                <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.createdAt && (
                <div>
                  <h4 className="font-semibold text-gray-300">Submitted</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              {ticket.createdBy && (
                <div>
                  <h4 className="font-semibold text-gray-300">Submitted By</h4>
                  <p className="text-sm text-gray-400">
                    User ID: {ticket.createdBy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - AI Decoded Context */}
        <div className="lg:w-[55%]">
          <div className="card bg-gray-800 shadow p-4 space-y-4">
            <h3 className="text-xl font-semibold text-green-400">AI Decoded Context</h3>
            
            {/* AI Summary */}
            {ticket.helpfulNotes && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-300">AI Summary & Analysis</h4>
                <div className="prose prose-invert max-w-none rounded p-3 bg-gray-700">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Extracted Entities/Skills */}
            {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-300">Extracted Skills & Entities</h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.relatedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Triage */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-300">Suggested Triage</h4>
              <div className="space-y-2">
                {ticket.priority && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Priority:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        ticket.priority === "high"
                          ? "bg-red-600 text-white"
                          : ticket.priority === "medium"
                          ? "bg-yellow-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                )}
                
                {ticket.status && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        ticket.status === "IN_PROGRESS"
                          ? "bg-yellow-600 text-white"
                          : ticket.status === "DONE"
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Information */}
            {ticket.assignedTo && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-300">Assigned To</h4>
                <p className="text-sm text-gray-400">
                  {ticket.assignedTo.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons - kept outside the columns to maintain functionality */}
      {canMarkDone && (
        <div className="mt-6 flex justify-center">
          <button
            className="btn btn-success"
            onClick={handleMarkDone}
            disabled={markingDone}
          >
            {markingDone ? "Marking..." : "Mark as Done"}
          </button>
        </div>
      )}
    </div>
  );
}
