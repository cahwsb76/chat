import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-100">
      <h1 className="text-3xl font-bold mb-12">Selamat Datang di Aplikasi</h1>

      <div className="flex flex-col space-y-6">
        <Link
          href="/chat"
          className="px-8 py-4 bg-blue-600 text-white text-lg rounded-xl shadow hover:bg-blue-700 transition"
        >
          Masuk ke Chat
        </Link>

        <Link
          href="/waiter"
          className="px-8 py-4 bg-green-600 text-white text-lg rounded-xl shadow hover:bg-green-700 transition"
        >
          Masuk ke Waiter
        </Link>

        <Link
          href="/admin"
          className="px-8 py-4 bg-red-600 text-white text-lg rounded-xl shadow hover:bg-green-700 transition"
        >
          Masuk admin
        </Link>
      </div>
    </main>
  );
}
