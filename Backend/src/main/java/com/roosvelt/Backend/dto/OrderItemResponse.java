package com.roosvelt.Backend.dto;

import com.roosvelt.Backend.entity.OrderItem;

public class OrderItemResponse {
    private Long id;
    private ProductResponse product;
    private Integer quantity;

    public OrderItemResponse() {
    }

    // Constructor to convert from Entity
    public OrderItemResponse(OrderItem orderItem) {
        this.id = orderItem.getId();
        this.product = new ProductResponse(orderItem.getProduct());
        this.quantity = orderItem.getQuantity();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProductResponse getProduct() {
        return product;
    }

    public void setProduct(ProductResponse product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}