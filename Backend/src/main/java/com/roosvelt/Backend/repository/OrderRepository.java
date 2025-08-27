package com.roosvelt.Backend.repository;

import com.roosvelt.Backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    @Query("SELECT o FROM Order o WHERE o.customerInfo.phone = :phone ORDER BY o.createdAt DESC")
    List<Order> findByCustomerPhone(@Param("phone") String phone);

    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);
    List<Order> findAllByOrderByCreatedAtDesc();
}