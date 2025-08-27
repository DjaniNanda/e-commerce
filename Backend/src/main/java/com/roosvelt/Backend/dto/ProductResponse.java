package com.roosvelt.Backend.dto;

import com.roosvelt.Backend.entity.Product;
import java.util.List;

public class ProductResponse {
    private List<Product> products;
    private long count;

    public ProductResponse(Product product) {
    }

    public ProductResponse(List<Product> products, long count) {
        this.products = products;
        this.count = count;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}