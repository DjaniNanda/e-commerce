package com.roosvelt.Backend.dto;

import com.roosvelt.Backend.entity.CustomerInfo;
import com.roosvelt.Backend.entity.Order;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {
    private String id;
    private CustomerInfo customerInfo;
    private List<OrderItemResponse> items;
    private Integer total;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;

    public OrderResponse() {}

    // Constructor to convert from Entity
    public OrderResponse(Order order) {
        this.id = order.getId();
        this.customerInfo = order.getCustomerInfo();
        this.items = order.getItems().stream()
                .map(OrderItemResponse::new)
                .collect(Collectors.toList());
        this.total = order.getTotal();
        this.status = order.getStatus();
        this.createdAt = order.getCreatedAt();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public CustomerInfo getCustomerInfo() { return customerInfo; }
    public void setCustomerInfo(CustomerInfo customerInfo) { this.customerInfo = customerInfo; }

    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public Order.OrderStatus getStatus() { return status; }
    public void setStatus(Order.OrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


