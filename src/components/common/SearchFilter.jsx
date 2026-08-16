import { useState } from "react";
import {
  locations,
  propertyTypes,
  priceRanges,
  bedrooms,
} from "../../data/filterOptions";

import { FaSearch } from "react-icons/fa";

function SearchFilter() {
  const [filters, setFilters] = useState({
    keyword: "",
    location: locations[0],
    propertyType: propertyTypes[0],
    priceRange: priceRanges[0],
    bedrooms: bedrooms[0],
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSearch(e) {
    e.preventDefault();

    console.log(filters);

    // Later:
    // fetch("/api/properties", filters)
  }

  return (
    <section className="bg-white py-12 shadow-sm">
      <div className="mx-auto max-w-7xl px-6">
        <form onSubmit={handleSearch} className="grid gap-5 lg:grid-cols-6">
          {/* Keyword */}

          <input
            type="text"
            name="keyword"
            placeholder="Search property..."
            value={filters.keyword}
            onChange={handleChange}
            className="rounded-xl border p-4 outline-none transition focus:border-blue-500"
          />

          {/* Location */}

          <select
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="rounded-xl border p-4"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          {/* Property Type */}

          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className="rounded-xl border p-4"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Price */}

          <select
            name="priceRange"
            value={filters.priceRange}
            onChange={handleChange}
            className="rounded-xl border p-4"
          >
            {priceRanges.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>

          {/* Bedrooms */}

          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
            className="rounded-xl border p-4"
          >
            {bedrooms.map((bedroom) => (
              <option key={bedroom} value={bedroom}>
                {bedroom}
              </option>
            ))}
          </select>

          {/* Button */}

          <button
            type="submit"
            className="flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            <FaSearch />
            Search
          </button>
        </form>
      </div>
    </section>
  );
}

export default SearchFilter;
