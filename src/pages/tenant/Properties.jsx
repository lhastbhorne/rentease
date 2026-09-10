import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaRedo, FaSearch } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SearchFilter from "../../components/common/SearchFilter";
import PropertyGrid from "../../components/property/public/PropertyGrid";
import Pagination from "../../components/common/Pagination";

import { getAllProperties } from "../../firebase/propertyService";

const ITEMS_PER_PAGE = 6;

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ============================
     LOAD PROPERTIES
  ============================ */

  async function loadProperties() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllProperties();

      setProperties(data);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError("Unable to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  /* ============================
     FILTER PROPERTIES
  ============================ */

  const filteredProperties = useMemo(() => {
    if (!filters) {
      return properties;
    }

    return properties.filter((property) => {
      /* ============================
         KEYWORD
      ============================ */

      const keyword = String(filters.keyword || "")
        .trim()
        .toLowerCase();

      const searchableText = [
        property.title,
        property.description,
        property.category,
        property.type,
        property.areaName,
        property.city,
        property.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = !keyword || searchableText.includes(keyword);

      /* ============================
         LOCATION
      ============================ */

      const selectedLocation = String(filters.location || "")
        .trim()
        .toLowerCase();

      const propertyState = String(property.state || "")
        .trim()
        .toLowerCase();

      const propertyCity = String(property.city || "")
        .trim()
        .toLowerCase();

      const propertyArea = String(property.areaName || "")
        .trim()
        .toLowerCase();

      const matchesLocation =
        !selectedLocation ||
        selectedLocation === "all locations" ||
        selectedLocation === "all" ||
        propertyState === selectedLocation ||
        propertyCity === selectedLocation ||
        propertyArea === selectedLocation;

      /* ============================
         PROPERTY TYPE
      ============================ */

      const selectedType = String(filters.propertyType || "")
        .trim()
        .toLowerCase();

      const propertyType = String(property.type || "")
        .trim()
        .toLowerCase();

      const matchesPropertyType =
        !selectedType ||
        selectedType === "all types" ||
        selectedType === "all" ||
        propertyType === selectedType;

      /* ============================
         BEDROOMS
      ============================ */

      const selectedBedrooms = String(filters.bedrooms || "")
        .trim()
        .toLowerCase();

      const propertyBedrooms = Number(property.bedrooms) || 0;

      let matchesBedrooms = true;

      if (
        selectedBedrooms &&
        selectedBedrooms !== "any" &&
        selectedBedrooms !== "all"
      ) {
        const bedroomNumber = parseInt(selectedBedrooms, 10);

        if (!Number.isNaN(bedroomNumber)) {
          if (selectedBedrooms.includes("+")) {
            matchesBedrooms = propertyBedrooms >= bedroomNumber;
          } else {
            matchesBedrooms = propertyBedrooms === bedroomNumber;
          }
        }
      }

      /* ============================
         PRICE
      ============================ */

      const propertyPrice = Number(property.price) || 0;

      const selectedPrice = String(filters.priceRange || "")
        .trim()
        .toLowerCase();

      let matchesPrice = true;

      switch (selectedPrice) {
        case "":
        case "any price":
        case "any":
        case "all":
          matchesPrice = true;
          break;

        case "under ₦500,000":
          matchesPrice = propertyPrice < 500000;
          break;

        case "₦500,000 - ₦1,000,000":
          matchesPrice = propertyPrice >= 500000 && propertyPrice <= 1000000;
          break;

        case "₦1,000,000 - ₦2,000,000":
          matchesPrice = propertyPrice > 1000000 && propertyPrice <= 2000000;
          break;

        case "₦2,000,000 - ₦5,000,000":
          matchesPrice = propertyPrice > 2000000 && propertyPrice <= 5000000;
          break;

        case "₦5,000,000 - ₦10,000,000":
          matchesPrice = propertyPrice > 5000000 && propertyPrice <= 10000000;
          break;

        case "₦10,000,000 - ₦20,000,000":
          matchesPrice = propertyPrice > 10000000 && propertyPrice <= 20000000;
          break;

        case "₦20,000,000+":
          matchesPrice = propertyPrice > 20000000;
          break;

        default:
          matchesPrice = true;
      }

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesPropertyType &&
        matchesBedrooms &&
        matchesPrice
      );
    });
  }, [properties, filters]);

  /* ============================
     SEARCH
  ============================ */

  function handleSearch(newFilters) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  /* ============================
     PAGINATION
  ============================ */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ITEMS_PER_PAGE),
  );

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ============================
     CLEAR SEARCH
  ============================ */

  function handleClearSearch() {
    setFilters({
      keyword: "",
      location: "",
      propertyType: "",
      priceRange: "",
      bedrooms: "",
    });

    setCurrentPage(1);
  }

  /* ============================
     RETURN
  ============================ */

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* ============================
            PAGE HEADER
        ============================ */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-colors duration-300 dark:bg-blue-500/10 dark:text-blue-400">
              <FaHome className="text-xl" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800 transition-colors duration-300 dark:text-white sm:text-4xl">
                Browse Properties
              </h1>

              <p className="mt-1 text-base text-slate-500 transition-colors duration-300 dark:text-slate-400 sm:text-lg">
                Find a property that suits your needs and submit an application.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ============================
            SEARCH & FILTER
        ============================ */}

        <motion.section
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <SearchFilter onSearch={handleSearch} />
        </motion.section>

        {/* ============================
            RESULTS HEADER
        ============================ */}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Available Properties
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Explore homes and properties available for rent.
              </p>
            </div>

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}{" "}
              found
            </p>
          </motion.div>
        )}

        {/* ============================
            LOADING
        ============================ */}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-60 animate-pulse bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-4 p-6">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-10 w-1/3 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ============================
            ERROR
        ============================ */}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm dark:border-red-500/20 dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <FaHome className="text-2xl" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-red-600 dark:text-red-400">
              Something went wrong
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <motion.button
              type="button"
              onClick={loadProperties}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <FaRedo />
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* ============================
    RESULTS
============================ */}

        {!loading && !error && filteredProperties.length > 0 && (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PropertyGrid properties={paginatedProperties} tenantView={true} />
          </motion.div>
        )}

        {/* ============================
    NO PROPERTIES AT ALL
============================ */}

        {!loading && !error && properties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <FaHome className="text-2xl" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
              No Properties Found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
              There are currently no rental properties available.
            </p>
          </motion.div>
        )}

        {/* ============================
    NO MATCHING SEARCH RESULTS
============================ */}

        {!loading &&
          !error &&
          properties.length > 0 &&
          filteredProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FaSearch className="text-2xl" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
                No properties found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
                We couldn't find any properties matching your search criteria.
                Try adjusting your filters.
              </p>

              <motion.button
                type="button"
                onClick={handleClearSearch}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <FaRedo />
                Clear Search
              </motion.button>
            </motion.div>
          )}

        {/* ============================
            PAGINATION
        ============================ */}

        {!loading && !error && filteredProperties.length > ITEMS_PER_PAGE && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Properties;
