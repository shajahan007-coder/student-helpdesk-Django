import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ShieldCheck, Clock, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getError = (err) => {
  const data = err.response?.data;
  if (!data) return "Cannot reach server. Is Django running?";
  if (data.msg) return data.msg;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  return Array.isArray(first) ? first[0] : String(first);
};

function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const token = localStorage.getItem("token");

  const priorityColors = {
    High: { border: "#ef4444", bg: "#fef2f2", text: "#991b1b" },
    Medium: { border: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
    Low: { border: "#3b82f6", bg: "#eff6ff", text: "#1e40af" },
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Server-side filtering: re-fetch when filters change (search is debounced)
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/tickets/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            status: filterStatus === "All" ? undefined : filterStatus,
            priority: filterPriority === "All" ? undefined : filterPriority,
            search: searchTerm.trim() || undefined,
          },
        });
        setTickets(res.data);
      } catch (err) {
        if (err.response?.status === 401) handleLogout();
        else console.error("Fetch Error:", getError(err));
      } finally {
        setInitialLoad(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [token, searchTerm, filterStatus, filterPriority]);

  const handleResolve = async (id) => {
    const remark = prompt("Enter resolution details for the student:");
    if (!remark) return;

    try {
      const res = await axios.put(
        `${API_URL}/tickets/${id}/resolve/`,
        { remark },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setTickets(tickets.map((t) => (t.id === id ? res.data : t)));
      alert("Ticket resolved!");
    } catch (err) {
      alert(`Action failed: ${getError(err)}`);
    }
  };

  if (initialLoad)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading Dashboard...
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: 0,
            color: "#1e293b",
          }}
        >
          <ShieldCheck size={36} color="#10b981" /> Admin Control
        </h1>
        <button
          onClick={handleLogout}
          style={{
            background: "#f1f5f9",
            color: "#475569",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Search by student or issue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 2,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            outline: "none",
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "white",
            cursor: "pointer",
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "white",
            cursor: "pointer",
          }}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* TICKET LIST */}
      <div style={{ display: "grid", gap: "20px" }}>
        <AnimatePresence>
          {tickets.length === 0 ? (
            <p
              style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}
            >
              No tickets match your search.
            </p>
          ) : (
            tickets.map((ticket) => {
              const pStyle =
                priorityColors[ticket.priority] || priorityColors.Medium;

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: `6px solid ${pStyle.border}`,
                  }}
                >
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          backgroundColor: pStyle.bg,
                          color: pStyle.text,
                          border: `1px solid ${pStyle.border}`,
                        }}
                      >
                        {ticket.priority || "Medium"}
                      </span>

                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        <User size={16} /> {ticket.student_name}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "#94a3b8",
                        }}
                      >
                        <Clock size={14} />{" "}
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "16px",
                        color: "#475569",
                        margin: "0 0 12px 0",
                      }}
                    >
                      {ticket.issue}
                    </p>

                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background:
                          ticket.status === "Resolved" ? "#d1fae5" : "#f1f5f9",
                        color:
                          ticket.status === "Resolved" ? "#065f46" : "#475569",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {ticket.status}
                    </span>

                    {ticket.admin_remark && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#059669",
                          marginTop: "10px",
                          fontStyle: "italic",
                        }}
                      >
                        <strong>Remark:</strong> {ticket.admin_remark}
                      </p>
                    )}
                  </div>

                  {ticket.status !== "Resolved" &&
                    ticket.status !== "Closed" && (
                      <button
                        onClick={() => handleResolve(ticket.id)}
                        style={{
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          padding: "10px 18px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "600",
                        }}
                      >
                        <CheckCircle size={18} /> Resolve
                      </button>
                    )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminDashboard;
