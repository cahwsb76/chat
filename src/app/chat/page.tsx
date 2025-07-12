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
  Timestamp,
} from "firebase/firestore";

// Define Chat type
type Chat = {
  id: string;
  pengirim: string;
  pesan: string;
  waktu?: Timestamp;
};

export default function ChatPage() {
  const [pengirim, setPengirim] = useState("Bunda");
  const [pesan, setPesan] = useState("");
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadedIds = useRef<Set<string>>(new Set());

  const loadChats = async () => {
    const chatRef = collection(db, "chat");
    const q = query(chatRef, orderBy("waktu", "desc"), limit(100));
    const snap = await getDocs(q);

    const data: Chat[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Chat, "id">),
    }));
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
    const data: Chat[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Chat, "id">),
    }));
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
        const newChat: Chat = {
          id: doc.id,
          ...(doc.data() as Omit<Chat, "id">),
        };
        setChatList((prev) => [newChat, ...prev]);
        audioRef.current?.play();
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    loadChats();

    // Aktifkan dark mode otomatis saat pertama kali buka
    document.documentElement.classList.add("dark");
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
    <div className="min-h-screen bg-black text-white dark:bg-black dark:text-white">
      <div className="max-w-2xl mx-auto p-4">
        <audio ref={audioRef} src="/sounds/bip.mp3" preload="auto" />

        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <img
            src="https://ik.imagekit.io/t3zs29g4z/IMG-20230709-WA0028.jpg"
            alt="Logo"
            className="fixed top-4 right-4 w-20 h-20 rounded-full shadow-xl border-2 border-white object-cover z-50"
          />
          💬 Chat Online Realtime
        </h1>

        <form
          onSubmit={kirimPesan}
          className="flex flex-col gap-2 mb-4 relative"
        >
          <div className="flex gap-2">
            <input
              value={pengirim}
              onChange={(e) => setPengirim(e.target.value)}
              placeholder="Nama"
              className="border p-3 rounded w-1/3 bg-white text-black dark:bg-gray-800 dark:text-white text-lg"
            />
          </div>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Ketik pesan..."
            className="border p-3 rounded resize-none min-h-[60px] max-h-[200px] overflow-auto bg-white text-black dark:bg-gray-800 dark:text-white text-lg"
            rows={6}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition duration-200 text-white px-6 py-3 rounded-lg text-lg shadow-md self-end mt-2"
          >
            Kirim 💬
          </button>
        </form>

        <div className="space-y-2">
          {hasMore && (
            <button
              onClick={loadMoreChats}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded"
            >
              ⬇️ Lihat Pesan Sebelumnya
            </button>
          )}

          {chatList.map((c) => (
            <div key={c.id} className="border p-3 rounded bg-gray-800 shadow">
              <div className="text-sm text-gray-400">
                <strong>{c.pengirim}</strong> •{" "}
                {c.waktu?.toDate?.().toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                }) ?? "⏳"}
              </div>
              <div>{c.pesan}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
