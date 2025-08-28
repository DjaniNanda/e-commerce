import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { imageUploadService } from '../../services/imageUploadService';

interface ImageField {
  id: number;
  file?: File;
  existingPath?: string;
  preview?: string;
  uploading?: boolean;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    warranty: ''
  });

  const [imageFields, setImageFields] = useState<ImageField[]>([{ id: 1 }]);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    loadCategories();
    if (isEditMode && id) {
      loadProduct(id);
    }
  }, [isEditMode, id]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data.map(cat => cat.name));
    } catch (err) {
      console.error('Error loading categories:', err);
      // Set some default categories if API fails
      setCategories(['Pièces détachées', 'Accessoires', 'Huiles & Fluides', 'Outillage', 'Électronique']);
    }
  };

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading product for edit:', productId);
      
      const product = await productService.getProductById(productId);
      console.log('Loaded product:', product);
      
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        warranty: product.warranty || ''
      });
      
      // Set existing images
      if (product.images && product.images.length > 0) {
        const existingImageFields: ImageField[] = product.images.map((imagePath, index) => ({
          id: index + 1,
          existingPath: imagePath,
          preview: imageUploadService.getImagePreviewUrl(imagePath)
        }));
        setImageFields(existingImageFields);
      }
      
      console.log('Form data set for editing');
      
    } catch (err) {
      console.error('Error loading product for edit:', err);
      setError('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleFileSelect = async (imageFieldId: number, file: File) => {
    // Validate file
    const validation = imageUploadService.validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    try {
      setError(null);
      
      console.log('Uploading file:', file.name, 'for field:', imageFieldId);
      
      // Update the image field to show uploading state
      setImageFields(prev => prev.map(field => 
        field.id === imageFieldId 
          ? { ...field, file, uploading: true, preview: URL.createObjectURL(file) }
          : field
      ));

      // Upload the image
      const uploadResult = await imageUploadService.uploadImage(file);
      
      console.log('Upload result:', uploadResult);
      
      // Update with uploaded image path
      setImageFields(prev => {
        const updated = prev.map(field => 
          field.id === imageFieldId 
            ? { 
                ...field, 
                file: undefined, // Clear the file since it's now uploaded
                existingPath: uploadResult.imagePath, 
                uploading: false,
                preview: imageUploadService.getImagePreviewUrl(uploadResult.imagePath)
              }
            : field
        );
        console.log('Updated imageFields:', updated);
        return updated;
      });
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors du téléchargement de l\'image');
      
      // Reset the field on error
      setImageFields(prev => prev.map(field => 
        field.id === imageFieldId 
          ? { id: field.id } // Reset to empty state
          : field
      ));
    }
  };

  const handleFileInputChange = (imageFieldId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(imageFieldId, file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (imageFieldId: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFieldId, imageFile);
    } else {
      setError('Veuillez déposer un fichier image valide');
    }
  };

  const addImageField = () => {
    const newId = Math.max(...imageFields.map(f => f.id)) + 1;
    setImageFields(prev => [...prev, { id: newId }]);
  };

  const removeImageField = (imageFieldId: number) => {
    if (imageFields.length > 1) {
      setImageFields(prev => prev.filter(field => field.id !== imageFieldId));
      
      // Clean up file input ref
      delete fileInputRefs.current[imageFieldId];
    }
  };

  const clearImage = (imageFieldId: number) => {
    setImageFields(prev => prev.map(field => 
      field.id === imageFieldId 
        ? { id: field.id } // Reset to empty state
        : field
    ));
    
    // Reset file input
    if (fileInputRefs.current[imageFieldId]) {
      fileInputRefs.current[imageFieldId]!.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom du produit est requis');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Le prix doit être un nombre positif');
      return false;
    }
    if (!formData.category) {
      setError('La catégorie est requise');
      return false;
    }
    
    // Check if at least one image is provided
    const hasImages = imageFields.some(field => field.existingPath || field.file);
    if (!hasImages) {
      setError('Au moins une image est requise');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        warranty: formData.warranty.trim()
      };
      
      if (isEditMode && id) {
        // For editing: separate existing images and new files
        const existingImages = imageFields
          .filter(field => field.existingPath && !field.file)
          .map(field => field.existingPath!);
          
        const newImageFiles = imageFields
          .filter(field => field.file)
          .map(field => field.file!);
        
        await productService.updateProductWithImages(id, {
          ...productData,
          existingImages,
          imageFiles: newImageFiles
        });
      } else {
        // For creating: collect all images (uploaded ones should already have existingPath)
        const allImages = imageFields
          .filter(field => field.existingPath)
          .map(field => field.existingPath!);
        
        // If we have images, create product with images array
        // If no uploaded images yet but files are present, those should have been uploaded already
        const finalProductData = {
          ...productData,
          images: allImages
        };
        
        console.log('Creating product with data:', finalProductData);
        await productService.createProduct(finalProductData);
      }
      
      navigate('/admin');
      
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la sauvegarde du produit');
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isEditMode ? 'Chargement du produit...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditMode ? 'Modifier le produit' : 'Nouveau produit'}
              </h1>
              <p className="text-blue-100 text-sm">
                {isEditMode ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit au catalogue'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Erreur</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {/* Show form state for debugging */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <strong>Form Mode:</strong> {isEditMode ? `Editing Product ${id}` : 'Creating New Product'}
            <br />
            <strong>Images:</strong> {imageFields.filter(f => f.existingPath || f.file).length} image(s)
          </div>
          
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Filtre à huile BMW E36"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 15000"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez le produit, ses caractéristiques et sa compatibilité..."
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Catégorisation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garantie
                </label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 12 mois, 6 mois, Garantie constructeur"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Images du produit
              </h3>
              
              <div className="space-y-4">
                {imageFields.map((imageField) => (
                  <div key={imageField.id} className="space-y-3">
                    {/* File Upload Area */}
                    <div
                      className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors"
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDrop={(e) => handleDrop(imageField.id, e)}
                    >
                      <input
                        ref={(ref) => fileInputRefs.current[imageField.id] = ref}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileInputChange(imageField.id, e)}
                        className="hidden"
                        id={`file-input-${imageField.id}`}
                      />
                      
                      {imageField.uploading ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                        </div>
                      ) : (imageField.existingPath || imageField.preview) ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={imageField.preview || imageField.existingPath}
                              alt={`Preview ${imageField.id}`}
                              className="w-20 h-20 object-cover rounded-lg border"
                              onError={() => console.error(`Failed to load image: ${imageField.existingPath || imageField.preview}`)}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {imageField.file ? 'Image téléchargée' : 'Image existante'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {imageField.existingPath || 'Nouveau fichier'}
                              </p>
                              {imageField.file && (
                                <p className="text-xs text-blue-600">
                                  {imageUploadService.getFileSizeString(imageField.file.size)}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => clearImage(imageField.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div>
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[imageField.id]?.click()}
                              className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                              Cliquez pour télécharger
                            </button>
                            <span className="text-gray-500"> ou glissez-déposez une image</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, JPEG jusqu'à 5MB
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove Image Field Button */}
                    {imageFields.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeImageField(imageField.id)}
                          className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Supprimer ce champ
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add Image Button */}
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center px-4 py-3 text-blue-600 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors w-full justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une image
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
                disabled={loading || imageFields.some(field => field.uploading)}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditMode ? 'Sauvegarder' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;