const CLOUD_NAME = "rjr9fq1g";
const UPLOAD_PRESET = "rentease_upload";

export async function uploadImage(file) {
  if (!file) {
    throw new Error("No image file was provided.");
  }

  if (!(file instanceof File)) {
    throw new Error("Invalid image file.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not a valid image.`);
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  console.log("Uploading image:", {
    name: file.name,
    type: file.type,
    size: file.size,
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary upload failed:", data);

      throw new Error(
        data?.error?.message ||
          `Cloudinary upload failed with status ${response.status}`,
      );
    }

    console.log("Cloudinary upload successful:", data);

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary error:", error);
    throw error;
  }
}

export async function uploadMultipleImages(files) {
  if (!files || files.length === 0) {
    return [];
  }

  const imageUrls = [];

  for (const file of files) {
    const url = await uploadImage(file);
    imageUrls.push(url);
  }

  return imageUrls;
}
