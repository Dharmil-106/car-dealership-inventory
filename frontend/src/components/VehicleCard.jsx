import { useState } from "react";

/**
 * Displays a single vehicle as a card with purchase & admin controls.
 *
 * Props:
 *   vehicle         — { id, make, model, category, price, quantity }
 *   onPurchase      — async (vehicleId) => updatedVehicle | throws
 *   isLoggedIn      — boolean
 *   isAdmin         — boolean (shows Edit, Delete, Restock)
 *   onLoginRedirect — callback when unauthenticated purchase is clicked
 *   onEdit          — function(vehicle)
 *   onDelete        — async (vehicleId)
 *   onRestock       — async (vehicleId, amount)
 */
export default function VehicleCard({
  vehicle,
  onPurchase,
  isLoggedIn,
  isAdmin,
  onLoginRedirect,
  onEdit,
  onDelete,
  onRestock,
}) {
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [showRestockInput, setShowRestockInput] = useState(false);
  const [restockAmount, setRestockAmount] = useState("5");
  const [error, setError] = useState(null);

  const inStock = vehicle.quantity > 0;

  async function handlePurchase() {
    if (!isLoggedIn) {
      onLoginRedirect?.();
      return;
    }

    setPurchasing(true);
    setError(null);
    try {
      await onPurchase(vehicle.id);
    } catch (err) {
      setError(err.message || "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await onDelete(vehicle.id);
    } catch (err) {
      setError(err.message || "Failed to delete vehicle.");
      setDeleting(false);
    }
  }

  async function handleRestockSubmit(e) {
    e.preventDefault();
    const amt = Number(restockAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount (> 0).");
      return;
    }

    setRestocking(true);
    setError(null);
    try {
      await onRestock(vehicle.id, amt);
      setShowRestockInput(false);
    } catch (err) {
      setError(err.message || "Failed to restock vehicle.");
    } finally {
      setRestocking(false);
    }
  }

  const disabled = !inStock || purchasing;

  let buttonLabel = "Purchase";
  if (purchasing) buttonLabel = "Purchasing…";
  else if (!inStock) buttonLabel = "Out of Stock";

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Make + Model + Admin Badges/Controls */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="mt-1.5 inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {vehicle.category}
          </span>
        </div>

        {/* Admin actions dropdown/buttons */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(vehicle)}
              title="Edit vehicle"
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete vehicle"
              className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Price */}
      <p className="mt-4 text-2xl font-bold text-emerald-600">
        ${vehicle.price.toLocaleString()}
      </p>

      {/* Stock badge & Admin Restock button */}
      <div className="mt-2 flex items-center justify-between">
        {inStock ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {vehicle.quantity} in stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Out of Stock
          </span>
        )}

        {isAdmin && !showRestockInput && (
          <button
            type="button"
            onClick={() => setShowRestockInput(true)}
            className="text-xs font-medium text-emerald-600 hover:underline"
          >
            + Restock
          </button>
        )}
      </div>

      {/* Restock Inline Input */}
      {isAdmin && showRestockInput && (
        <form onSubmit={handleRestockSubmit} className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={restockAmount}
            onChange={(e) => setRestockAmount(e.target.value)}
            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
            placeholder="Amount"
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
            onClick={() => setShowRestockInput(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Inline error */}
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {/* Purchase button — visible to customers and logged-out users only */}
      {!isAdmin && (
        <div className="mt-auto pt-4">
          <button
            onClick={handlePurchase}
            disabled={disabled}
            className={`block w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              disabled
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {purchasing && (
              <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-white align-middle" />
            )}
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
