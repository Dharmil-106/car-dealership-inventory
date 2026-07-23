import { useState } from "react";

/**
 * Confirmation modal before purchasing a vehicle.
 *
 * Props:
 *   vehicle   — { id, make, model, category, price, quantity, imageUrl }
 *   onConfirm — async () => void
 *   onClose   — () => void
 *   loading   — boolean (API request in flight)
 *   error     — string | null (error from purchase API call)
 */
export default function ConfirmPurchaseModal({
  vehicle,
  onConfirm,
  onClose,
  loading,
  error,
}) {
  const [imgError, setImgError] = useState(false);

  if (!vehicle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md my-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xl transition-all">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Purchase
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            {vehicle.imageUrl && !imgError ? (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
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

          {/* Vehicle summary */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {vehicle.make} {vehicle.model}
                </h3>
                <span className="inline-flex rounded-full bg-gray-200/60 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {vehicle.category}
                </span>
              </div>
              <p className="text-xl font-bold text-emerald-600">
                ${vehicle.price?.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to purchase this{" "}
            <strong className="font-semibold text-gray-900">
              {vehicle.make} {vehicle.model}
            </strong>{" "}
            for{" "}
            <strong className="font-semibold text-emerald-600">
              ${vehicle.price?.toLocaleString()}
            </strong>
            ?
          </p>

          {/* Error alert */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white align-middle" />
            )}
            {loading ? "Confirming…" : "Confirm Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}
