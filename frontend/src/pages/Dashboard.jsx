import { useState, useEffect, useCallback } from "react";
import { getAllVehicles, searchVehicles } from "../api/api";
import VehicleCard from "../components/VehicleCard";
import SearchFilters from "../components/SearchFilters";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Fetch all vehicles on mount */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** Called by SearchFilters on submit */
  async function handleSearch(filters) {
    const hasAny = Object.values(filters).some(
      (v) => v !== "" && v !== undefined && v !== null
    );

    setLoading(true);
    setError(null);
    try {
      const data = hasAny ? await searchVehicles(filters) : await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /** Purchase placeholder — will be wired to the API in the next step */
  function handlePurchase(vehicleId) {
    console.log("Purchase clicked for vehicle:", vehicleId);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
      <p className="mt-1 text-sm text-gray-500">
        Browse our current vehicle lineup.
      </p>

      {/* Search filters */}
      <div className="mt-5">
        <SearchFilters onSearch={handleSearch} loading={loading} />
      </div>

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

      {/* Vehicle grid */}
      {!loading && !error && vehicles.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && vehicles.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-gray-400">
            No vehicles match your filters
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Try adjusting your search criteria or clearing filters.
          </p>
        </div>
      )}
    </div>
  );
}
