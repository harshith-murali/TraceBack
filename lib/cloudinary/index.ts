import { v2 as cloudinary } from "cloudinary";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const maxFileSize = 5 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

function assertConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured.");
  }
}

export async function uploadImage(file: File, folder = "campus-lost-found") {
  assertConfigured();

  if (!allowedTypes.has(file.type)) {
    throw new Error("Only JPEG, PNG, WEBP, and HEIC images are supported.");
  }

  if (file.size > maxFileSize) {
    throw new Error("Images must be 5MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    return await new Promise<{ secureUrl: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }]
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }
          resolve({ secureUrl: result.secure_url, publicId: result.public_id });
        }
      );

      stream.end(buffer);
    });
  } catch (error) {
    if (typeof error === "object" && error && "http_code" in error && (error as { http_code?: unknown }).http_code === 403) {
      throw new Error("Cloudinary rejected the upload. Check that signed uploads are enabled and the Cloudinary API key/secret match this cloud.");
    }
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  assertConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export function cloudinaryImage(url: string, width = 900, height = 650) {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`);
}
