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
         console.error("Cloudinary upload error:", error);
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );

    uploadStream.end(file.buffer);
  });
};


export const uploadMultipleToCloudinary = async (
  files: Record<string, Express.Multer.File | undefined>,
  vendorId: string,
  folder: string
): Promise<Record<string, any>> => {
  const uploadedDocs: Record<string, any> = {};

  for (const [fieldName, file] of Object.entries(files)) {
    if (!file) {
      continue;
    }

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${folder}/${vendorId}/${fieldName}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error(`Cloudinary error for ${fieldName}:`, error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(file.buffer);
    });

    uploadedDocs[fieldName] = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  return uploadedDocs;
};


export const deleteFromCloudinary = async (publicId: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Cloudinary delete error:", error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
