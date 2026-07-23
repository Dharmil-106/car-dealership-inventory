import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  getAllVehicles,
  deleteVehicle,
  restockVehicle,
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import VehicleForm from "../components/VehicleForm";

/**
 * Individual Table Row component handling image error & restock state.
 */
function VehicleTableRow({ vehicle, onEdit, onDelete, onRestock }) {
  const [imgError, setImgError] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [restockAmt, setRestockAmt] = useState("5");
  const [restocking, setRestocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowError, setRowError] = useState(null);

  const inStock = vehicle.quantity > 0;

  async function handleRestockSubmit(e) {
    e.preventDefault();
    const amt = Number(restockAmt);
    if (isNaN(amt) || amt <= 0) return;

    setRestocking(true);
    setRowError(null);
    try {
      await onRestock(vehicle.id, amt);
      setShowRestock(false);
    } catch (err) {
      setRowError(err.message || "Failed to restock.");
    } finally {
      setRestocking(false);
    }
  }

  async function handleDeleteClick() {
    if (!window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      return;
    }
    setDeleting(true);
    setRowError(null);
    try {
      await onDelete(vehicle.id);
    } catch (err) {
      setRowError(err.message || "Failed to delete.");
      setDeleting(false);
    }
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Thumbnail */}
      <td className="px-4 py-3 align-middle">
        <div className="h-10 w-16 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
          {vehicle.imageUrl && !imgError ? (
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM3 9l2-4h14l2 4M3 9v7a1 1 0 001 1h1m12 0h1a1 1 0 001-1V9M3 9h18"
              />
            </svg>
          )}
        </div>
      </td>

      {/* Make */}
      <td className="px-4 py-3 font-semibold text-gray-900 align-middle">
        {vehicle.make}
      </td>

      {/* Model */}
      <td className="px-4 py-3 text-gray-700 align-middle">
        {vehicle.model}
      </td>

      {/* Category */}
      <td className="px-4 py-3 align-middle">
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {vehicle.category}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3 font-medium text-emerald-600 align-middle">
        ${vehicle.price?.toLocaleString()}
      </td>

      {/* Quantity / Stock Status */}
      <td className="px-4 py-3 align-middle">
        {inStock ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {vehicle.quantity} in stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Out of Stock
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          {!showRestock ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(vehicle)}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowRestock(true)}
                className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                + Restock
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleting}
                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? "…" : "Delete"}
              </button>
            </>
          ) : (
            <form onSubmit={handleRestockSubmit} className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                required
                value={restockAmt}
                onChange={(e) => setRestockAmt(e.target.value)}
                className="w-16 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                placeholder="Qty"
              />
              <button
                type="submit"
                disabled={restocking}
                className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {restocking ? "…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowRestock(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </form>
          )}
        </div>
        {rowError && (
          <p className="mt-1 text-xs text-red-600">{rowError}</p>
        )}
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const { user, token } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form / Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Protected route check
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Compute stat card figures
  const totalVehicles = vehicles.length;
  const totalInventoryValue = vehicles.reduce(
    (sum, v) => sum + (v.price || 0) * (v.quantity || 0),
    0
  );
  const totalUnitsInStock = vehicles.reduce(
    (sum, v) => sum + (v.quantity || 0),
    0
  );
  const outOfStockCount = vehicles.filter((v) => v.quantity === 0).length;

  // Actions
  async function handleDelete(vehicleId) {
    await deleteVehicle(vehicleId, token);
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  }

  async function handleRestock(vehicleId, amount) {
    const result = await restockVehicle(vehicleId, amount, token);
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, quantity: result.quantity } : v
      )
    );
  }

  function handleFormSuccess(savedVehicle, isEdit) {
    if (isEdit) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === savedVehicle.id ? savedVehicle : v))
      );
    } else {
      setVehicles((prev) => [savedVehicle, ...prev]);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Overview Anchor & Top Header */}
        <div id="overview" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
            <p className="text-sm text-gray-500">
              Manage inventory, monitor stock levels, and track inventory value.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingVehicle(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none sm:self-auto"
          >
            <span className="text-lg leading-none">+</span> Add Vehicle
          </button>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Vehicles */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Total Vehicles
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? "…" : totalVehicles}
            </p>
            <p className="mt-1 text-xs text-gray-400">Distinct catalog models</p>
          </div>

          {/* Card 2: Inventory Value */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Total Inventory Value
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {loading ? "…" : `$${totalInventoryValue.toLocaleString()}`}
            </p>
            <p className="mt-1 text-xs text-gray-400">Sum of price × stock</p>
          </div>

          {/* Card 3: Total Units */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Units in Stock
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? "…" : totalUnitsInStock}
            </p>
            <p className="mt-1 text-xs text-gray-400">Available physical units</p>
          </div>

          {/* Card 4: Out of Stock */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Out of Stock
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                outOfStockCount > 0 ? "text-red-600" : "text-gray-900"
              }`}
            >
              {loading ? "…" : outOfStockCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">Requires restocking</p>
          </div>
        </div>

        {/* Global Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
          </div>
        )}

        {/* Vehicle Management Section (Table) */}
        {!loading && !error && (
          <div id="manage-vehicles" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Vehicle Management Table
                </h2>
                <p className="text-xs text-gray-500">
                  View, edit, restock, or remove catalog inventory.
                </p>
              </div>
              <span className="rounded-full bg-gray-200/70 px-3 py-1 text-xs font-medium text-gray-700">
                {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}
              </span>
            </div>

            {vehicles.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                No vehicles in inventory. Click &quot;Add Vehicle&quot; above to create one.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                      <tr>
                        <th scope="col" className="px-4 py-3">Image</th>
                        <th scope="col" className="px-4 py-3">Make</th>
                        <th scope="col" className="px-4 py-3">Model</th>
                        <th scope="col" className="px-4 py-3">Category</th>
                        <th scope="col" className="px-4 py-3">Price</th>
                        <th scope="col" className="px-4 py-3">Quantity</th>
                        <th scope="col" className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vehicles.map((vehicle) => (
                        <VehicleTableRow
                          key={vehicle.id}
                          vehicle={vehicle}
                          onEdit={(v) => {
                            setEditingVehicle(v);
                            setShowForm(true);
                          }}
                          onDelete={handleDelete}
                          onRestock={handleRestock}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vehicle Form Modal */}
        {showForm && (
          <VehicleForm
            existingVehicle={editingVehicle}
            onClose={() => {
              setShowForm(false);
              setEditingVehicle(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
