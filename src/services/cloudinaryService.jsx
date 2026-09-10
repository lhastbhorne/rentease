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

    throw new Error(data?.error?.message || "Image upload failed.");
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
// UPLOAD VERIFICATION DOCUMENT
//
// Supports:
// - PDF
// - JPG
// - JPEG
// - PNG
// - WEBP
//
// Used for:
// - Landlord identification
// - Agent CAC certificate
// - Other verification documents
// ==========================================

export async function uploadVerificationDocument(file) {
  if (!file) {
    throw new Error("No verification document selected.");
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Document must be a PDF, JPG, JPEG, PNG or WEBP file.");
  }

  // 10 MB maximum
  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Document must not be larger than 10MB.");
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
    console.error("Cloudinary verification document error:", data);

    throw new Error(
      data?.error?.message || "Verification document upload failed.",
    );
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    originalFilename: data.original_filename || file.name,
  };
}

// ==========================================
// UPLOAD OWNERSHIP DOCUMENT
//
// Kept for compatibility with your existing
// property upload functionality.
// ==========================================

export async function uploadOwnershipDocument(file) {
  return uploadVerificationDocument(file);
}
