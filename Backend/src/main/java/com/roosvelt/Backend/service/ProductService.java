package com.roosvelt.Backend.service;

import com.roosvelt.Backend.dto.ProductResponse;
import com.roosvelt.Backend.entity.Product;
import com.roosvelt.Backend.exception.ResourceNotFoundException;
import com.roosvelt.Backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    public ProductResponse getAllProducts() {
        logger.info("Starting getAllProducts method");
        try {
            List<Product> products = productRepository.findAll();
            logger.info("Successfully retrieved {} products from database", products.size());
            ProductResponse response = new ProductResponse(products, products.size());
            logger.info("Successfully created ProductResponse with {} products", products.size());
            return response;
        } catch (Exception e) {
            logger.error("Error occurred while getting all products: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Product getProductById(Long id) {
        logger.info("Starting getProductById method with id: {}", id);
        try {
            if (id == null) {
                logger.warn("Product ID is null");
                throw new IllegalArgumentException("Product ID cannot be null");
            }

            logger.debug("Searching for product with id: {}", id);
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> {
                        logger.warn("Product not found with id: {}", id);
                        return new ResourceNotFoundException("Product not found with id: " + id);
                    });

            logger.info("Successfully found product with id: {} and name: {}", id, product.getName());
            return product;
        } catch (ResourceNotFoundException e) {
            logger.error("Product not found with id: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while getting product by id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public ProductResponse searchProducts(String query) {
        logger.info("Starting searchProducts method with query: '{}'", query);
        try {
            if (query == null || query.trim().isEmpty()) {
                logger.warn("Search query is null or empty");
                return new ProductResponse(List.of(), 0);
            }

            logger.debug("Executing search query: '{}'", query);
            List<Product> products = productRepository.findByNameOrDescriptionContainingIgnoreCase(query);
            logger.info("Search query '{}' returned {} products", query, products.size());

            ProductResponse response = new ProductResponse(products, products.size());
            logger.info("Successfully created search response with {} products", products.size());
            return response;
        } catch (Exception e) {
            logger.error("Error occurred while searching products with query '{}': {}", query, e.getMessage(), e);
            throw e;
        }
    }

    public ProductResponse filterProducts(String category, Integer minPrice, Integer maxPrice, String search) {
        logger.info("Starting filterProducts method with category: '{}', minPrice: {}, maxPrice: {}, search: '{}'",
                category, minPrice, maxPrice, search);
        try {
            // Validate price range
            if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
                logger.warn("Invalid price range: minPrice ({}) is greater than maxPrice ({})", minPrice, maxPrice);
                throw new IllegalArgumentException("Minimum price cannot be greater than maximum price");
            }

            // Handle string "null" values - convert them to actual null
            String normalizedCategory = "null".equals(category) ? null : category;
            String normalizedSearch = "null".equals(search) ? null : search;

            logger.debug("Normalized parameters - category: '{}', minPrice: {}, maxPrice: {}, search: '{}'",
                    normalizedCategory, minPrice, maxPrice, normalizedSearch);

            logger.debug("Executing filter query with normalized parameters");
            List<Product> products = productRepository.findWithFilters(normalizedCategory, minPrice, maxPrice, normalizedSearch);
            logger.info("Filter query returned {} products", products.size());

            ProductResponse response = new ProductResponse(products, products.size());
            logger.info("Successfully created filter response with {} products", products.size());
            return response;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid filter parameters: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while filtering products: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Product createProduct(Product product) {
        logger.info("Starting createProduct method");
        try {
            if (product == null) {
                logger.warn("Product object is null");
                throw new IllegalArgumentException("Product cannot be null");
            }

            logger.info("Creating new product with name: '{}'", product.getName());
            logger.debug("Product details - Name: '{}', Category: '{}', Price: {}",
                    product.getName(), product.getCategory(), product.getPrice());

            Product savedProduct = productRepository.save(product);
            logger.info("Successfully created product with id: {} and name: '{}'",
                    savedProduct.getId(), savedProduct.getName());
            return savedProduct;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid product data: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while creating product: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Product updateProduct(Long id, Product productDetails) {
        logger.info("Starting updateProduct method for id: {}", id);
        try {
            if (id == null) {
                logger.warn("Product ID is null for update");
                throw new IllegalArgumentException("Product ID cannot be null");
            }

            if (productDetails == null) {
                logger.warn("Product details are null for update of id: {}", id);
                throw new IllegalArgumentException("Product details cannot be null");
            }

            logger.debug("Fetching existing product with id: {}", id);
            Product product = getProductById(id);
            logger.info("Found existing product: '{}' for update", product.getName());

            // Log field updates
            if (productDetails.getName() != null) {
                logger.debug("Updating product name from '{}' to '{}'", product.getName(), productDetails.getName());
                product.setName(productDetails.getName());
            }
            if (productDetails.getDescription() != null) {
                logger.debug("Updating product description for id: {}", id);
                product.setDescription(productDetails.getDescription());
            }
            if (productDetails.getPrice() != null) {
                logger.debug("Updating product price from {} to {} for id: {}",
                        product.getPrice(), productDetails.getPrice(), id);
                product.setPrice(productDetails.getPrice());
            }
            if (productDetails.getImages() != null) {
                logger.debug("Updating product images for id: {}", id);
                product.setImages(productDetails.getImages());
            }
            if (productDetails.getCategory() != null) {
                logger.debug("Updating product category from '{}' to '{}' for id: {}",
                        product.getCategory(), productDetails.getCategory(), id);
                product.setCategory(productDetails.getCategory());
            }
            if (productDetails.getWarranty() != null) {
                logger.debug("Updating product warranty for id: {}", id);
                product.setWarranty(productDetails.getWarranty());
            }

            logger.debug("Saving updated product with id: {}", id);
            Product updatedProduct = productRepository.save(product);
            logger.info("Successfully updated product with id: {} and name: '{}'",
                    updatedProduct.getId(), updatedProduct.getName());
            return updatedProduct;
        } catch (ResourceNotFoundException e) {
            logger.error("Product not found for update with id: {}", id);
            throw e;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid update parameters for id {}: {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while updating product with id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public void deleteProduct(Long id) {
        logger.info("Starting deleteProduct method for id: {}", id);
        try {
            if (id == null) {
                logger.warn("Product ID is null for deletion");
                throw new IllegalArgumentException("Product ID cannot be null");
            }

            logger.debug("Fetching product to delete with id: {}", id);
            Product product = getProductById(id);
            logger.info("Found product '{}' for deletion with id: {}", product.getName(), id);

            logger.debug("Deleting product with id: {}", id);
            productRepository.delete(product);
            logger.info("Successfully deleted product with id: {}", id);
        } catch (ResourceNotFoundException e) {
            logger.error("Product not found for deletion with id: {}", id);
            throw e;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid deletion parameter: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while deleting product with id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}