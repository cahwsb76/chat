"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  startAfter,
  limit,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export default function ChatPage() {
  const [pengirim, setPengirim] = useState("Anonim");
  const [pesan, setPesan] = useState("");
  const [chatList, setChatList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadedIds = useRef<Set<string>>(new Set());

  const loadChats = async () => {
    const chatRef = collection(db, "chat");
    const q = query(chatRef, orderBy("waktu", "desc"), limit(100));
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.forEach((d) => loadedIds.current.add(d.id));
    setChatList(data);
    setLastDoc(snap.docs[snap.docs.length - 1]);
    if (snap.docs.length < 100) setHasMore(false);
  };

  const loadMoreChats = async () => {
    if (!lastDoc) return;
    const chatRef = collection(db, "chat");
    const q = query(
      chatRef,
      orderBy("waktu", "desc"),
      startAfter(lastDoc),
      limit(100)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.forEach((d) => loadedIds.current.add(d.id));
    setChatList((prev) => [...prev, ...data]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
    if (snap.docs.length < 100) setHasMore(false);
  };

  useEffect(() => {
    const q = query(collection(db, "chat"), orderBy("waktu", "desc"), limit(1));
    let firstRun = true;

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const doc = snap.docs[0];
      if (firstRun) {
        firstRun = false;
        return;
      }

      if (!loadedIds.current.has(doc.id)) {
        loadedIds.current.add(doc.id);
        setChatList((prev) => [doc.data(), ...prev]);
        audioRef.current?.play();
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    loadChats();
  }, []);

  const kirimPesan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim()) return;

    await addDoc(collection(db, "chat"), {
      pengirim,
      pesan,
      waktu: serverTimestamp(),
    });

    setPesan("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <audio ref={audioRef} src="/sounds/bip.mp3" preload="auto" />

      <h1 className="text-2xl font-bold mb-4">💬 Chat Online Realtime</h1>

      <form onSubmit={kirimPesan} className="flex gap-2 mb-4">
        <input
          value={pengirim}
          onChange={(e) => setPengirim(e.target.value)}
          placeholder="Nama"
          className="bg-gray-800 border border-gray-700 p-2 rounded text-white w-1/4"
        />
        <input
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          placeholder="Ketik pesan..."
          className="bg-gray-800 border border-gray-700 p-2 rounded text-white flex-1"
        />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded">
          Kirim
        </button>
      </form>

      <div className="space-y-2">
        {hasMore && (
          <button
            onClick={loadMoreChats}
            className="bg-gray-800 text-white text-sm px-3 py-1 rounded border border-gray-600"
          >
            ⬇️ Lihat Pesan Sebelumnya
          </button>
        )}

        {chatList.map((c, i) => (
          <div
            key={i}
            className="border border-gray-700 p-3 rounded bg-gray-800 shadow"
          >
            <div className="text-sm text-gray-400">
              <strong>{c.pengirim}</strong> •{" "}
              {c.waktu && typeof c.waktu.toDate === "function" ? (
                c.waktu.toDate().toLocaleTimeString("id-ID")
              ) : (
                <span className="animate-pulse">⏳</span>
              )}
            </div>
            <div className="text-white">{c.pesan}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
