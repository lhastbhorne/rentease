import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  uploadMultipleImages,
  uploadOwnershipDocument,
} from "../../../services/cloudinaryService";

import { createProperty } from "../../../firebase/propertyService";

import { useAuth } from "../../../contexts/AuthContext";

function PropertyForm() {
  const { user } = useAuth();

  const isAgent = user?.role === "agent";
  const isLandlord = user?.role === "landlord";

  // ==========================================
  // PROPERTY AMENITIES
  // ==========================================

  const PROPERTY_AMENITIES = [
    "Running Water",
    "Borehole",
    "Public Water",
    "Prepaid Meter",
    "24/7 Electricity",
    "Generator",
    "Solar Power",
    "Air Conditioning",
    "POP Ceiling",
    "Wardrobe",
    "Kitchen Cabinets",
    "Tiled Floor",
    "Balcony",
    "Dining Area",
    "Store Room",
    "Parking Space",
    "Security",
    "CCTV",
    "Fenced Compound",
    "Gate",
    "Swimming Pool",
    "Gym",
    "Laundry Area",
    "Servant Quarter",
    "Water Heater",
  ];

  // ==========================================
  // NEARBY FACILITIES
  // ==========================================

  const NEARBY_FACILITIES = [
    "Supermarket",
    "Shopping Mall",
    "Pharmacy",
    "Hospital",
    "School",
    "University",
    "Bus Stop",
    "Fuel Station",
    "Restaurant",
    "Church",
    "Mosque",
    "Police Station",
    "Bank / ATM",
    "Market",
    "Gym",
    "Park",
  ];

  // ==========================================
  // FORM DATA
  // ==========================================

  const initialFormData = {
    title: "",
    description: "",
    category: "",
    type: "",

    bedrooms: "",
    toilets: "",
    bathrooms: "",

    parking: "",
    furnished: "",
    area: "",
    price: "",
    rentFrequency: "",

    areaName: "",
    address: "",
    city: "",
    state: "",

    amenities: [],
    nearbyFacilities: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  // ==========================================
  // IMAGES
  // ==========================================

  const [images, setImages] = useState([]);

  // ==========================================
  // OWNERSHIP PROOF
  // ==========================================

  const [ownershipProof, setOwnershipProof] = useState(null);
  const [ownershipProofPreview, setOwnershipProofPreview] = useState("");

  // ==========================================
  // SUBMITTING
  // ==========================================

  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // CLEAN IMAGE PREVIEWS
  // ==========================================

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });

      if (ownershipProofPreview) {
        URL.revokeObjectURL(ownershipProofPreview);
      }
    };
  }, []);

  // ==========================================
  // HANDLE NORMAL INPUT
  // ==========================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================
  // HANDLE NUMBER INPUT
  // ==========================================

  function handleNumberChange(name, value) {
    const numericValue = Math.max(0, Number(value || 0));

    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  }

  // ==========================================
  // HANDLE PRICE / AREA
  // ==========================================

  function handleFormattedNumberChange(name, value) {
    const cleanValue = value.replace(/,/g, "");

    if (/^\d*$/.test(cleanValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));
    }
  }

  // ==========================================
  // HANDLE AMENITIES
  // ==========================================

  function toggleAmenity(amenity) {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  // ==========================================
  // HANDLE NEARBY FACILITIES
  // ==========================================

  function toggleNearbyFacility(facility) {
    setFormData((prev) => ({
      ...prev,
      nearbyFacilities: prev.nearbyFacilities.includes(facility)
        ? prev.nearbyFacilities.filter((item) => item !== facility)
        : [...prev.nearbyFacilities, facility],
    }));
  }

  // ==========================================
  // HANDLE IMAGE SELECTION
  // ==========================================

  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    e.target.value = "";
  }

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  function removeImage(index) {
    setImages((prev) => {
      const imageToRemove = prev[index];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  // ==========================================
  // OWNERSHIP PROOF
  // ==========================================

  function handleOwnershipProofChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (ownershipProofPreview) {
      URL.revokeObjectURL(ownershipProofPreview);
    }

    setOwnershipProof(file);
    setOwnershipProofPreview(URL.createObjectURL(file));

    e.target.value = "";
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to add a property.");
      return;
    }

    if (!isAgent && !isLandlord) {
      alert("Only landlords and agents can add properties.");
      return;
    }

    if (isLandlord && !ownershipProof) {
      alert("Please upload proof of ownership.");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one property image.");
      return;
    }

    if (!formData.areaName.trim()) {
      alert("Please enter the area or neighborhood.");
      return;
    }

    try {
      setSubmitting(true);

      // ======================================
      // UPLOAD PROPERTY IMAGES
      // ======================================

      const imageFiles = images.map((image) => image.file);

      const imageUrls = await uploadMultipleImages(imageFiles);

      // ======================================
      // LANDLORD OWNERSHIP PROOF
      // ======================================

      let ownershipProofUrl = "";

      if (isLandlord && ownershipProof) {
        const document = await uploadOwnershipDocument(ownershipProof);

        ownershipProofUrl = document.url;
      }

      // ======================================
      // PROPERTY DATA
      // ======================================

      const propertyData = {
        ...formData,

        // Numeric values
        price: Number(String(formData.price || "").replace(/,/g, "")),

        rentFrequency: formData.rentFrequency,

        bedrooms: Number(formData.bedrooms || 0),

        toilets: Number(formData.toilets || 0),

        bathrooms: Number(formData.bathrooms || 0),

        parking: Number(formData.parking || 0),

        area: Number(String(formData.area || "").replace(/,/g, "")),

        // Images
        images: imageUrls,

        // ==================================
        // MANAGEMENT
        // ==================================

        // Landlord:
        // ownerId = landlord UID
        // agentId = null
        // managementType = owner

        // Agent:
        // ownerId = agent UID
        // agentId = agent UID
        // managementType = agent

        managementType: isAgent ? "agent" : "owner",

        agentId: isAgent ? user.uid : null,

        // ==================================
        // MANAGER
        // ==================================

        managerId: user.uid,

        managerName: user.fullName || user.displayName || "",

        managerRole: user.role,

        // ==================================
        // OWNERSHIP
        // ==================================

        ownershipProof: ownershipProofUrl,

        // ==================================
        // SUBMISSION
        // ==================================

        submittedBy: user.uid,

        submittedByRole: user.role,

        approvalStatus: "pending",
      };

      // ======================================
      // CREATE PROPERTY
      // ======================================

      const propertyId = await createProperty(
        propertyData,
        user.uid,
        user.role,
        isAgent ? user.uid : null,
      );

      console.log("Property created:", propertyId);

      alert("Property submitted successfully for verification.");

      // ======================================
      // RESET FORM
      // ======================================

      setFormData(initialFormData);

      setOwnershipProof(null);
      setOwnershipProofPreview("");

      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });

      setImages([]);
    } catch (error) {
      console.error("Error creating property:", error);

      alert(error.message || "Failed to create property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // STYLES
  // ==========================================

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400";

  const labelClass =
    "mb-2 block font-medium text-slate-700 dark:text-slate-200";

  const checkboxClass =
    "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500 dark:hover:bg-slate-700";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* ========================================
          PROPERTY INFORMATION
      ======================================== */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
      >
        <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
          Property Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* TITLE */}

          <div>
            <label className={labelClass}>Property Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Luxury 3 Bedroom Apartment"
              className={inputClass}
              required
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label className={labelClass}>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Category</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Land">Land</option>
            </select>
          </div>

          {/* PROPERTY TYPE */}

          <div>
            <label className={labelClass}>Property Type</label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Type</option>
              <option value="Apartment">Apartment</option>
              <option value="Duplex">Duplex</option>
              <option value="Bungalow">Bungalow</option>
              <option value="Self Contain">Self Contain</option>
              <option value="Office">Office</option>
              <option value="Shop">Shop</option>
            </select>
          </div>

          {/* RENTAL PRICE */}

          <div>
            <label className={labelClass}>Rental Price (₦)</label>

            <input
              type="text"
              name="price"
              value={
                formData.price ? Number(formData.price).toLocaleString() : ""
              }
              onChange={(e) =>
                handleFormattedNumberChange("price", e.target.value)
              }
              placeholder="2,500,000"
              className={inputClass}
              required
            />

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter the amount the tenant will pay according to the selected
              rent frequency.
            </p>
          </div>

          {/* RENT FREQUENCY */}

          <div>
            <label className={labelClass}>Rent Frequency</label>

            <select
              name="rentFrequency"
              value={formData.rentFrequency}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select rent frequency</option>

              <option value="monthly">Per Month</option>

              <option value="annual">Per Annum</option>
            </select>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Choose whether the advertised rent is monthly or annual.
            </p>
          </div>

          {/* BEDROOMS */}

          <div>
            <label className={labelClass}>Bedrooms</label>

            <input
              type="number"
              name="bedrooms"
              min="0"
              value={formData.bedrooms}
              onChange={(e) => handleNumberChange("bedrooms", e.target.value)}
              placeholder="3"
              className={inputClass}
              required
            />
          </div>

          {/* TOILETS */}

          <div>
            <label className={labelClass}>Toilets</label>

            <input
              type="number"
              name="toilets"
              min="0"
              value={formData.toilets}
              onChange={(e) => handleNumberChange("toilets", e.target.value)}
              placeholder="1"
              className={inputClass}
              required
            />

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Total number of toilets in the property.
            </p>
          </div>

          {/* BATHROOMS */}

          <div>
            <label className={labelClass}>Bathrooms</label>

            <input
              type="number"
              name="bathrooms"
              min="0"
              value={formData.bathrooms}
              onChange={(e) => handleNumberChange("bathrooms", e.target.value)}
              placeholder="3"
              className={inputClass}
              required
            />

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Total number of bathrooms in the property.
            </p>
          </div>

          {/* PARKING */}

          <div>
            <label className={labelClass}>Parking Spaces</label>

            <input
              type="number"
              name="parking"
              min="0"
              value={formData.parking}
              onChange={(e) => handleNumberChange("parking", e.target.value)}
              placeholder="2"
              className={inputClass}
            />
          </div>

          {/* FURNISHED */}

          <div>
            <label className={labelClass}>Furnished</label>

            <select
              name="furnished"
              value={formData.furnished}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* AREA SIZE */}

          <div>
            <label className={labelClass}>Property Size (sqft)</label>

            <input
              type="text"
              name="area"
              value={
                formData.area ? Number(formData.area).toLocaleString() : ""
              }
              onChange={(e) =>
                handleFormattedNumberChange("area", e.target.value)
              }
              placeholder="2,500"
              className={inputClass}
            />
          </div>

          {/* AREA / NEIGHBORHOOD */}

          <div>
            <label className={labelClass}>Area / Neighborhood</label>

            <input
              type="text"
              name="areaName"
              value={formData.areaName}
              onChange={handleChange}
              placeholder="Ikeja, GRA"
              className={inputClass}
              required
            />

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This is the general area tenants will see.
            </p>
          </div>

          {/* STATE */}

          <div>
            <label className={labelClass}>State</label>

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Lagos"
              className={inputClass}
              required
            />
          </div>

          {/* CITY */}

          <div>
            <label className={labelClass}>City</label>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Lagos"
              className={inputClass}
              required
            />
          </div>

          {/* EXACT ADDRESS */}

          <div className="md:col-span-2">
            <label className={labelClass}>Exact Address</label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="16, Sunmonu Street"
              className={inputClass}
              required
            />

            <div className="mt-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔒 Your exact address is kept private for platform verification,
                tenancy and inspection purposes. It will not be displayed
                publicly to tenants.
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>

            <textarea
              rows="6"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the property, its condition, environment and other important details..."
              className={inputClass}
              required
            />
          </div>
        </div>
      </motion.div>

      {/* ========================================
          PROPERTY AMENITIES
      ======================================== */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Property Amenities
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Select the features and facilities available inside or directly on
            the property.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_AMENITIES.map((amenity) => (
            <label key={amenity} className={checkboxClass}>
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {amenity}
              </span>
            </label>
          ))}
        </div>

        {formData.amenities.length > 0 && (
          <p className="mt-5 text-sm font-medium text-blue-600 dark:text-blue-400">
            {formData.amenities.length} amenit
            {formData.amenities.length === 1 ? "y" : "ies"} selected
          </p>
        )}
      </motion.div>

      {/* ========================================
          NEARBY FACILITIES
      ======================================== */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nearby Facilities
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Select facilities that are reasonably close to the property.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NEARBY_FACILITIES.map((facility) => (
            <label key={facility} className={checkboxClass}>
              <input
                type="checkbox"
                checked={formData.nearbyFacilities.includes(facility)}
                onChange={() => toggleNearbyFacility(facility)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {facility}
              </span>
            </label>
          ))}
        </div>

        {formData.nearbyFacilities.length > 0 && (
          <p className="mt-5 text-sm font-medium text-blue-600 dark:text-blue-400">
            {formData.nearbyFacilities.length} nearby facilit
            {formData.nearbyFacilities.length === 1 ? "y" : "ies"} selected
          </p>
        )}
      </motion.div>

      {/* ========================================
          PROPERTY IMAGES
      ======================================== */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Property Images
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Upload clear images of the property. The first image will be used as
          the main property image.
        </p>

        <label
          htmlFor="property-images"
          className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400 dark:hover:bg-slate-700"
        >
          <div className="text-5xl text-blue-600">📷</div>

          <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Click to upload property images
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            PNG, JPG or JPEG
          </p>

          <input
            id="property-images"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {images.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Selected Images ({images.length})
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={image.preview}
                    alt={`Property ${index + 1}`}
                    className="h-40 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    ×
                  </button>

                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600 px-2 py-1 text-center text-sm font-medium text-white">
                      Main Image
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ========================================
          LANDLORD OWNERSHIP PROOF
      ======================================== */}

      {isLandlord && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Proof of Ownership
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Upload a document proving that you own this property. This will be
            reviewed by the administrator.
          </p>

          <label
            htmlFor="ownership-proof"
            className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400 dark:hover:bg-slate-700"
          >
            <div className="text-5xl">📄</div>

            <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
              Upload ownership document *
            </p>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              JPG, PNG or PDF
            </p>

            <input
              id="ownership-proof"
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleOwnershipProofChange}
              className="hidden"
            />
          </label>

          {ownershipProof && (
            <div className="mt-5 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400">
              <p className="font-semibold">Document selected</p>

              <p className="mt-1 text-sm">{ownershipProof.name}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================
          SUBMIT
      ======================================== */}

      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={!submitting ? { y: -2 } : {}}
          whileTap={!submitting ? { scale: 0.98 } : {}}
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-500"
        >
          {submitting ? "Submitting..." : "Submit Property"}
        </motion.button>
      </div>
    </motion.form>
  );
}

export default PropertyForm;
