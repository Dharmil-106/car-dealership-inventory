import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  getAllVehicles,
  deleteVehicle,
  restockVehicle,
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import VehicleCard from "../components/VehicleCard";
import VehicleForm from "../components/VehicleForm";

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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none"
          >
            <span className="text-lg leading-none">+</span> Add New Vehicle
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

        {/* Error message */}
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

        {/* Vehicles Section */}
        {!loading && !error && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Vehicle Inventory List
            </h2>
            {vehicles.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                No vehicles in inventory yet. Click &quot;Add New Vehicle&quot; to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isAdmin={true}
                    isLoggedIn={true}
                    onEdit={(v) => {
                      setEditingVehicle(v);
                      setShowForm(true);
                    }}
                    onDelete={handleDelete}
                    onRestock={handleRestock}
                  />
                ))}
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
