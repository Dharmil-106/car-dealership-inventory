import { useState } from "react";
import ConfirmPurchaseModal from "./ConfirmPurchaseModal";

/**
 * Displays a single vehicle as a browsing card with purchase capability for customers.
 * Admin management controls have moved to the dedicated /admin table.
 *
 * Props:
 *   vehicle         — { id, make, model, category, price, quantity, imageUrl }
 *   onPurchase      — async (vehicleId) => updatedVehicle | throws
 *   isLoggedIn      — boolean
 *   isAdmin         — boolean (hides purchase button for admin role)
 *   onLoginRedirect — callback when unauthenticated purchase is clicked
 */
export default function VehicleCard({
  vehicle,
  onPurchase,
  isLoggedIn,
  isAdmin,
  onLoginRedirect,
}) {
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  const inStock = vehicle.quantity > 0;

  /** Called when the user clicks the "Purchase" button on the card */
  function handlePurchaseClick() {
    if (!isLoggedIn) {
      onLoginRedirect?.();
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  }

  /** Called when the user confirms the purchase inside ConfirmPurchaseModal */
  async function handleConfirmPurchase() {
    setPurchasing(true);
    setError(null);
    try {
      await onPurchase(vehicle.id);
      setShowConfirmModal(false);
    } catch (err) {
      setError(err.message || "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  }

  const disabled = !inStock || purchasing;

  let buttonLabel = "Purchase";
  if (purchasing) buttonLabel = "Purchasing…";
  else if (!inStock) buttonLabel = "Out of Stock";

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Vehicle Image / Placeholder */}
      <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        {vehicle.imageUrl && !imgError ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-300"
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
          </div>
        )}
      </div>

      {/* Make + Model */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="mt-1.5 inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {vehicle.category}
          </span>
        </div>
      </div>

      {/* Price */}
      <p className="mt-4 text-2xl font-bold text-emerald-600">
        ${vehicle.price.toLocaleString()}
      </p>

      {/* Stock badge */}
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
      </div>

      {/* Inline error */}
      {error && !showConfirmModal && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {/* Purchase button — visible to customers and logged-out users only */}
      {!isAdmin && (
        <div className="mt-auto pt-4">
          <button
            onClick={handlePurchaseClick}
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

      {/* Confirmation modal before purchasing */}
      {showConfirmModal && (
        <ConfirmPurchaseModal
          vehicle={vehicle}
          onConfirm={handleConfirmPurchase}
          onClose={() => {
            if (!purchasing) {
              setShowConfirmModal(false);
              setError(null);
            }
          }}
          loading={purchasing}
          error={error}
        />
      )}
    </div>
  );
}
