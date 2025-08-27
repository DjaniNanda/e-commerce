package com.roosvelt.Backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.roosvelt.Backend.entity.Product;

public class CreateOrderItemRequest {
    @NotNull
    private Product product;

    @NotNull
    @Positive
    private Integer quantity;

    public CreateOrderItemRequest() {
    }

    // Getters and Setters
    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
