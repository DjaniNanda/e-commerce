import { api } from './api';

interface UploadResponse {
  success: boolean;
  imagePath: string;
  fileId: string;        // ImageKit file ID for deletion
  fileName: string;      // Original filename
  size: number;
  height?: number;       // Image dimensions from ImageKit
  width?: number;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

export const imageUploadService = {
  // Upload a single image
  uploadImage: async (file: File): Promise<UploadResponse> => {
    // Validate file before upload
    if (!file.type.startsWith('image/')) {
      throw new Error('Veuillez sélectionner un fichier image valide');
    }
        
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La taille de l\'image ne doit pas dépasser 5MB');
    }
        
    const formData = new FormData();
    formData.append('image', file);
        
    try {
      const response = await api.postFormData('/upload-image', formData);
      return response;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Erreur lors du téléchargement de l\'image');
    }
  },
    
  // Upload multiple images
  uploadMultipleImages: async (files: File[]): Promise<UploadResponse[]> => {
    const uploadPromises = files.map(file => imageUploadService.uploadImage(file));
        
    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Erreur lors du téléchargement des images');
    }
  },
    
  // Delete an image using ImageKit fileId
  deleteImage: async (fileId: string): Promise<DeleteResponse> => {
    try {
      const response = await api.delete(`/delete-image?fileId=${encodeURIComponent(fileId)}`);
      return response;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Erreur lors de la suppression de l\'image');
    }
  },
    
  // Validate image file
  validateImageFile: (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        isValid: false,
        error: 'Veuillez sélectionner un fichier image valide (PNG, JPG, JPEG, etc.)'
      };
    }
        
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'La taille de l\'image ne doit pas dépasser 5MB'
      };
    }
        
    // Check if file has content
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'Le fichier sélectionné est vide'
      };
    }
        
    return { isValid: true };
  },
    
  // Get file size in human readable format
  getFileSizeString: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
        
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
        
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
    
  // ImageKit URLs are already full URLs, no modification needed
  getImagePreviewUrl: (imagePath: string): string => {
    // ImageKit returns full URLs (https://ik.imagekit.io/...)
    return imagePath;
  }
};