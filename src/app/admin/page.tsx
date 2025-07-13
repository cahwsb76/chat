"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

interface MenuItem {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  harga: number;
}

export default function AdminPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("makanan");
  const [harga, setHarga] = useState("");
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    kode: "",
    nama: "",
    kategori: "",
    harga: "",
  });

  const fetchMenu = async () => {
    const snap = await getDocs(collection(db, "menu"));
    const data = snap.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        kode: docData.kode || "",
        nama: docData.nama || "",
        kategori: docData.kategori || "",
        harga: typeof docData.harga === "number" ? docData.harga : 0,
      };
    });
    setMenu(data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const tambahMenu = async () => {
    if (!kode || !nama || !harga) return alert("Lengkapi semua field!");
    await addDoc(collection(db, "menu"), {
      kode,
      nama,
      kategori,
      harga: Number(harga),
    });
    setKode("");
    setNama("");
    setKategori("makanan");
    setHarga("");
    fetchMenu();
  };

  const hapusMenu = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
    fetchMenu();
  };

  const mulaiEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditData({
      kode: item.kode,
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga.toString(),
    });
  };

  const simpanEdit = async () => {
    if (!editingId) return;
    await updateDoc(doc(db, "menu", editingId), {
      ...editData,
      harga: Number(editData.harga),
    });
    setEditingId(null);
    fetchMenu();
  };

  const hasilFilter = menu.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.kode.toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategori
      ? item.kategori === filterKategori
      : true;
    return matchSearch && matchKategori;
  });

  return (
    <>
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📋 Admin Menu Warung</h1>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Kode"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Nama Menu"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="makanan">🍛 Makanan</option>
            <option value="pelengkap">🥗 Pelengkap</option>
            <option value="minuman">🍹 Minuman</option>
          </select>
          <input
            type="number"
            placeholder="Harga"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            className="border px-4 py-2 rounded"
          />
        </div>
        <button
          onClick={tambahMenu}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          + Tambah Menu
        </button>

        <hr className="my-6" />

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="🔍 Cari kode/nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="">Semua Kategori</option>
            <option value="makanan">Makanan</option>
            <option value="pelengkap">Pelengkap</option>
            <option value="minuman">Minuman</option>
          </select>
        </div>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Kode</th>
              <th className="border p-2">Nama</th>
              <th className="border p-2">Kategori</th>
              <th className="border p-2">Harga</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {hasilFilter.map((item) => (
              <tr key={item.id}>
                {editingId === item.id ? (
                  <>
                    <td className="border p-2">
                      <input
                        className="w-full border px-1"
                        value={editData.kode}
                        onChange={(e) =>
                          setEditData({ ...editData, kode: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        className="w-full border px-1"
                        value={editData.nama}
                        onChange={(e) =>
                          setEditData({ ...editData, nama: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        className="w-full border px-1"
                        value={editData.kategori}
                        onChange={(e) =>
                          setEditData({ ...editData, kategori: e.target.value })
                        }
                      >
                        <option value="makanan">Makanan</option>
                        <option value="pelengkap">Pelengkap</option>
                        <option value="minuman">Minuman</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-full border px-1 text-right"
                        value={editData.harga}
                        onChange={(e) =>
                          setEditData({ ...editData, harga: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={simpanEdit}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Batal
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2 text-center">{item.kode}</td>
                    <td className="border p-2">{item.nama}</td>
                    <td className="border p-2">{item.kategori}</td>
                    <td className="border p-2 text-right">
                      Rp {(item.harga ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => mulaiEdit(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => hapusMenu(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
