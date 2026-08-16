import { useEffect, useState } from "react";

import {
  uploadMultipleImages,
  uploadImage,
} from "../../../services/cloudinaryService";

import {
  createProperty
} from "../../../firebase/propertyService";

import { useAuth } from "../../../contexts/AuthContext";

function PropertyForm() {
  const { user } = useAuth();

  const isAgent = user?.role === "agent";
  const isLandlord = user?.role === "landlord";

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    parking: "",
    furnished: "",
    area: "",
    price: "",
    address: "",
    city: "",
    state: "",
    amenities: [],
  });

  // ==========================================
  // IMAGES
  // ==========================================

  const [images, setImages] = useState([]);

  // ==========================================
  // OWNERSHIP PROOF
  // ==========================================

  const [ownershipProof, setOwnershipProof] =
    useState(null);

  const [
    ownershipProofPreview,
    setOwnershipProofPreview,
  ] = useState("");

  // ==========================================
  // LANDLORDS FOR AGENT
  // ==========================================

  // ==========================================
  // SUBMIT
  // ==========================================

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================
  // LOAD LANDLORDS FOR AGENT
  // ==========================================

  // ==========================================
  // CLEAN IMAGE PREVIEWS
  // ==========================================

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview,
          );
        }
      });

      if (ownershipProofPreview) {
        URL.revokeObjectURL(
          ownershipProofPreview,
        );
      }
    };
  }, []);

  // ==========================================
  // HANDLE NORMAL INPUT
  // ==========================================

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================
  // HANDLE IMAGE SELECTION
  // ==========================================

  function handleImageChange(e) {
    const files = Array.from(
      e.target.files,
    );

    const newImages = files.map(
      (file) => ({
        file,
        preview:
          URL.createObjectURL(file),
      }),
    );

    setImages((prev) => [
      ...prev,
      ...newImages,
    ]);

    e.target.value = "";
  }

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  function removeImage(index) {
    setImages((prev) => {
      const imageToRemove =
        prev[index];

      if (
        imageToRemove?.preview
      ) {
        URL.revokeObjectURL(
          imageToRemove.preview,
        );
      }

      return prev.filter(
        (_, i) => i !== index,
      );
    });
  }

  // ==========================================
  // OWNERSHIP PROOF
  // ==========================================

  function handleOwnershipProofChange(
    e,
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setOwnershipProof(file);

    setOwnershipProofPreview(
      URL.createObjectURL(file),
    );

    e.target.value = "";
  }

  // ==========================================
  // SUBMIT
  // ==========================================

async function handleSubmit(e) {
  e.preventDefault();

  if (!user) {
    alert(
      "You must be logged in to add a property.",
    );
    return;
  }

  if (!isAgent && !isLandlord) {
    alert(
      "Only landlords and agents can add properties.",
    );
    return;
  }

  if (isLandlord && !ownershipProof) {
    alert(
      "Please upload proof of ownership.",
    );
    return;
  }

  if (images.length === 0) {
    alert(
      "Please upload at least one property image.",
    );
    return;
  }

  try {
    setSubmitting(true);

    // ======================================
    // UPLOAD PROPERTY IMAGES
    // ======================================

    const imageFiles = images.map(
      (image) => image.file,
    );

    const imageUrls =
      await uploadMultipleImages(
        imageFiles,
      );

    // ======================================
    // LANDLORD OWNERSHIP PROOF
    // ======================================

    let ownershipProofUrl = "";

    if (
      isLandlord &&
      ownershipProof
    ) {
      ownershipProofUrl =
        await uploadImage(
          ownershipProof,
        );
    }

    // ======================================
    // PROPERTY DATA
    // ======================================

    const propertyData = {
      ...formData,

      price: Number(
        String(
          formData.price || "",
        ).replace(/,/g, ""),
      ),

      bedrooms: Number(
        formData.bedrooms || 0,
      ),

      bathrooms: Number(
        formData.bathrooms || 0,
      ),

      parking: Number(
        formData.parking || 0,
      ),

      area: Number(
        String(
          formData.area || "",
        ).replace(/,/g, ""),
      ),

      images: imageUrls,

      // ==================================
      // MANAGEMENT
      // ==================================

      managementType: isAgent
        ? "agent"
        : "owner",

      agentId: isAgent
        ? user.uid
        : null,

      // ==================================
      // OWNERSHIP
      // ==================================

      ownershipProof:
        ownershipProofUrl,

      // ==================================
      // SUBMISSION
      // ==================================

      submittedBy: user.uid,

      submittedByRole:
        user.role,

      approvalStatus:
        "pending",
    };

    // ======================================
    // IMPORTANT
    // ======================================
    //
    // For landlord:
    // ownerId = landlord UID
    //
    // For agent:
    // ownerId = agent UID for now
    // agentId = agent UID
    //
    // The tenant does NOT see ownerId.
    //
    // ======================================

    const propertyId =
      await createProperty(
        propertyData,
        user.uid,
        user.role,
        isAgent
          ? user.uid
          : null,
      );

    console.log(
      "Property created:",
      propertyId,
    );

    alert(
      "Property submitted successfully for verification.",
    );

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
      type: "",
      bedrooms: "",
      bathrooms: "",
      parking: "",
      furnished: "",
      area: "",
      price: "",
      address: "",
      city: "",
      state: "",
      amenities: [],
    });

    setOwnershipProof(null);
    setOwnershipProofPreview("");

    images.forEach((image) => {
      if (image.preview) {
        URL.revokeObjectURL(
          image.preview,
        );
      }
    });

    setImages([]);

  } catch (error) {
    console.error(
      "Error creating property:",
      error,
    );

    alert(
      error.message ||
        "Failed to create property. Please try again.",
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      {/* ========================================
          AGENT PROPERTY OWNER
      ======================================== */}

      {/* ========================================
          PROPERTY INFORMATION
      ======================================== */}

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="mb-8 text-3xl font-bold text-slate-900">
          Property Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {/* TITLE */}

          <div>
            <label className="mb-2 block font-medium">
              Property Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Luxury Apartment"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label className="mb-2 block font-medium">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              required
            >
              <option value="">
                Select Category
              </option>

              <option value="Residential">
                Residential
              </option>

              <option value="Commercial">
                Commercial
              </option>

              <option value="Industrial">
                Industrial
              </option>

              <option value="Land">
                Land
              </option>
            </select>
          </div>

          {/* PROPERTY TYPE */}

          <div>
            <label className="mb-2 block font-medium">
              Property Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              required
            >
              <option value="">
                Select Type
              </option>

              <option value="Apartment">
                Apartment
              </option>

              <option value="Duplex">
                Duplex
              </option>

              <option value="Bungalow">
                Bungalow
              </option>

              <option value="Self Contain">
                Self Contain
              </option>

              <option value="Office">
                Office
              </option>

              <option value="Shop">
                Shop
              </option>
            </select>
          </div>

          {/* PRICE */}

          <div>
            <label className="mb-2 block font-medium">
              Price (₦)
            </label>

            <input
              type="text"
              name="price"
              value={
                formData.price
                  ? Number(
                      formData.price,
                    ).toLocaleString()
                  : ""
              }
              onChange={(e) => {
                const value =
                  e.target.value.replace(
                    /,/g,
                    "",
                  );

                if (
                  /^\d*$/.test(
                    value,
                  )
                ) {
                  setFormData(
                    (prev) => ({
                      ...prev,
                      price: value,
                    }),
                  );
                }
              }}
              placeholder="2,500,000"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          {/* BEDROOMS */}

          <div>
            <label className="mb-2 block font-medium">
              Bedrooms
            </label>

            <input
              type="number"
              name="bedrooms"
              min="0"
              value={formData.bedrooms}
              onChange={(e) =>
                setFormData(
                  (prev) => ({
                    ...prev,
                    bedrooms: Math.max(
                      0,
                      Number(
                        e.target.value,
                      ),
                    ),
                  }),
                )
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* BATHROOMS */}

          <div>
            <label className="mb-2 block font-medium">
              Bathrooms
            </label>

            <input
              type="number"
              name="bathrooms"
              min="0"
              value={formData.bathrooms}
              onChange={(e) =>
                setFormData(
                  (prev) => ({
                    ...prev,
                    bathrooms: Math.max(
                      0,
                      Number(
                        e.target.value,
                      ),
                    ),
                  }),
                )
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* PARKING */}

          <div>
            <label className="mb-2 block font-medium">
              Parking Spaces
            </label>

            <input
              type="number"
              name="parking"
              min="0"
              value={formData.parking}
              onChange={(e) =>
                setFormData(
                  (prev) => ({
                    ...prev,
                    parking: Math.max(
                      0,
                      Number(
                        e.target.value,
                      ),
                    ),
                  }),
                )
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* FURNISHED */}

          <div>
            <label className="mb-2 block font-medium">
              Furnished
            </label>

            <select
              name="furnished"
              value={formData.furnished}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="">
                Select
              </option>

              <option value="Yes">
                Yes
              </option>

              <option value="No">
                No
              </option>
            </select>
          </div>

          {/* AREA */}

          <div>
            <label className="mb-2 block font-medium">
              Area (sqft)
            </label>

            <input
              type="text"
              name="area"
              value={
                formData.area
                  ? Number(
                      formData.area,
                    ).toLocaleString()
                  : ""
              }
              onChange={(e) => {
                const value =
                  e.target.value.replace(
                    /,/g,
                    "",
                  );

                if (
                  /^\d*$/.test(
                    value,
                  )
                ) {
                  setFormData(
                    (prev) => ({
                      ...prev,
                      area: value,
                    }),
                  );
                }
              }}
              placeholder="2,500"
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* STATE */}

          <div>
            <label className="mb-2 block font-medium">
              State
            </label>

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Lagos"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          {/* ADDRESS */}

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium">
              Address
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="16, Sunmonu Street"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          {/* CITY */}

          <div>
            <label className="mb-2 block font-medium">
              City
            </label>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Lagos"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium">
              Description
            </label>

            <textarea
              rows="6"
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              placeholder="Describe the property..."
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

        </div>
      </div>

      {/* ========================================
          PROPERTY IMAGES
      ======================================== */}

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold text-slate-900">
          Property Images
        </h2>

        <p className="mt-2 text-slate-500">
          Upload clear images of the property.
        </p>

        <label
          htmlFor="property-images"
          className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="text-5xl text-blue-600">
            📷
          </div>

          <p className="mt-4 text-lg font-semibold text-slate-700">
            Click to upload property images
          </p>

          <p className="mt-2 text-sm text-slate-500">
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

            <h3 className="mb-4 text-lg font-semibold">
              Selected Images ({images.length})
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

              {images.map(
                (image, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl border"
                  >
                    <img
                      src={image.preview}
                      alt={`Property ${
                        index + 1
                      }`}
                      className="h-40 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index,
                        )
                      }
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white"
                    >
                      ×
                    </button>

                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 px-2 py-1 text-center text-sm font-medium text-white">
                        Main Image
                      </div>
                    )}
                  </div>
                ),
              )}

            </div>
          </div>
        )}
      </div>

      {/* ========================================
          LANDLORD OWNERSHIP PROOF
      ======================================== */}

      {isLandlord && (
        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Proof of Ownership
          </h2>

          <p className="mt-2 text-slate-500">
            Upload a document proving that you
            own this property. This will be
            reviewed by the administrator.
          </p>

          <label
            htmlFor="ownership-proof"
            className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="text-5xl">
              📄
            </div>

            <p className="mt-4 text-lg font-semibold text-slate-700">
              Upload ownership document *
            </p>

            <p className="mt-2 text-sm text-slate-500">
              JPG, PNG or PDF
            </p>

            <input
              id="ownership-proof"
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={
                handleOwnershipProofChange
              }
              className="hidden"
            />
          </label>

          {ownershipProof && (
            <div className="mt-5 rounded-lg bg-green-50 p-4 text-green-700">
              <p className="font-semibold">
                Document selected
              </p>

              <p className="mt-1 text-sm">
                {ownershipProof.name}
              </p>
            </div>
          )}

        </div>
      )}

      {/* ========================================
          SUBMIT
      ======================================== */}

      <div className="flex justify-end">

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : isAgent
              ? "Submit Property"
              : "Submit Property"}
        </button>

      </div>

    </form>
  );
}

export default PropertyForm;