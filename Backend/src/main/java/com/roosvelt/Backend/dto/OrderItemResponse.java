package com.roosvelt.Backend.dto;

import com.roosvelt.Backend.entity.OrderItem;
import com.roosvelt.Backend.entity.Product;

public class OrderItemResponse {
    private ProductOrderItemResponse product;
    private Integer quantity;

    public OrderItemResponse() {
    }

    // Constructor to convert from Entity
    public OrderItemResponse(OrderItem orderItem) {
        this.product = new ProductOrderItemResponse(orderItem.getProduct());
        this.quantity = orderItem.getQuantity();
    }

    // Getters and Setters
    public ProductOrderItemResponse getProduct() {
        return product;
    }

    public void setProduct(ProductOrderItemResponse product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}