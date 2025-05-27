import React from 'react';
import PropTypes from 'prop-types';

const ImageUploadManager = ({ images, onImagesChange, uploadStates = {} }) => {

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImageObjects = files.map((file, index) => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
      picDisplayPosition: (images?.length || 0) + index + 1,
      picDescription: '',
      // picUrl will be set after upload to Cloudinary
    }));

    const updatedImages = [...(images || []), ...newImageObjects].sort((a, b) => a.picDisplayPosition - b.picDisplayPosition);
    onImagesChange(updatedImages);
    e.target.value = null; // Clear file input
  };

  const handleMetadataChange = (index, field, value) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };

    if (field === 'picDisplayPosition') {
      updatedImages[index][field] = parseInt(value, 10) || 0;
      updatedImages.sort((a, b) => a.picDisplayPosition - b.picDisplayPosition);
    }
    onImagesChange(updatedImages);
  };

  const handleRemoveImage = (indexToRemove) => {
    const imageToRemove = images[indexToRemove];
    if (imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    const filteredImages = images.filter((_, index) => index !== indexToRemove);
    // Optional: Re-assign display positions if needed after removal
    // const reorderedImages = filteredImages.map((img, idx) => ({ ...img, picDisplayPosition: idx + 1 }));
    onImagesChange(filteredImages /* or reorderedImages */);
  };

  // Effect for cleaning up object URLs is implicitly handled by HouseForm's effect
  // if images prop is directly from HouseForm's state.
  // If this component were to manage its own previews independently, it would need its own cleanup.

  return (
    <div className="form-group">
      <label htmlFor="house-images-input">Images: </label>
      <input
        type="file"
        id="house-images-input"
        multiple
        onChange={handleFileSelect}
        accept="image/*"
      />

      {(images && images.length > 0) && (
        <div className="image-previews">
          <h4>Imagens Selecionadas:</h4>
          {images.map((image, index) => (
            <div
              key={image.previewUrl || image.picUrl || index}
              className={`image-preview-item ${uploadStates[index]?.error ? 'upload-error' : ''} ${uploadStates[index]?.progress === 100 ? 'upload-success' : ''}`}
            >
              <div className="image-container">
                <img
                  src={image.previewUrl || image.picUrl}
                  alt={image.picDescription || `Preview ${index + 1}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                {uploadStates[index] && typeof uploadStates[index].progress === 'number' && uploadStates[index].progress < 100 && !uploadStates[index].error && (
                  <div className="upload-progress-overlay">Uploading: {uploadStates[index].progress}%</div>
                )}
              </div>
              <div className="image-metadata-inputs">
                <label htmlFor={`picDisplayPosition-${index}`}>Posição na lista:</label>
                <input
                  type="number"
                  id={`picDisplayPosition-${index}`}
                  value={image.picDisplayPosition}
                  onChange={(e) => handleMetadataChange(index, 'picDisplayPosition', e.target.value)}
                  min="1"
                />
                <label htmlFor={`picDescription-${index}`}>Descrição da Imagem:</label>
                <textarea
                  id={`picDescription-${index}`}
                  value={image.picDescription}
                  onChange={(e) => handleMetadataChange(index, 'picDescription', e.target.value)}
                  rows="2"
                />
              </div>
              <button type="button" onClick={() => handleRemoveImage(index)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ImageUploadManager.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  onImagesChange: PropTypes.func.isRequired,
};

export default ImageUploadManager;