package com.roosvelt.Backend.controller;

import com.roosvelt.Backend.dto.CreateOrderRequest;
import com.roosvelt.Backend.dto.OrderResponse;
import com.roosvelt.Backend.entity.Order;
import com.roosvelt.Backend.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerInfo().getPhone());
        OrderResponse createdOrder = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable String id,
                                                           @RequestBody Map<String, String> statusRequest) {
        String status = statusRequest.get("status");
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, Order.OrderStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<List<OrderResponse>> getOrdersByPhone(@PathVariable String phone) {
        List<OrderResponse> orders = orderService.getOrdersByPhone(phone);
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
