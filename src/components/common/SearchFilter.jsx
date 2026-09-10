import { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaSlidersH, FaRedo } from "react-icons/fa";

import {
  locations,
  propertyTypes,
  priceRanges,
  bedrooms,
} from "../../data/filterOptions";

function SearchFilter({ onSearch = () => {} }) {
  const initialFilters = {
    keyword: "",
    location: locations[0],
    propertyType: propertyTypes[0],
    priceRange: priceRanges[0],
    bedrooms: bedrooms[0],
  };

  const [filters, setFilters] = useState(initialFilters);

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();

    onSearch(filters);
  }

  function handleReset() {
    setFilters(initialFilters);
    onSearch(initialFilters);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-7"
    >
      {/* ============================
          HEADER
      ============================ */}

      <div className="mb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <FaSlidersH />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Find a Property
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              Search and filter properties based on what you're looking for.
            </p>
          </div>
        </div>
      </div>

      {/* ============================
          FORM
      ============================ */}

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Keyword */}
          <div>
            <label
              htmlFor="keyword"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Keyword
            </label>

            <input
              id="keyword"
              name="keyword"
              type="text"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Search property..."
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Location
            </label>

            <select
              id="location"
              name="location"
              value={filters.location}
              onChange={handleChange}
              className="h-14 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label
              htmlFor="propertyType"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Property Type
            </label>

            <select
              id="propertyType"
              name="propertyType"
              value={filters.propertyType}
              onChange={handleChange}
              className="h-14 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label
              htmlFor="priceRange"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Price Range
            </label>

            <select
              id="priceRange"
              name="priceRange"
              value={filters.priceRange}
              onChange={handleChange}
              className="h-14 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
            >
              {priceRanges.map((price) => (
                <option key={price} value={price}>
                  {price}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label
              htmlFor="bedrooms"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Bedrooms
            </label>

            <select
              id="bedrooms"
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleChange}
              className="h-14 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
            >
              {bedrooms.map((bedroom) => (
                <option key={bedroom} value={bedroom}>
                  {bedroom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ============================
            ACTION BUTTONS
        ============================ */}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <motion.button
            type="submit"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
          >
            <FaSearch />
            Search Properties
          </motion.button>

          <motion.button
            type="button"
            onClick={handleReset}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FaRedo />
            Reset
          </motion.button>
        </div>
      </form>
    </motion.section>
  );
}

export default SearchFilter;
