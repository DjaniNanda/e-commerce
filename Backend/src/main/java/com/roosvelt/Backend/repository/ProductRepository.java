package com.roosvelt.Backend.repository;

import com.roosvelt.Backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> findByNameOrDescriptionContainingIgnoreCase(@Param("query") String query);

    @Query(value = "SELECT * FROM products p WHERE " +
            "(:category IS NULL OR LOWER(p.category::text) = LOWER(:category)) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:search IS NULL OR " +
            "(LOWER(p.name::text) LIKE LOWER('%' || :search || '%') OR " +
            "LOWER(p.description::text) LIKE LOWER('%' || :search || '%')))",
            nativeQuery = true)
    List<Product> findWithFilters(@Param("category") String category,
                                  @Param("minPrice") Integer minPrice,
                                  @Param("maxPrice") Integer maxPrice,
                                  @Param("search") String search);

    List<Product> findByCategory(String category);
}