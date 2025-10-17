package com.roosvelt.Backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.config.Configuration;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;
import io.imagekit.sdk.exceptions.BadRequestException;
import io.imagekit.sdk.exceptions.UnknownException;

import jakarta.annotation.PostConstruct;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ImageUploadController {

    @Value("${imagekit.public.key}")
    private String imagekitPublicKey;

    @Value("${imagekit.private.key}")
    private String imagekitPrivateKey;

    @Value("${imagekit.url.endpoint}")
    private String imagekitUrlEndpoint;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private ImageKit imageKit;

    @PostConstruct
    public void initializeImageKit() {
        try {
            System.out.println("=== ImageKit Configuration ===");
            System.out.println("Public Key: " + imagekitPublicKey);
            System.out.println("Private Key: " + (imagekitPrivateKey != null ? "***PROVIDED***" : "NULL"));
            System.out.println("URL Endpoint: " + imagekitUrlEndpoint);

            // ✅ CORRECT: Cette méthode existe dans le SDK
            this.imageKit = ImageKit.getInstance();
            Configuration config = new Configuration(imagekitPublicKey, imagekitPrivateKey, imagekitUrlEndpoint);
            imageKit.setConfig(config);

            System.out.println("✅ ImageKit initialized successfully");
        } catch (Exception e) {
            System.err.println("❌ Error initializing ImageKit: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Aucun fichier sélectionné"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("La taille du fichier ne doit pas dépasser 5MB"));
            }

            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Nom de fichier invalide"));
            }

            String fileExtension = getFileExtension(originalFileName).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Type de fichier non supporté. Utilisez: " + String.join(", ", ALLOWED_EXTENSIONS)));
            }

            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

            FileCreateRequest fileCreateRequest = new FileCreateRequest(file.getBytes(), uniqueFileName);
            fileCreateRequest.setFolder("/");
            fileCreateRequest.setUseUniqueFileName(false);

            Result result = imageKit.upload(fileCreateRequest);

            if (result != null) {
                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put("success", true);
                responseMap.put("imagePath", result.getUrl());
                responseMap.put("fileId", result.getFileId());
                responseMap.put("fileName", originalFileName);
                responseMap.put("size", file.getSize());
                responseMap.put("height", result.getHeight());
                responseMap.put("width", result.getWidth());

                return ResponseEntity.ok(responseMap);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(createErrorResponse("Erreur lors de l'upload sur ImageKit"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de l'upload: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete-image")
    public ResponseEntity<?> deleteImage(@RequestParam("fileId") String fileId) {
        try {
            Result result = imageKit.deleteFile(fileId);

            if (result != null) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Image supprimée avec succès"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Impossible de supprimer l'image"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la suppression: " + e.getMessage()));
        }
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return (lastDotIndex == -1) ? "" : fileName.substring(lastDotIndex + 1);
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return error;
    }
}