package com.roosvelt.Backend.config;
import com.roosvelt.Backend.entity.Product;
import com.roosvelt.Backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (productRepository.count() == 0) {
            initializeProducts();
        }
    }

    private void initializeProducts() {
        List<Product> products = Arrays.asList(
                new Product(
                        "Amortisseur avant Peugeot 206/207",
                        "Amortisseur hydraulique haute qualité pour Peugeot 206 et 207. Garantit un confort de conduite optimal et une tenue de route parfaite.",
                        45000,
                        Arrays.asList("/amortisseurs1.jpg", "/amortisseurs2.jpg"),
                        "suspension",
                        "12 mois"
                ),
                new Product(
                        "Filtre à huile universel",
                        "Filtre à huile de haute qualité compatible avec plusieurs modèles de véhicules. Assure une filtration optimale de l'huile moteur.",
                        25000,
                        Arrays.asList("/filtreaoil3.jpg"),
                        "moteur",
                        "6 mois"
                ),
                new Product(
                        "Barre stabilisatrice avant",
                        "Barre stabilisatrice robuste pour améliorer la stabilité du véhicule en virage. Installation facile.",
                        15000,
                        Arrays.asList("/Labiellettedebarrestabilisatrice3.jpg", "/Labiellettedebarrestabilisatrice1.jpg"),
                        "suspension",
                        "12 mois"
                )
        );

        productRepository.saveAll(products);
        System.out.println("Sample products initialized successfully!");
    }
}
