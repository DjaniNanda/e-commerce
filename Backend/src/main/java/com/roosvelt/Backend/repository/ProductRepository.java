package com.roosvelt.Backend.repository;

import com.roosvelt.Backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Méthodes de tri par défaut
    List<Product> findAllByOrderByPriceAsc();
    List<Product> findAllByOrderByPriceDesc();
    List<Product> findAllByOrderByNameAsc();
    List<Product> findAllByOrderByNameDesc();

    // Méthodes de recherche avec tri
    @Query(value = "SELECT * FROM products p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY p.price ASC",
            nativeQuery = true)
    List<Product> findByNameOrDescriptionContainingIgnoreCaseOrderByPriceAsc(@Param("query") String query);

    @Query(value = "SELECT * FROM products p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY p.price DESC",
            nativeQuery = true)
    List<Product> findByNameOrDescriptionContainingIgnoreCaseOrderByPriceDesc(@Param("query") String query);

    @Query(value = "SELECT * FROM products p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY p.name ASC",
            nativeQuery = true)
    List<Product> findByNameOrDescriptionContainingIgnoreCaseOrderByNameAsc(@Param("query") String query);

    @Query(value = "SELECT * FROM products p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY p.name DESC",
            nativeQuery = true)
    List<Product> findByNameOrDescriptionContainingIgnoreCaseOrderByNameDesc(@Param("query") String query);

    // Méthode de filtrage avec tri
    @Query(value = "SELECT * FROM products p WHERE " +
            "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:search IS NULL OR " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))) " +
            "ORDER BY " +
            "CASE WHEN :sortBy = 'price_asc' THEN p.price END ASC, " +
            "CASE WHEN :sortBy = 'price_desc' THEN p.price END DESC, " +
            "CASE WHEN :sortBy = 'name_asc' THEN p.name END ASC, " +
            "CASE WHEN :sortBy = 'name_desc' THEN p.name END DESC, " +
            "p.price ASC", // Tri par défaut par prix croissant
            nativeQuery = true)
    List<Product> findWithFilters(@Param("category") String category,
                                 @Param("minPrice") Integer minPrice,
                                 @Param("maxPrice") Integer maxPrice,
                                 @Param("search") String search,
                                 @Param("sortBy") String sortBy);

    List<Product> findByCategory(String category);
    
    // Méthode de recherche par défaut (utilisée par le contrôleur)
    @Query(value = "SELECT * FROM products p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))",
            nativeQuery = true)
    List<Product> findByNameOrDescriptionContainingIgnoreCase(@Param("query") String query);
}