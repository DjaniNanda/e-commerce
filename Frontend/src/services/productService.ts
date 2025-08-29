import { api } from './api';
import { imageUploadService } from './imageUploadService';
import { Product } from '../types';

// Define the response type for endpoints that return product lists with count
interface ProductResponse {
  products: Product[];
  count: number;
}

// Interface for creating product with file uploads
interface CreateProductWithFiles {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  warranty?: string;
  imageFiles: File[];
}

export const productService = {
  // Récupérer tous les produits
  getAllProducts: async (): Promise<ProductResponse> => {
    return await api.get('/products');
  },
  
  // Récupérer un produit par ID
  getProductById: async (id: string): Promise<Product> => {
    return await api.get(`/products/${id}`);
  },
  
  // Rechercher des produits
  searchProducts: async (query: string): Promise<ProductResponse> => {
    return await api.get(`/products/search?q=${encodeURIComponent(query)}`);
  },
  
  // Filtrer les produits par catégorie
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/products/filter?category=${encodeURIComponent(category)}`);
    return response.products || response; // Handle both response formats
  },
  
  // Filtrer les produits par prix
  getProductsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    return await api.get(`/products/price?min=${minPrice}&max=${maxPrice}`);
  },
  
  // Filtrer les produits avec plusieurs critères
  filterProducts: async (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.search) params.append('search', filters.search);
    
    return await api.get(`/products/filter?${params.toString()}`);
  },
  
  // Admin: Ajouter un produit (original method)
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return await api.post('/products', product);
  },
  
  // Admin: Ajouter un produit avec upload d'images
  createProductWithImages: async (productData: CreateProductWithFiles): Promise<Product> => {
    try {
      // First, upload all images
      const uploadedImages = await imageUploadService.uploadMultipleImages(productData.imageFiles);
      
      // Extract image paths
      const imagePaths = uploadedImages.map(img => img.imagePath);
      
      // Create product with uploaded image paths
      const product = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        subcategory: productData.subcategory,
        warranty: productData.warranty,
        images: imagePaths
      };
      
      return await api.post('/products', product);
    } catch (error) {
      console.error('Error creating product with images:', error);
      throw error;
    }
  },
  
  // Admin: Mettre à jour un produit
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    return await api.put(`/products/${id}`, product);
  },
  
  // Admin: Mettre à jour un produit avec nouvelles images
  updateProductWithImages: async (
    id: string, 
    productData: Partial<CreateProductWithFiles & { existingImages?: string[] }>
  ): Promise<Product> => {
    try {
      let imagePaths: string[] = productData.existingImages || [];
      
      // Upload new images if provided
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        const uploadedImages = await imageUploadService.uploadMultipleImages(productData.imageFiles);
        const newImagePaths = uploadedImages.map(img => img.imagePath);
        imagePaths = [...imagePaths, ...newImagePaths];
      }
      
      // Prepare update data
      const updateData: Partial<Product> = {
        ...(productData.name && { name: productData.name }),
        ...(productData.description && { description: productData.description }),
        ...(productData.price && { price: productData.price }),
        ...(productData.category && { category: productData.category }),
        ...(productData.subcategory && { subcategory: productData.subcategory }),
        ...(productData.warranty && { warranty: productData.warranty }),
        images: imagePaths
      };
      
      return await api.put(`/products/${id}`, updateData);
    } catch (error) {
      console.error('Error updating product with images:', error);
      throw error;
    }
  },
  
  // Admin: Supprimer un produit
  deleteProduct: async (id: string): Promise<void> => {
    return await api.delete(`/products/${id}`);
  },
  
  // Admin: Supprimer un produit et ses images
  deleteProductWithImages: async (id: string): Promise<void> => {
    try {
      // First get the product to retrieve image paths
      const product = await productService.getProductById(id);
      
      // Delete the product
      await api.delete(`/products/${id}`);
      
      // Delete associated images
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map(imagePath => 
          imageUploadService.deleteImage(imagePath).catch(err => {
            console.warn(`Failed to delete image ${imagePath}:`, err);
          })
        );
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('Error deleting product with images:', error);
      throw error;
    }
  }
};