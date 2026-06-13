import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { serverUrl } from "../App";
import { IoArrowBack, IoWalletOutline } from "react-icons/io5";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ClipLoader from "react-spinners/ClipLoader";

const Wallet = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "credit", "debit"

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`${serverUrl}/api/wallet/my-wallet`, {
        withCredentials: true,
      });
      setWallet(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchWalletData();
    }
  }, [userData]);

  const filteredTransactions = wallet?.transactions
    ? [...wallet.transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter((t) => {
        if (filter === "all") return true;
        return t.type === filter;
      })
    : [];

  const getStats = () => {
    if (!wallet?.transactions) return { totalCredits: 0, totalDebits: 0 };
    return wallet.transactions.reduce(
      (acc, t) => {
        if (t.type === "credit") acc.totalCredits += t.amount;
        if (t.type === "debit") acc.totalDebits += t.amount;
        return acc;
      },
      { totalCredits: 0, totalDebits: 0 }
    );
  };

  const { totalCredits, totalDebits } = getStats();

  return (
    <div className="min-h-screen bg-[#fcf9f6] flex flex-col font-sans">
      <Nav />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-24 pb-20">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#ff5a36] transition mb-6 font-bold group"
        >
          <IoArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 text-red-700 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <ClipLoader color="#ff5a36" size={42} />
            <p className="text-gray-500 font-medium animate-pulse">Loading wallet balance...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left side: Balance Card */}
            <div className="md:col-span-1 space-y-6">
              {/* Premium Gradient Glass Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#1d8f8b] via-[#312e81] to-[#4338ca] p-6 text-white shadow-xl">
                {/* Decorative bubbles */}
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-indigo-500/20 blur-xl"></div>

                <div className="relative z-10 flex flex-col h-full justify-between min-h-48">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-200 text-sm font-semibold tracking-wider uppercase">Fletto Wallet</span>
                    <IoWalletOutline size={28} className="text-indigo-200" />
                  </div>

                  <div className="my-6">
                    <span className="text-indigo-200 text-xs block mb-1 font-medium">AVAILABLE BALANCE</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight select-none">
                      ₹{Math.round(wallet?.balance || 0)}
                    </h2>
                  </div>

                  <div className="border-t border-indigo-500/30 pt-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-indigo-300 block">CARD HOLDER</span>
                      <span className="font-bold tracking-wide uppercase">{userData?.fullName}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/40 text-[9px] font-black uppercase tracking-widest">
                      PREPAID
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Box */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="font-extrabold text-[16px] text-gray-800">Wallet Highlights</h3>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <FaArrowUp size={12} />
                  </span>
                  <div>
                    <span className="text-xs text-gray-500 block">Total Refunds Credited</span>
                    <span className="font-extrabold text-[15px] text-green-600">₹{Math.round(totalCredits)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <FaArrowDown size={12} />
                  </span>
                  <div>
                    <span className="text-xs text-gray-500 block">Total Payments Used</span>
                    <span className="font-extrabold text-[15px] text-red-600">₹{Math.round(totalDebits)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Transaction History */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-black text-gray-800">Transaction History</h3>

                {/* Filters */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {["all", "credit", "debit"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-300 ${filter === item
                        ? "bg-white text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      {item === "all" ? "All Logs" : item === "credit" ? "Refunds" : "Payments"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions List */}
              <div className="flex-1 space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {filteredTransactions.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center gap-3">
                    <IoWalletOutline size={48} className="text-gray-300" />
                    <p className="text-gray-400 font-medium text-sm">No transaction records found matching filter.</p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type === "credit";
                    return (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-gray-100 hover:bg-gray-50/40 transition group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[16px] transition group-hover:scale-105 duration-300 ${isCredit
                              ? "bg-green-50 text-green-600"
                              : "bg-orange-50 text-orange-600"
                              }`}
                          >
                            {isCredit ? <FaArrowUp /> : <FaArrowDown />}
                          </span>
                          <div className="min-w-0">
                            <span className="font-extrabold text-[15px] text-gray-800 block leading-tight">
                              {tx.description}
                            </span>
                            <span className="text-xs text-gray-400 block mt-1.5">
                              {new Date(tx.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                            {tx.orderId && (
                              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                                Order: #{String(tx.orderId).slice(-6).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-lg font-black block ${isCredit ? "text-green-600" : "text-gray-800"
                              }`}
                          >
                            {isCredit ? "+" : "-"}₹{tx.amount}
                          </span>
                          <span
                            className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${tx.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wallet;

