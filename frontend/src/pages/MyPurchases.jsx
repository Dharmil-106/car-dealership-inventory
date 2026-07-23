import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { getMyPurchases } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function MyPurchases() {
  const { user, token } = useAuth();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Protected route check: logged-in users only
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPurchases(token);
      setPurchases(data);
    } catch (err) {
      setError(err.message || "Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">My Purchases</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review your order history and purchased vehicles.
      </p>

      {/* Error state */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
        </div>
      )}

      {/* Purchase table */}
      {!loading && !error && purchases.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th scope="col" className="px-6 py-3">Make</th>
                  <th scope="col" className="px-6 py-3">Model</th>
                  <th scope="col" className="px-6 py-3">Price Paid</th>
                  <th scope="col" className="px-6 py-3">Purchase Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((p) => {
                  const vehicle = p.vehicleId || p.vehicle || {};
                  const dateStr = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr key={p._id || p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {vehicle.make || p.make || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {vehicle.model || p.model || "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-600">
                        ${(vehicle.price || p.pricePaid || p.price)?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && purchases.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-gray-400">
            No purchases yet
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Browse our inventory to find and purchase your next vehicle.
          </p>
        </div>
      )}
    </div>
  );
}
