package com.roosvelt.Backend.dto;

import com.roosvelt.Backend.entity.CustomerInfo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public class CreateOrderRequest {
    @Valid
    @NotNull
    private CustomerInfo customerInfo;

    @NotNull
    private List<CreateOrderItemRequest> items;

    @NotNull
    @Positive
    private Integer total;

    public CreateOrderRequest() {}

    // Getters and Setters
    public CustomerInfo getCustomerInfo() { return customerInfo; }
    public void setCustomerInfo(CustomerInfo customerInfo) { this.customerInfo = customerInfo; }

    public List<CreateOrderItemRequest> getItems() { return items; }
    public void setItems(List<CreateOrderItemRequest> items) { this.items = items; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
}



