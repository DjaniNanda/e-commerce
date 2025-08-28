package com.roosvelt.Backend.service;

import com.roosvelt.Backend.dto.ProductResponse;
import com.roosvelt.Backend.entity.Product;
import com.roosvelt.Backend.exception.ResourceNotFoundException;
import com.roosvelt.Backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public ProductResponse getAllProducts() {
        List<Product> products = productRepository.findAll();
        return new ProductResponse(products, products.size());
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public ProductResponse searchProducts(String query) {
        List<Product> products = productRepository.findByNameOrDescriptionContainingIgnoreCase(query);
        return new ProductResponse(products, products.size());
    }

    public ProductResponse filterProducts(String category, Integer minPrice, Integer maxPrice, String search) {
        List<Product> products = productRepository.findWithFilters(category, minPrice, maxPrice, search);
        return new ProductResponse(products, products.size());
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);

        if (productDetails.getName() != null) product.setName(productDetails.getName());
        if (productDetails.getDescription() != null) product.setDescription(productDetails.getDescription());
        if (productDetails.getPrice() != null) product.setPrice(productDetails.getPrice());
        if (productDetails.getImages() != null) product.setImages(productDetails.getImages());
        if (productDetails.getCategory() != null) product.setCategory(productDetails.getCategory());
        if (productDetails.getWarranty() != null) product.setWarranty(productDetails.getWarranty());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}