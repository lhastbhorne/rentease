import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaImage,
  FaLock,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  getPropertyById,
  updateProperty,
} from "../../firebase/propertyService";

import { uploadMultipleImages } from "../../services/cloudinaryService";

// =====================================================
// OPTIONS
// =====================================================

const AMENITIES = [
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
  areaName: "",
  address: "",
  city: "",
  state: "",
  amenities: [],
  nearbyFacilities: [],
};

// =====================================================
// PROPERTY LOCK INFORMATION
// =====================================================

const getPropertyLockInfo = (status) => {
  switch (status) {
    case "occupied":
      return {
        title: "Property Locked",
        heading: "This property is currently rented",
        description:
          "You cannot edit or delete a property while it has an active tenant. The property must first go through the tenancy termination and move-out process.",
        badge: "Occupied",
      };

    case "reserved":
      return {
        title: "Property Locked",
        heading: "This property is currently reserved",
        description:
          "Editing is temporarily disabled while a tenant application is being processed and the property is reserved.",
        badge: "Reserved",
      };

    case "maintenance":
      return {
        title: "Property Locked",
        heading: "This property is under maintenance",
        description:
          "Editing is temporarily disabled while the property is under maintenance.",
        badge: "Maintenance",
      };

    default:
      return null;
  }
};

// =====================================================
// COMPONENT
// =====================================================

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // Existing Cloudinary images
  const [existingImages, setExistingImages] = useState([]);

  // New images selected from computer
  const [newImages, setNewImages] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD PROPERTY
  // =====================================================

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const loadedProperty = await getPropertyById(id);

        if (!loadedProperty) {
          setError("Property not found.");

          setTimeout(() => {
            navigate("/landlord/my-properties");
          }, 1200);

          return;
        }

        setProperty(loadedProperty);

        setFormData({
          title: loadedProperty.title || "",
          description: loadedProperty.description || "",
          category: loadedProperty.category || "",
          type: loadedProperty.type || "",
          bedrooms: loadedProperty.bedrooms ?? "",
          toilets: loadedProperty.toilets ?? loadedProperty.guestToilet ?? "",
          bathrooms: loadedProperty.bathrooms ?? "",
          parking: loadedProperty.parking ?? "",
          furnished: loadedProperty.furnished || "",
          area: loadedProperty.area ?? "",
          price: loadedProperty.price ?? "",
          areaName: loadedProperty.areaName || "",
          address: loadedProperty.address || "",
          city: loadedProperty.city || "",
          state: loadedProperty.state || "",
          amenities: loadedProperty.amenities || [],
          nearbyFacilities: loadedProperty.nearbyFacilities || [],
        });

        setExistingImages(loadedProperty.images || []);
      } catch (error) {
        console.error("Error loading property:", error);
        setError("Failed to load property.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProperty();
    }
  }, [id, navigate]);

  // =====================================================
  // TEXT INPUT
  // =====================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // =====================================================
  // NUMBER INPUT
  // =====================================================

  function handleNumberChange(e, field) {
    const value = e.target.value;

    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        [field]: "",
      }));

      return;
    }

    const numberValue = Math.max(0, Number(value));

    setFormData((prev) => ({
      ...prev,
      [field]: numberValue,
    }));

    setError("");
    setSuccess("");
  }

  // =====================================================
  // PRICE INPUT
  // =====================================================

  function handlePriceChange(e) {
    const value = e.target.value.replace(/,/g, "");

    if (!/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      price: value,
    }));

    setError("");
    setSuccess("");
  }

  // =====================================================
  // CHECKBOX HANDLER
  // =====================================================

  function handleCheckboxChange(field, value) {
    setFormData((prev) => {
      const currentValues = prev[field] || [];

      const exists = currentValues.includes(value);

      return {
        ...prev,
        [field]: exists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });

    setError("");
    setSuccess("");
  }

  // =====================================================
  // IMAGE SELECTION
  // =====================================================

  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    const images = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...images]);

    setError("");
    setSuccess("");

    e.target.value = "";
  }

  // =====================================================
  // REMOVE EXISTING IMAGE
  // =====================================================

  function removeExistingImage(index) {
    setExistingImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index),
    );

    setError("");
    setSuccess("");
  }

  // =====================================================
  // REMOVE NEW IMAGE
  // =====================================================

  function removeNewImage(index) {
    setNewImages((prev) => {
      const image = prev[index];

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((_, imageIndex) => imageIndex !== index);
    });

    setError("");
    setSuccess("");
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------
    // EXTRA SAFETY CHECK
    // ---------------------------------------------------

    if (property?.status !== "available") {
      setError("This property cannot be edited while it is not available.");
      return;
    }

    // ---------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------

    if (!formData.title.trim()) {
      setError("Please enter a property title.");
      return;
    }

    if (!formData.category) {
      setError("Please select a property category.");
      return;
    }

    if (!formData.type) {
      setError("Please select a property type.");
      return;
    }

    if (!formData.price) {
      setError("Please enter the property price.");
      return;
    }

    if (!formData.city.trim()) {
      setError("Please enter the city.");
      return;
    }

    if (!formData.state.trim()) {
      setError("Please enter the state.");
      return;
    }

    if (existingImages.length === 0) {
      setError("Please keep at least one property image.");
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // UPLOAD NEW IMAGES
      // =================================================

      let uploadedImages = [];

      if (newImages.length > 0) {
        const files = newImages.map((image) => image.file);

        uploadedImages = await uploadMultipleImages(files);
      }

      // =================================================
      // COMBINE IMAGES
      // =================================================

      const allImages = [...existingImages, ...uploadedImages];

      if (allImages.length === 0) {
        throw new Error("At least one property image is required.");
      }

      // =================================================
      // UPDATED PROPERTY DATA
      // =================================================

      const updatedData = {
        ...formData,

        title: formData.title.trim(),

        description: formData.description.trim(),

        price: Number(formData.price) || 0,

        bedrooms: Number(formData.bedrooms) || 0,

        toilets: Number(formData.toilets) || 0,

        bathrooms: Number(formData.bathrooms) || 0,

        parking: Number(formData.parking) || 0,

        area: Number(formData.area) || 0,

        areaName: formData.areaName.trim(),

        address: formData.address.trim(),

        city: formData.city.trim(),

        state: formData.state.trim(),

        amenities: formData.amenities || [],

        nearbyFacilities: formData.nearbyFacilities || [],

        images: allImages,

        updatedAt: new Date(),
      };

      // =================================================
      // UPDATE FIRESTORE
      // =================================================

      await updateProperty(id, updatedData);

      setSuccess("Property updated successfully!");

      // Clean up previews
      newImages.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });

      setNewImages([]);

      setTimeout(() => {
        navigate("/landlord/my-properties");
      }, 1000);
    } catch (error) {
      console.error("Error updating property:", error);

      setError(error.message || "Failed to update property.");
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center bg-slate-50 dark:bg-slate-950">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="text-center"
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading property...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // LOCKED PROPERTY
  // =====================================================

  const lockInfo = getPropertyLockInfo(property?.status);

  if (lockInfo) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          {/* Back */}
          <motion.button
            type="button"
            onClick={() => navigate("/landlord/my-properties")}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <FaArrowLeft />
            Back to My Properties
          </motion.button>

          {/* Locked Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Property Image */}
            {property?.images?.[0] && (
              <div className="relative h-64 overflow-hidden sm:h-80">
                <img
                  src={property.images[0]}
                  alt={property.title || "Property"}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/45" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                    <FaLock className="text-2xl" />
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 text-center sm:p-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <FaLock className="text-2xl" />
              </div>

              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {lockInfo.badge}
              </span>

              <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                {lockInfo.heading}
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {lockInfo.description}
              </p>

              <div className="mx-auto mt-7 max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex gap-3">
                  <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />

                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      Why is editing locked?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                      RentEase protects active rental records from accidental
                      changes. Property information must remain consistent with
                      the tenant's agreement and payment records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/landlord/my-properties")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FaArrowLeft />
                  Back to Properties
                </button>

                {property?.status === "occupied" && (
                  <button
                    type="button"
                    onClick={() => navigate(`/landlord/tenancies`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <FaBuilding />
                    View Tenancies
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // EDITABLE PROPERTY UI
  // =====================================================

  return (
    <DashboardLayout>
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="mx-auto max-w-6xl"
      >
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <motion.button
            type="button"
            onClick={() => navigate("/landlord/my-properties")}
            whileHover={{
              x: -3,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <FaArrowLeft />
            Back to My Properties
          </motion.button>

          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:flex">
              <FaBuilding />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Edit Property
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                Update your property information, location, amenities, and
                images.
              </p>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400"
            >
              <FaCheckCircle className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <FaExclamationTriangle className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PROPERTY INFORMATION */}
          <FormSection
            title="Property Information"
            description="Update the basic details of your property."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Property Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Modern 3 Bedroom Duplex"
                required
              />

              <SelectField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={["Residential", "Commercial", "Industrial", "Land"]}
                required
              />

              <SelectField
                label="Property Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={[
                  "Apartment",
                  "Duplex",
                  "Bungalow",
                  "Self Contain",
                  "Office",
                  "Shop",
                ]}
                required
              />

              <InputField
                label="Price (₦)"
                name="price"
                value={
                  formData.price ? Number(formData.price).toLocaleString() : ""
                }
                onChange={handlePriceChange}
                placeholder="e.g. 2,500,000"
                required
              />

              <NumberField
                label="Bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={(e) => handleNumberChange(e, "bedrooms")}
              />

              <NumberField
                label="Toilets"
                name="toilets"
                value={formData.toilets}
                onChange={(e) => handleNumberChange(e, "toilets")}
              />

              <NumberField
                label="Bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={(e) => handleNumberChange(e, "bathrooms")}
              />

              <NumberField
                label="Parking Spaces"
                name="parking"
                value={formData.parking}
                onChange={(e) => handleNumberChange(e, "parking")}
              />

              <SelectField
                label="Furnished"
                name="furnished"
                value={formData.furnished}
                onChange={handleChange}
                options={["Yes", "No"]}
              />

              <NumberField
                label="Property Size (sq ft)"
                name="area"
                value={formData.area}
                onChange={(e) => handleNumberChange(e, "area")}
              />

              <div className="md:col-span-2">
                <TextAreaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the property, its condition, layout, and other important details..."
                  rows={6}
                />
              </div>
            </div>
          </FormSection>

          {/* LOCATION */}
          <FormSection
            title="Property Location"
            description="Update the public location and private exact address."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Area / Neighborhood"
                name="areaName"
                value={formData.areaName}
                onChange={handleChange}
                placeholder="e.g. GRA, Oke-Ila, Bodija"
              />

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Ado-Ekiti"
                required
              />

              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Ekiti"
                required
              />

              <div className="md:col-span-2">
                <InputField
                  label="Exact Property Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter the full property address"
                />

                <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs leading-5 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400">
                  The exact address is private and should only be used for
                  verification, tenancy, and inspection purposes.
                </div>
              </div>
            </div>
          </FormSection>

          {/* AMENITIES */}
          <FormSection
            title="Property Amenities"
            description="Select the facilities and features available inside or within the property."
          >
            <CheckboxGrid
              items={AMENITIES}
              selected={formData.amenities}
              onChange={(value) => handleCheckboxChange("amenities", value)}
            />
          </FormSection>

          {/* NEARBY FACILITIES */}
          <FormSection
            title="Nearby Facilities"
            description="Select important facilities located around the property."
          >
            <CheckboxGrid
              items={NEARBY_FACILITIES}
              selected={formData.nearbyFacilities}
              onChange={(value) =>
                handleCheckboxChange("nearbyFacilities", value)
              }
            />
          </FormSection>

          {/* IMAGES */}
          <FormSection
            title="Property Images"
            description="Manage your existing images or upload additional property images."
          >
            {existingImages.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Current Images
                  </h3>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {existingImages.length} image
                    {existingImages.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  <AnimatePresence>
                    {existingImages.map((image, index) => (
                      <motion.div
                        key={`${image}-${index}`}
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
                      >
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="h-36 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-40"
                        />

                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-100 shadow transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Remove image"
                        >
                          <FaTrash className="text-xs" />
                        </button>

                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
                            Main Image
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div
              className={`${
                existingImages.length > 0
                  ? "mt-7 border-t border-slate-200 pt-7 dark:border-slate-800"
                  : ""
              }`}
            >
              <label
                htmlFor="property-images"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
                  <FaCloudUploadAlt className="text-2xl" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">
                  Add New Images
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Click to select one or more images from your computer.
                </p>

                <span className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                  JPG, PNG, WEBP
                </span>

                <input
                  id="property-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {newImages.length > 0 && (
              <div className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    New Images
                  </h3>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {newImages.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  <AnimatePresence>
                    {newImages.map((image, index) => (
                      <motion.div
                        key={`${image.preview}-${index}`}
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                      >
                        <img
                          src={image.preview}
                          alt={`New property ${index + 1}`}
                          className="h-36 w-full object-cover sm:h-40"
                        />

                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700"
                        >
                          <FaTimes className="text-xs" />
                        </button>

                        <span className="absolute bottom-2 left-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
                          New
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {existingImages.length === 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-red-500">
                <FaExclamationTriangle />
                At least one property image is required.
              </div>
            )}
          </FormSection>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
            <motion.button
              type="button"
              onClick={() => navigate("/landlord/my-properties")}
              disabled={saving}
              whileHover={!saving ? { y: -2 } : {}}
              whileTap={!saving ? { scale: 0.97 } : {}}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              <FaTimes />
              Cancel
            </motion.button>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={!saving ? { y: -2 } : {}}
              whileTap={!saving ? { scale: 0.97 } : {}}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}

// =====================================================
// FORM SECTION
// =====================================================

function FormSection({ title, description, children }) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
          {description}
        </p>
      </div>

      {children}
    </motion.section>
  );
}

// =====================================================
// INPUT FIELD
// =====================================================

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
      />
    </div>
  );
}

// =====================================================
// NUMBER FIELD
// =====================================================

function NumberField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type="number"
        min="0"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
      />
    </div>
  );
}

// =====================================================
// SELECT FIELD
// =====================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// =====================================================
// TEXTAREA
// =====================================================

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <textarea
        rows={rows}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
      />
    </div>
  );
}

// =====================================================
// CHECKBOX GRID
// =====================================================

function CheckboxGrid({ items, selected, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const checked = selected?.includes(item);

        return (
          <label
            key={item}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
              checked
                ? "border-blue-300 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(item)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
            />

            <span
              className={`text-sm ${
                checked
                  ? "font-medium text-blue-700 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {item}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default EditProperty;
