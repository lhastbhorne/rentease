import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import SearchFilter from "../../components/common/SearchFilter";
import PropertyGrid from "../../components/property/public/PropertyGrid";
import Pagination from "../../components/common/Pagination";

import { getAllProperties } from "../../firebase/propertyService";

const ITEMS_PER_PAGE = 6;

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  /* ============================
     LOAD PROPERTIES
  ============================ */

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getAllProperties();
        setProperties(data);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    }

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
        case "all":
        case "any":
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

      /* ============================
         FINAL RESULT
      ============================ */

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
     RETURN
  ============================ */

  return (
    <main className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      {/* Search / Filter */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <SearchFilter onSearch={handleSearch} />
      </motion.section>

      {/* Properties */}
      <section className="px-5 py-12 transition-colors duration-300 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-10"
          >
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              Explore Properties
            </span>

            <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-4xl">
                  Find Your Next Home
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 transition-colors duration-300 dark:text-slate-300">
                  Discover available properties and find a place that fits your
                  lifestyle and budget.
                </p>
              </div>

              {!loading && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {filteredProperties.length}{" "}
                  {filteredProperties.length === 1 ? "property" : "properties"}{" "}
                  found
                </p>
              )}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading ? (
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
          ) : filteredProperties.length > 0 ? (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PropertyGrid properties={paginatedProperties} />
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FaSearchIcon />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
                No properties found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-400">
                We couldn't find properties matching your search criteria. Try
                adjusting your filters or searching for something else.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSearch({
                    keyword: "",
                    location: "",
                    propertyType: "",
                    priceRange: "",
                    bedrooms: "",
                  })
                }
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Clear Search
              </button>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && filteredProperties.length > ITEMS_PER_PAGE && (
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
      </section>
    </main>
  );
}

/* ============================
   SEARCH ICON
============================ */

function FaSearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
    >
      <path
        fillRule="evenodd"
        d="M10.5 3a7.5 7.5 0 1 0 4.72 13.33l4.22 4.22a.75.75 0 1 0 1.06-1.06l-4.22-4.22A7.5 7.5 0 0 0 10.5 3Zm-6 7.5a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default Properties;
