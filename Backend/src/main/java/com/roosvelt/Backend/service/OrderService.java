package com.roosvelt.Backend.service;

import com.roosvelt.Backend.entity.Order;
import com.roosvelt.Backend.exception.ResourceNotFoundException;
import com.roosvelt.Backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    public Order updateOrderStatus(String id, Order.OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByPhone(String phone) {
        return orderRepository.findByCustomerPhone(phone);
    }

    public void deleteOrder(String id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}

