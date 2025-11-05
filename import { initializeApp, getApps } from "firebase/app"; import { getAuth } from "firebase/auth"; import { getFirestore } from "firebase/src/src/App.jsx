import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDocs,
} from "firebase/firestore";

const ADMIN_EMAIL = "5126akshaya@gmail.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    return onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "feedback"));
    return onSnapshot(q, (snap) =>
      setFeedbacks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  async function sendMessage() {
    if (!input.trim() || !user) return;
    await addDoc(collection(db, "messages"), {
      uid: user.uid,
      text: input,
      createdAt: Date.now(),
    });
    setInput("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const data = await res.json();
    await addDoc(collection(db, "messages"), {
      uid: "system",
      text: data.answer,
      createdAt: Date.now(),
    });
  }

  async function leaveFeedback(rating, comment) {
    if (!user) return;
    await addDoc(collection(db, "feedback"), {
      uid: user.uid,
      rating,
      comment,
      createdAt: Date.now(),
    });
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="p-3 flex justify-between items-center border-b bg-indigo-600 text-white">
        <h1 className="font-bold">MoneySmart</h1>
        {user ? (
          <div className="flex gap-2 items-center">
            <span>{user.email}</span>
            <button onClick={() => signOut(auth)} className="bg-red-500 px-2 rounded">Logout</button>
          </div>
        ) : (
          <div className="flex gap-1">
            <input
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-black p-1 rounded"
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-black p-1 rounded"
            />
            <button
              onClick={async () => {
                try {
                  await signInWithEmailAndPassword(auth, email, password);
                } catch {
                  await createUserWithEmailAndPassword(auth, email, password);
                }
              }}
              className="bg-green-500 px-2 rounded"
            >
              Login
            </button>
          </div>
        )}
      </header>

      <nav className="flex justify-center gap-6 p-2 border-b">
        <button onClick={() => setTab("chat")}>Chat</button>
        <button onClick={() => setTab("feedback")}>Feedback</button>
        {isAdmin && <button onClick={() => setTab("admin")}>Admin</button>}
      </nav>

      {tab === "chat" && (
        <main className="p-4 space-y-3">
          <div className="h-80 overflow-auto border p-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-2 my-1 rounded ${
                  m.uid === "system" ? "bg-gray-100" : "bg-indigo-50"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about finance, economics, or business..."
              className="flex-1 border p-2 rounded"
            />
            <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 rounded">
              Send
            </button>
          </div>
        </main>
      )}

      {tab === "feedback" && (
        <div className="p-4 space-y-3">
          <h2 className="font-semibold text-lg">Feedback</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const rating = e.target.rating.value;
              const comment = e.target.comment.value;
              leaveFeedback(rating, comment);
              e.target.reset();
            }}
            className="space-y-2"
          >
            <label>
              Rating:
              <select name="rating" className="border ml-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <textarea
              name="comment"
              placeholder="Your comment..."
              className="w-full border p-2 rounded"
            />
            <button className="bg-indigo-600 text-white px-3 py-1 rounded">
              Submit
            </button>
          </form>
        </div>
      )}

      {tab === "admin" && isAdmin && (
        <div className="p-4">
          <h2 className="font-semibold text-lg mb-2">Admin Dashboard</h2>
          <div>Total Users: {feedbacks.length}</div>
          <h3 className="mt-3 font-semibold">Feedbacks</h3>
          <div className="space-y-2 mt-2">
            {feedbacks.map((f) => (
              <div key={f.id} className="border p-2 rounded">
                <div>Rating: {f.rating}</div>
                <div>{f.comment}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
