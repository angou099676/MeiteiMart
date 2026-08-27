import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function loadTickets() {
    const res = await api.get("/tickets");
    setTickets(res.data.data.tickets);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function openTicket(ticket) {
    const res = await api.get(`/tickets/${ticket._id}`);
    setSelected(res.data.data.ticket);
    getSocket()?.emit("ticket:join", ticket._id);
  }

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    function onMessage(payload) {
      if (selected && payload.ticketId === selected._id) {
        setSelected((prev) => ({ ...prev, messages: [...prev.messages, payload] }));
      }
    }
    socket.on("ticket:message", onMessage);
    return () => socket.off("ticket:message", onMessage);
  }, [selected]);

  async function sendReply(e) {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    await api.post(`/tickets/${selected._id}/messages`, { message: reply });
    setReply("");
    openTicket(selected);
  }

  async function resolve() {
    await api.patch(`/tickets/${selected._id}/status`, { status: "RESOLVED" });
    loadTickets();
  }

  async function handleLogout() {
    await api.post("/auth/logout");
    logout();
    navigate("/login");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-700">Support Console</h1>
        <button type="button" onClick={handleLogout} className="text-sm text-red-600">Sign out</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-medium mb-3">Tickets</h2>
          <ul className="space-y-1">
            {tickets.map((t) => (
              <li key={t._id}>
                <button type="button" onClick={() => openTicket(t)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selected?._id === t._id ? "bg-brand-50 text-brand-700" : "hover:bg-gray-100"}`}>
                  <span className="font-medium">{t.ticketNumber}</span>
                  <br />
                  <span className="text-xs text-gray-500">{t.subject} • {t.status}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-4 flex flex-col h-[32rem]">
          {selected ? (
            <>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                <div>
                  <p className="font-medium">{selected.subject}</p>
                  <p className="text-xs text-gray-500">{selected.raisedBy?.name}</p>
                </div>
                <button type="button" onClick={resolve} className="text-xs bg-green-600 text-white rounded-lg px-3 py-1.5">Resolve</button>
              </div>
              <div className="flex-1 overflow-auto space-y-2 mb-3">
                {selected.messages.map((m) => (
                  <div key={`${m.sender}-${m.sentAt}`} className="bg-gray-50 rounded-lg p-2 text-sm">
                    {m.message}
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm">Send</button>
              </form>
            </>
          ) : (
            <p className="text-gray-500">Select a ticket to view the conversation.</p>
          )}
        </div>
      </div>
    </div>
  );
}
