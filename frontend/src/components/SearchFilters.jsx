import { useState } from "react";

const EMPTY_FILTERS = {
  make: "",
  model: "",
  category: "",
  minPrice: "",
  maxPrice: "",
};

/**
 * Filter bar for vehicle search.
 * Props: onSearch(filters), loading
 */
export default function SearchFilters({ onSearch, loading }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  function handleChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(filters);
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    onSearch(EMPTY_FILTERS);
  }

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Make */}
        <div>
          <label
            htmlFor="filter-make"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Make
          </label>
          <input
            id="filter-make"
            name="make"
            type="text"
            value={filters.make}
            onChange={handleChange}
            placeholder="e.g. Toyota"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Model */}
        <div>
          <label
            htmlFor="filter-model"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Model
          </label>
          <input
            id="filter-model"
            name="model"
            type="text"
            value={filters.model}
            onChange={handleChange}
            placeholder="e.g. Camry"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="filter-category"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Category
          </label>
          <input
            id="filter-category"
            name="category"
            type="text"
            value={filters.category}
            onChange={handleChange}
            placeholder="e.g. SUV"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Min Price */}
        <div>
          <label
            htmlFor="filter-minPrice"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Min Price
          </label>
          <input
            id="filter-minPrice"
            name="minPrice"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="$0"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Max Price */}
        <div>
          <label
            htmlFor="filter-maxPrice"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Max Price
          </label>
          <input
            id="filter-maxPrice"
            name="maxPrice"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="$999,999"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
      </div>
    </form>
  );
}
