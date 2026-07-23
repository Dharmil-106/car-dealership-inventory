import { useState, useEffect } from "react";
import { createVehicle, updateVehicle } from "../api/api";
import { useAuth } from "../context/AuthContext";

/**
 * Reusable modal/form component for creating or editing a vehicle.
 *
 * Props:
 *   existingVehicle — optional vehicle object for editing mode
 *   onClose         — function to dismiss the modal/form
 *   onSuccess       — function(savedVehicle, isEdit) called after API success
 */
export default function VehicleForm({ existingVehicle, onClose, onSuccess }) {
  const { token } = useAuth();

  const isEdit = Boolean(existingVehicle);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    category: "",
    price: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingVehicle) {
      setFormData({
        make: existingVehicle.make || "",
        model: existingVehicle.model || "",
        category: existingVehicle.category || "",
        price: existingVehicle.price ?? "",
        quantity: existingVehicle.quantity ?? "",
      });
    }
  }, [existingVehicle]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(formData.price);
    const quantityNum = Number(formData.quantity);

    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid number greater than or equal to 0.");
      return;
    }

    if (isNaN(quantityNum) || quantityNum < 0) {
      setError("Quantity must be a valid number greater than or equal to 0.");
      return;
    }

    const payload = {
      make: formData.make.trim(),
      model: formData.model.trim(),
      category: formData.category.trim(),
      price: priceNum,
      quantity: quantityNum,
    };

    setLoading(true);
    try {
      let saved;
      if (isEdit) {
        saved = await updateVehicle(existingVehicle.id, payload, token);
      } else {
        saved = await createVehicle(payload, token);
      }
      onSuccess?.(saved, isEdit);
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to save vehicle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vehicle-make"
                className="block text-sm font-medium text-gray-700"
              >
                Make
              </label>
              <input
                id="vehicle-make"
                name="make"
                type="text"
                required
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="vehicle-model"
                className="block text-sm font-medium text-gray-700"
              >
                Model
              </label>
              <input
                id="vehicle-model"
                name="model"
                type="text"
                required
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Camry"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="vehicle-category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <input
              id="vehicle-category"
              name="category"
              type="text"
              required
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Sedan, SUV, Truck"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vehicle-price"
                className="block text-sm font-medium text-gray-700"
              >
                Price ($)
              </label>
              <input
                id="vehicle-price"
                name="price"
                type="number"
                min="0"
                step="any"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="24999"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="vehicle-quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>
              <input
                id="vehicle-quantity"
                name="quantity"
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="5"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {loading ? (isEdit ? "Saving…" : "Adding…") : isEdit ? "Save Changes" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
