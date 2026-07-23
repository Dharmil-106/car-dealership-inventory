/**
 * Displays a single vehicle as a card.
 * Props: vehicle ({ id, make, model, category, price, quantity })
 *        onPurchase — callback, wired up in the next step
 */
export default function VehicleCard({ vehicle, onPurchase }) {
  const inStock = vehicle.quantity > 0;

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

      {/* Purchase button — placeholder, full logic in next step */}
      <button
        onClick={() => onPurchase?.(vehicle.id)}
        disabled={!inStock}
        className="mt-auto pt-4"
      >
        <span
          className={`block w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            inStock
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {inStock ? "Purchase" : "Out of Stock"}
        </span>
      </button>
    </div>
  );
}
