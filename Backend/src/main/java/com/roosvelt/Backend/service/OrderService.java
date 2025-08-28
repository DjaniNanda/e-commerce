package com.roosvelt.Backend.service;

import com.roosvelt.Backend.dto.CreateOrderRequest;
import com.roosvelt.Backend.dto.OrderResponse;
import com.roosvelt.Backend.entity.Order;
import com.roosvelt.Backend.entity.OrderItem;
import com.roosvelt.Backend.entity.Product;
import com.roosvelt.Backend.exception.ResourceNotFoundException;
import com.roosvelt.Backend.repository.OrderRepository;
import com.roosvelt.Backend.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)  // Added this annotation
    public List<OrderResponse> getAllOrders() {
        log.info("Getting all orders");
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        try {
            log.info("Creating order with {} items for customer: {}",
                    request.getItems().size(), request.getCustomerInfo().getPhone());

            // Create Order entity
            Order order = new Order();
            order.setCustomerInfo(request.getCustomerInfo());
            order.setTotal(request.getTotal());

            // Convert DTO items to entities
            List<OrderItem> orderItems = request.getItems().stream()
                    .map(itemRequest -> {
                        OrderItem orderItem = new OrderItem();

                        // Fetch the product from database to ensure it exists
                        Product product = productRepository.findById(itemRequest.getProduct().getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProduct().getId()));

                        orderItem.setProduct(product);
                        orderItem.setQuantity(itemRequest.getQuantity());
                        orderItem.setOrder(order); // Set bidirectional relationship

                        return orderItem;
                    })
                    .collect(Collectors.toList());

            order.setItems(orderItems);

            Order savedOrder = orderRepository.save(order);
            log.info("Order created successfully with ID: {}", savedOrder.getId());

            return new OrderResponse(savedOrder);

        } catch (Exception e) {
            log.error("Error creating order: ", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)  // Added this annotation
    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return new OrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return new OrderResponse(updatedOrder);
    }

    @Transactional(readOnly = true)  // Added this annotation
    public List<OrderResponse> getOrdersByPhone(String phone) {
        return orderRepository.findByCustomerPhone(phone)
                .stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteOrder(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        orderRepository.delete(order);
    }
}