import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  getPropertyById,
  updateProperty,
} from "../../firebase/propertyService";

import { uploadMultipleImages } from "../../services/cloudinaryService";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Existing images from Cloudinary
  const [existingImages, setExistingImages] = useState([]);

  // New images selected from computer
  const [newImages, setNewImages] = useState([]);

  // Load property
  useEffect(() => {
    async function loadProperty() {
      try {
        const property = await getPropertyById(id);

        if (!property) {
          alert("Property not found.");
          navigate("/landlord/my-properties");
          return;
        }

        setFormData({
          title: property.title || "",
          description: property.description || "",
          category: property.category || "",
          type: property.type || "",
          bedrooms: property.bedrooms ?? "",
          bathrooms: property.bathrooms ?? "",
          parking: property.parking ?? "",
          furnished: property.furnished || "",
          area: property.area || "",
          price: property.price || "",
          address: property.address || "",
          city: property.city || "",
          state: property.state || "",
          amenities: property.amenities || [],
        });

        setExistingImages(property.images || []);
      } catch (error) {
        console.error("Error loading property:", error);
        alert("Failed to load property.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProperty();
    }
  }, [id, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNumberChange(e, field) {
    const value = Math.max(0, Number(e.target.value));

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);

    const images = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...images]);
  }

  function removeExistingImage(index) {
    setExistingImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  function removeNewImage(index) {
    setNewImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      // Upload newly selected images
      let uploadedImages = [];

      if (newImages.length > 0) {
        const files = newImages.map((image) => image.file);

        uploadedImages = await uploadMultipleImages(files);
      }

      // Keep existing images + newly uploaded images
      const allImages = [
        ...existingImages,
        ...uploadedImages,
      ];

      const updatedData = {
        ...formData,

        price: Number(formData.price) || 0,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        parking: Number(formData.parking) || 0,
        area: Number(formData.area) || 0,

        images: allImages,
      };

      await updateProperty(id, updatedData);

      alert("Property updated successfully!");

      navigate("/landlord/my-properties");
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-xl bg-white p-8 text-center">
          Loading property...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Edit Property
          </h1>

          <p className="mt-2 text-slate-500">
            Update your property information and images.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow"
        >
          {/* Property Information */}
          <h2 className="mb-6 text-2xl font-bold">
            Property Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Title */}
            <div>
              <label className="mb-2 block font-medium">
                Property Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block font-medium">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              >
                <option value="">Select Category</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Land</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="mb-2 block font-medium">
                Property Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              >
                <option value="">Select Type</option>
                <option>Apartment</option>
                <option>Duplex</option>
                <option>Bungalow</option>
                <option>Self Contain</option>
                <option>Office</option>
                <option>Shop</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block font-medium">
                Price (₦)
              </label>

              <input
                type="text"
                value={
                  formData.price
                    ? Number(formData.price).toLocaleString()
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");

                  if (/^\d*$/.test(value)) {
                    setFormData((prev) => ({
                      ...prev,
                      price: value,
                    }));
                  }
                }}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="mb-2 block font-medium">
                Bedrooms
              </label>

              <input
                type="number"
                min="0"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={(e) =>
                  handleNumberChange(e, "bedrooms")
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className="mb-2 block font-medium">
                Bathrooms
              </label>

              <input
                type="number"
                min="0"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={(e) =>
                  handleNumberChange(e, "bathrooms")
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Parking */}
            <div>
              <label className="mb-2 block font-medium">
                Parking Spaces
              </label>

              <input
                type="number"
                min="0"
                name="parking"
                value={formData.parking}
                onChange={(e) =>
                  handleNumberChange(e, "parking")
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Furnished */}
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
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="mb-2 block font-medium">
                Area (sqft)
              </label>

              <input
                type="number"
                min="0"
                name="area"
                value={formData.area}
                onChange={(e) =>
                  handleNumberChange(e, "area")
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* State */}
            <div>
              <label className="mb-2 block font-medium">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block font-medium">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block font-medium">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block font-medium">
                Description
              </label>

              <textarea
                rows="6"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          {/* Images */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold">
              Property Images
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Remove existing images or add new ones.
            </p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-3 font-semibold">
                  Current Images
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {existingImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg border"
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingImage(index)
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="mt-6">
              <label className="mb-2 block font-medium">
                Add New Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* New Image Preview */}
            {newImages.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-3 font-semibold">
                  New Images
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {newImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg border"
                    >
                      <img
                        src={image.preview}
                        alt={`New property ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(index)
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={() =>
                navigate("/landlord/my-properties")
              }
              className="rounded-lg border px-6 py-3 font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default EditProperty;