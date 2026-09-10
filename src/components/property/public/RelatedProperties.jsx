import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import { getAllProperties } from "../../../firebase/propertyService";

function RelatedProperties({ property = null, basePath = "/properties" }) {
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD RELATED PROPERTIES
  // ==========================================

  useEffect(() => {
    async function loadRelatedProperties() {
      try {
        setLoading(true);

        const properties = await getAllProperties();

        // Remove the property currently being viewed
        const otherProperties = properties.filter(
          (item) => item.id !== property?.id,
        );

        // ======================================
        // SCORE PROPERTIES
        // ======================================

        const scoredProperties = otherProperties.map((item) => {
          let score = 0;

          // Same city
          if (
            property?.city &&
            item.city &&
            item.city.toLowerCase() === property.city.toLowerCase()
          ) {
            score += 5;
          }

          // Same state
          if (
            property?.state &&
            item.state &&
            item.state.toLowerCase() === property.state.toLowerCase()
          ) {
            score += 3;
          }

          // Same property type
          if (
            property?.type &&
            item.type &&
            item.type.toLowerCase() === property.type.toLowerCase()
          ) {
            score += 3;
          }

          // Same category
          if (
            property?.category &&
            item.category &&
            item.category.toLowerCase() === property.category.toLowerCase()
          ) {
            score += 2;
          }

          // Similar price
          if (property?.price && item.price) {
            const currentPrice = Number(property.price);
            const itemPrice = Number(item.price);

            if (currentPrice > 0 && itemPrice > 0) {
              const difference = Math.abs(currentPrice - itemPrice);
              const percentage = difference / currentPrice;

              if (percentage <= 0.2) {
                score += 2;
              }
            }
          }

          return {
            ...item,
            score,
          };
        });

        // ======================================
        // SORT BY RELEVANCE
        // ======================================

        scoredProperties.sort((a, b) => b.score - a.score);

        // ======================================
        // TAKE ONLY 3
        // ======================================

        setRelatedProperties(scoredProperties.slice(0, 3));
      } catch (error) {
        console.error("Error loading related properties:", error);

        setRelatedProperties([]);
      } finally {
        setLoading(false);
      }
    }

    if (property?.id) {
      loadRelatedProperties();
    } else {
      setLoading(false);
    }
  }, [property]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="bg-white py-20 transition-colors duration-300 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Related Properties
            </h2>

            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Finding properties you may be interested in...
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-60 bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-4 p-6">
                  <div className="h-6 rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-7 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="h-12 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // NO RELATED PROPERTIES
  // ==========================================

  if (relatedProperties.length === 0) {
    return null;
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <section className="bg-white py-20 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.45,
          }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Related Properties
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            You may also be interested in these properties.
          </p>
        </motion.div>

        {/* Properties */}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {relatedProperties.map((item, index) => {
            const image =
              item.images?.[0] || "https://placehold.co/600x400?text=No+Image";

            const location = [item.city, item.state].filter(Boolean).join(", ");

            return (
              <motion.div
                key={item.id}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -6,
                }}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-200 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
              >
                {/* Image */}

                <div className="overflow-hidden">
                  <img
                    src={image}
                    alt={item.title || "Rental property"}
                    className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}

                <div className="p-6">
                  <h3 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                    {item.title || "Rental Property"}
                  </h3>

                  {/* Public Location */}

                  <div className="mt-3 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <FaMapMarkerAlt className="shrink-0 text-red-500" />

                    <span>{location || "Location not provided"}</span>
                  </div>

                  {/* Price */}

                  <p className="mt-5 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₦{Number(item.price || 0).toLocaleString()}
                  </p>

                  {/* Property Details */}

                  <div className="mt-4 flex gap-5 text-sm text-slate-500 dark:text-slate-400">
                    <span>{item.bedrooms || 0} beds</span>

                    <span>{item.bathrooms || 0} baths</span>

                    {item.type && <span>{item.type}</span>}
                  </div>

                  {/* View Button */}

                  <Link
                    to={`${basePath}/${item.id}`}
                    className="mt-6 block rounded-xl bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700 dark:hover:bg-blue-500"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RelatedProperties;
