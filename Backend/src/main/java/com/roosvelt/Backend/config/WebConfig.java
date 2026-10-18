package com.roosvelt.Backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Plusieurs URLs possibles, séparées par des virgules : https://a.com,https://www.a.com
    @Value("${frontend.url}")
    private String[] frontendUrls;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/health")
                .allowedOrigins("*")
                .allowedMethods("GET")
                .allowedHeaders("*");

        // Une origine ne contient jamais de "/" final : on le retire pour éviter les erreurs de saisie
        Set<String> origins = new LinkedHashSet<>();
        for (String url : frontendUrls) {
            String origin = url.trim().replaceAll("/+$", "");
            if (!origin.isEmpty()) {
                origins.add(origin);
            }
        }
        origins.add("http://localhost:5173");

        registry.addMapping("/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

}
