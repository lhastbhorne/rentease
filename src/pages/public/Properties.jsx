import { useEffect, useState } from "react";

import SearchFilter from "../../components/common/SearchFilter";
import PropertyGrid from "../../components/property/public/PropertyGrid";
import Pagination from "../../components/common/Pagination";

import { getAllProperties } from "../../firebase/propertyService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  function handlePageChange(page) {
    if (page < 1 || page > 5) return;

    setCurrentPage(page);
  }

  return (
    <>
      <SearchFilter />

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-lg text-slate-500">
            Loading properties...
          </p>
        </div>
      ) : (
        <PropertyGrid properties={properties} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default Properties;