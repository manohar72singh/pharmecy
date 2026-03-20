import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import walletService from "../../services/walletservice";

const TXN_CONFIG = {
  credit: { icon: "⬆️", color: "text-emerald-600", label: "Credit" },
  debit: { icon: "⬇️", color: "text-red-500", label: "Debit" },
  refund: { icon: "↩️", color: "text-blue-600", label: "Refund" },
  cashback: { icon: "🎁", color: "text-purple-600", label: "Cashback" },
};

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletService
      .get()
      .then((res) => {
        setWallet(res.data.data.wallet);
        setTxns(res.data.data.transactions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">My Wallet</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div
          className="rounded-3xl p-8 text-white text-center mb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #065f46, #059669, #0d9488)",
          }}
        >
          <div className="absolute inset-0 opacity-10 text-9xl flex items-center justify-center">
            👛
          </div>
          <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest mb-2">
            MediShop Wallet
          </p>
          <p className="text-5xl font-black mb-1">
            ₹{parseFloat(wallet?.balance || 0).toFixed(2)}
          </p>
          <p className="text-emerald-200 text-sm">Available Balance</p>

          <div className="flex gap-3 justify-center mt-6">
            <div className="bg-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-xs text-emerald-100">Total Credited</p>
              <p className="font-black text-lg">
                ₹
                {txns
                  .filter(
                    (t) =>
                      t.type === "credit" ||
                      t.type === "refund" ||
                      t.type === "cashback",
                  )
                  .reduce((s, t) => s + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-xs text-emerald-100">Total Used</p>
              <p className="font-black text-lg">
                ₹
                {txns
                  .filter((t) => t.type === "debit")
                  .reduce((s, t) => s + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-700">
          💡 You can use your wallet balance for orders — simply choose "Wallet"
          as your payment method during checkout.
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Transaction History</h3>
          </div>

          {txns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500 font-semibold">
                No transactions found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Your transaction history will appear here after you place an
                order.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {txns.map((txn) => {
                const cfg = TXN_CONFIG[txn.type] || TXN_CONFIG.credit;
                const isCredit = ["credit", "refund", "cashback"].includes(
                  txn.type,
                );
                return (
                  <div
                    key={txn.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm capitalize">
                        {cfg.label}
                      </p>
                      {txn.description && (
                        <p className="text-xs text-gray-400 truncate">
                          {txn.description}
                        </p>
                      )}
                      {txn.created_at && (
                        <p className="text-xs text-gray-400">
                          {new Date(txn.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                    </div>
                    <p
                      className={`font-black text-base flex-shrink-0 ${cfg.color}`}
                    >
                      {isCredit ? "+" : "−"}₹{parseFloat(txn.amount).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
