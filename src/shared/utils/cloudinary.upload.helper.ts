import { UploadApiResponse } from "cloudinary";
import cloudinary from "../../config/cloudinary.config";

// Single file upload (buffer)
export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // handles pdf, images etc.
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );

    uploadStream.end(file.buffer);
  });
};

// Multiple files upload
export const uploadMultipleToCloudinary = async (
  files: Record<string, Express.Multer.File>,
  vendorId: string,
  path: string
) => {
  const uploads: Record<string, any> = {};

  for (const [fieldName, file] of Object.entries(files)) {
    if (!file) continue;

    const folder = `${path}/${vendorId}/${fieldName}`; // organized by vendor + field
    const result = await uploadToCloudinary(file, folder);

    uploads[fieldName] = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  }

  return uploads;
};