
const CLOUDINARY_CLOUD_NAME = 'dynnpabnw';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default  ';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * @param {File} file - The file to upload.
 * @param {function(progress: number): void} [onProgress] - Optional callback for upload progress (0-100).
 * @returns {Promise<object>} A promise that resolves with the Cloudinary response object (includes secure_url, public_id, etc.).
 */
export const uploadToCloudinary = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // Add other parameters if needed, e.g., tags, folder
    // formData.append('folder', 'house_listings');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.statusText} - ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Cloudinary upload failed due to a network error.'));
    };

    xhr.send(formData);
  });
};

/**
 * Uploads an array of image objects to Cloudinary.
 * Only uploads images that have a 'file' property and no 'picUrl'.
 * @param {Array<object>} images - Array of image objects. Each object might have:
 *                                 { file: File, picDisplayPosition: number, picDescription: string, picUrl?: string }
 * @param {function(index: number, state: {progress?: number, error?: string}): void} onImageUploadStateChange - Callback to report progress or error for each image.
 * @returns {Promise<Array<object>>} A promise that resolves with the array of processed image objects,
 *                                   where new uploads have 'picUrl' and 'publicId'.
 */
export const uploadImageObjects = async (images, onImageUploadStateChange) => {
  const uploadPromises = images.map(async (image, index) => {
    if (image.file && !image.picUrl) { // Only upload if it's a new file and not already uploaded
      onImageUploadStateChange(index, { progress: 0, error: null });
      try {
        const cloudinaryResponse = await uploadToCloudinary(image.file, (progress) => {
          onImageUploadStateChange(index, { progress });
        });
        return {
          picUrl: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id, // Optional: store public_id
          picDisplayPosition: image.picDisplayPosition,
          picDescription: image.picDescription,
        };
      } catch (uploadError) {
        console.error(`Error uploading image ${index} (${image.file.name}):`, uploadError);
        onImageUploadStateChange(index, { error: uploadError.message, progress: 0 });
        // Re-throw to allow Promise.all to catch and potentially stop the overall process
        throw new Error(`Failed to upload image: ${image.file.name}. ${uploadError.message}`);
      }
    }
    // If it's an existing image (has picUrl) or doesn't have a file, return it as is
    return image;
  });

  return Promise.all(uploadPromises);
};