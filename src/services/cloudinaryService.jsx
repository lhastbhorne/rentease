const CLOUD_NAME = "rjr9fq1g";
const UPLOAD_PRESET = "rentease_upload";

// ==========================================
// UPLOAD IMAGE
// ==========================================

export async function uploadImage(file) {
  if (!file) {
    throw new Error("No image selected.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not a valid image.`);
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary image error:", data);

    throw new Error(
      data?.error?.message || "Image upload failed.",
    );
  }

  return data.secure_url;
}

// ==========================================
// UPLOAD MULTIPLE IMAGES
// ==========================================

export async function uploadMultipleImages(files = []) {
  const imageUrls = [];

  for (const file of files) {
    const url = await uploadImage(file);

    imageUrls.push(url);
  }

  return imageUrls;
}

// ==========================================
// UPLOAD OWNERSHIP DOCUMENT
// Supports PDF, JPG, PNG, etc.
// ==========================================

export async function uploadOwnershipDocument(file) {
  if (!file) {
    throw new Error("No ownership document selected.");
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Ownership document must be a PDF, JPG, PNG or WEBP file.",
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary document error:", data);

    throw new Error(
      data?.error?.message ||
        "Ownership document upload failed.",
    );
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
  };
}