import React, { useState, useEffect } from 'react';
import { uploadImageObjects } from '../services/cloudinaryService'; // Changed import
import PropTypes from 'prop-types';
import ImageUploadManager from './ImageUploadManager'; // Import the new component
import './HouseForm.css'

const HouseForm = ({ onSubmit, initialData = null, isLoading = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        price: '', // Store as string to allow for easier input, convert to number on submit
        bedrooms: '',
        bathrooms: '',
        area: '', // Square meters/feet
        images: [], // Will be an array of objects: { picUrl, picDisplayPosition, picDescription, file?, uploadProgress?, error? }
    });
    const [formErrors, setFormErrors] = useState({});
    const [imageUploadStates, setImageUploadStates] = useState({}); // To track progress/errors per image

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                address: initialData.address || '',
                price: initialData.price?.toString() || '',
                bedrooms: initialData.bedrooms?.toString() || '',
                bathrooms: initialData.bathrooms?.toString() || '',
                area: initialData.area?.toString() || '',
                images: initialData.images || [], // Assuming images are already in the correct format
            });
        }
    }, [initialData]);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            formData.images.forEach(image => {
                if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
            });
        };
    }, [formData.images]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Nome/Titulo é necessario.';
        if (formData.images.length === 0) errors.title = 'Carrega pelo menos uma imgem';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submission initiated. Validating form..."); // LOG 1

        if (!validateForm()) {
            return;
        }

        let processedImagesResult;

        try {
            // Use the new service function to upload images
            processedImagesResult = await uploadImageObjects(
                formData.images,
                (index, state) => { // Callback for progress/error updates
                    setImageUploadStates(prev => ({ ...prev, [index]: { ...(prev[index] || {}), ...state } }));
                }
            );
        } catch (error) {
            // Handle case where one of the uploads failed
            console.error("Error during image upload process:", error);
            // Optionally set a general form error state here
            // setFormErrors(prev => ({ ...prev, _general: "Image upload failed. Please try again."}));
            return; // Stop form submission
        }

        const submissionData = {
            ...formData,
            price: parseFloat(formData.price),
            bedrooms: parseInt(formData.bedrooms, 10),
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : 0,
            area: formData.area ? parseFloat(formData.area) : 0,
            images: processedImagesResult.map(img => ({ // Ensure publicId is included for Firestore
                picUrl: img.picUrl,
                publicId: img.publicId,
                picDisplayPosition: img.picDisplayPosition,
                picDescription: img.picDescription,
            })),
        };

        console.log("Final submission data to be sent to parent:", JSON.stringify(submissionData, null, 2)); // LOG 8
        setImageUploadStates({}); // Clear upload states
        onSubmit(submissionData);
    };


    // This function will be passed to ImageUploadManager
    const handleImagesUpdate = (updatedImages) => {
        setFormData(prev => ({
            ...prev,
            images: updatedImages
        }));
    };
    return (
        <form onSubmit={handleSubmit} className="house-form">
            <div className="form-group">
                <label htmlFor="title">Titulo: </label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} />
                {formErrors.title && <p className="error-text">{formErrors.title}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="description">Descrição no Imóvel: </label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="5" />
                {/* Add error display if needed */}
            </div>

            <div className="form-group">
                <label htmlFor="address">Endereço: </label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} />
                {formErrors.address && <p className="error-text">{formErrors.address}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="price">Montante: </label>
                <input type="text" id="price" name="price" value={formData.price} onChange={handleChange} />
                {formErrors.price && <p className="error-text">{formErrors.price}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="bedrooms">Quartos: </label>
                <input type="text" id="bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} />
                {formErrors.bedrooms && <p className="error-text">{formErrors.bedrooms}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="bathrooms">Banheiros: </label>
                <input type="text" id="bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} />
                {/* Add error display if needed */}
            </div>

            <div className="form-group">
                <label htmlFor="area">Área: </label>
                <input type="text" id="area" name="area" value={formData.area} onChange={handleChange} />
                {/* Add error display if needed */}
            </div>
            <ImageUploadManager
                images={formData.images}
                onImagesChange={handleImagesUpdate}
                uploadStates={imageUploadStates}
            />
            <button type="submit" disabled={isLoading}>
                {isLoading ? (initialData ? 'Actualizando...' : 'Adicionando...') : (initialData ? 'Actualizar Listagem' : 'Adicionar Listagem')}
            </button>
        </form>
    );
};

HouseForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    isLoading: PropTypes.bool,
};

export default HouseForm;