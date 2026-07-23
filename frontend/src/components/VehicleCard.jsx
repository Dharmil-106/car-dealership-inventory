import { useState } from "react";

/**
 * Displays a single vehicle as a card with purchase functionality.
 *
 * Props:
 *   vehicle   — { id, make, model, category, price, quantity }
 *   onPurchase — async (vehicleId) => updatedVehicle | throws
 *   isLoggedIn — whether the user has a valid session
 *   onLoginRedirect — called when an unauthenticated user clicks Purchase
 */
export default function VehicleCard({
  vehicle,
  onPurchase,
  isLoggedIn,
  onLoginRedirect,
}) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  const inStock = vehicle.quantity > 0;

  async function handleClick() {
    // Unauthenticated → redirect to login
    if (!isLoggedIn) {
      onLoginRedirect?.();
      return;
    }

    setPurchasing(true);
    setError(null);
    try {
      await onPurchase(vehicle.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing(false);
    }
  }

  // Determine button state
  const disabled = !inStock || purchasing;

  let buttonLabel = "Purchase";
  if (purchasing) buttonLabel = "Purchasing…";
  else if (!inStock) buttonLabel = "Out of Stock";

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Make + Model */}
      <h3 className="text-lg font-semibold text-gray-900">
        {vehicle.make} {vehicle.model}
      </h3>

      {/* Category pill */}
      <span className="mt-1.5 inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        {vehicle.category}
      </span>

      {/* Price */}
      <p className="mt-4 text-2xl font-bold text-emerald-600">
        ${vehicle.price.toLocaleString()}
      </p>

      {/* Stock badge */}
      <div className="mt-2">
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

      {/* Inline purchase error */}
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {/* Purchase button */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleClick}
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
    </div>
  );
}
