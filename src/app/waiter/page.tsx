"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface MenuItem {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  harga: number;
}

interface PesananItem {
  id: string;
  nama: string;
  harga: number;
  jumlah: number;
}

export default function WaiterPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [pesanan, setPesanan] = useState<PesananItem[]>([]);
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [waktuCetak, setWaktuCetak] = useState("");

  const fetchMenu = async () => {
    const snap = await getDocs(collection(db, "menu"));
    const data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        kode: d.kode || "",
        nama: d.nama || "",
        kategori: d.kategori || "",
        harga: typeof d.harga === "number" ? d.harga : 0,
      };
    });
    setMenu(data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const tambahPesanan = (item: MenuItem) => {
    const sudahAda = pesanan.find((p) => p.id === item.id);
    if (sudahAda) {
      setPesanan((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, jumlah: p.jumlah + 1 } : p))
      );
    } else {
      setPesanan((prev) => [
        ...prev,
        { id: item.id, nama: item.nama, harga: item.harga, jumlah: 1 },
      ]);
    }
  };

  const resetPesanan = () => {
    setPesanan([]);
    setNamaPelanggan("");
    setWaktuCetak("");
  };

  const total = pesanan.reduce((sum, p) => sum + p.harga * p.jumlah, 0);

  const grouped = {
    makanan: menu.filter((m) => m.kategori === "makanan"),
    pelengkap: menu.filter((m) => m.kategori === "pelengkap"),
    minuman: menu.filter((m) => m.kategori === "minuman"),
  };

  const handleCetak = () => {
    const now = new Date();
    setWaktuCetak(now.toLocaleString("id-ID"));
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      <main className="p-4 max-w-4xl mx-auto print:max-w-xs print:p-2 print:bg-white print:text-black">
        <h1 className="text-xl font-bold mb-4 print:hidden">
          🍽️ Waiter - Ambil Pesanan
        </h1>

        <div className="mb-4 print:hidden">
          <input
            type="text"
            placeholder="Nama Pelanggan"
            value={namaPelanggan}
            onChange={(e) => setNamaPelanggan(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          />
        </div>

        {/* Tampilan Menu per kategori dibungkus */}
        {Object.entries(grouped).map(([kategori, items]) => (
          <section key={kategori} className="mb-4 print:hidden border rounded">
            <h2 className="bg-gray-100 font-semibold text-sm p-2">
              {kategori === "makanan" && "🍛 Makanan"}
              {kategori === "pelengkap" && "🥗 Pelengkap"}
              {kategori === "minuman" && "🍹 Minuman"}
            </h2>
            <div className="grid grid-cols-2 gap-2 p-2 max-h-[300px] overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="border p-2 rounded relative">
                  <div className="text-sm font-medium truncate">
                    {item.nama}
                  </div>
                  <div className="text-xs text-gray-500">
                    Rp {item.harga.toLocaleString("id-ID")}
                  </div>
                  <button
                    onClick={() => tambahPesanan(item)}
                    className="absolute top-1 right-1 text-xs bg-blue-500 text-white rounded px-1 hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Nota Sementara (cetak) */}
        <section className="mt-10 print:block">
          <div className="hidden print:block text-center mb-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="mx-auto w-16 h-auto mb-1"
            />
            <div className="text-[12px] font-bold">Angkringan Pak Donal</div>
            <div className="text-[10px]">Jl. merdeka ---</div>
          </div>

          <div className="flex justify-between items-center text-xs mb-1">
            <div>👤 {namaPelanggan || "-"}</div>
            <div className="text-right text-[10px]">📃 Nota Sementara</div>
          </div>
          <div className="text-center text-[10px] leading-none">
            ---------------------------------------------------------------------
          </div>

          <table className="w-full text-xs print:text-[10px] print:table-fixed print:border-none">
            <thead>
              <tr>
                <th className="px-1 py-1 w-1/4 text-left">Menu</th>
                <th className="px-1 py-1 w-1/6 text-center">Jml</th>
                <th className="px-1 py-1 w-1/4 text-right">Harga</th>
                <th className="px-1 py-1 w-1/4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pesanan.map((p) => (
                <tr key={p.id}>
                  <td className="px-1 py-1 truncate">{p.nama}</td>
                  <td className="px-1 py-1 text-center">{p.jumlah}</td>
                  <td className="px-1 py-1 text-right">
                    Rp {p.harga.toLocaleString("id-ID")}
                  </td>
                  <td className="px-1 py-1 text-right">
                    Rp {(p.harga * p.jumlah).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="px-1 py-2 font-bold text-right">
                  TOTAL
                </td>
                <td className="px-1 py-2 font-bold text-right">
                  Rp {total.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 text-sm text-gray-600 text-center print:mt-4 print:text-xs">
            🕒 Dicetak: {waktuCetak}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 print:hidden">
            <button
              onClick={handleCetak}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🖨 Cetak Nota
            </button>
            <button
              onClick={resetPesanan}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🔄 Reset Pesanan
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
