package com.roosvelt.Backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @ElementCollection
    @CollectionTable(name = "category_subcategories", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "subcategory")
    private List<String> subcategories;


    public Category() {}

    public Category(String id, String name, List<String> subcategories) {
        this.id = id;
        this.name = name;
        this.subcategories = subcategories;
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getSubcategories() { return subcategories; }
    public void setSubcategories(List<String> subcategories) { this.subcategories = subcategories; }
}
