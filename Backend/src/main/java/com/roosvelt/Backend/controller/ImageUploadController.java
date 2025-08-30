package com.roosvelt.Backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ImageUploadController {

    @Value("${imgbb.api.key}")
    private String imgbbApiKey;

    private static final String IMGBB_API_URL = "https://api.imgbb.com/1/upload";
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Aucun fichier sélectionné"));
            }

            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("La taille du fichier ne doit pas dépasser 5MB"));
            }

            // Get original filename and validate extension
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

            // Convert file to base64
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());

            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("key", imgbbApiKey);
            body.add("image", base64Image);
            body.add("name", getFileNameWithoutExtension(originalFileName));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Upload to ImgBB
            ResponseEntity<String> response = restTemplate.postForEntity(IMGBB_API_URL, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());

                if (jsonResponse.get("success").asBoolean()) {
                    JsonNode data = jsonResponse.get("data");

                    String imageUrl = data.get("url").asText();
                    String deleteUrl = data.get("delete_url").asText();

                    Map<String, Object> responseMap = new HashMap<>();
                    responseMap.put("success", true);
                    responseMap.put("imagePath", imageUrl); // This is what your frontend will use
                    responseMap.put("deleteUrl", deleteUrl); // Store this in your database if you want to delete later
                    responseMap.put("fileName", originalFileName);
                    responseMap.put("size", file.getSize());

                    return ResponseEntity.ok(responseMap);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(createErrorResponse("Erreur ImgBB: " + jsonResponse.get("error").get("message").asText()));
                }
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(createErrorResponse("Erreur de communication avec ImgBB"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de l'upload: " + e.getMessage()));
        }
    }

    // Optional: Delete image (Note: ImgBB free tier has limited delete functionality)
    @DeleteMapping("/delete-image")
    public ResponseEntity<?> deleteImage(@RequestParam("deleteUrl") String deleteUrl) {
        try {
            // For ImgBB, you would typically call the delete URL directly
            // But this requires the full delete URL which includes a hash
            ResponseEntity<String> response = restTemplate.getForEntity(deleteUrl, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Image supprimée avec succès"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Impossible de supprimer l'image"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la suppression"));
        }
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return (lastDotIndex == -1) ? "" : fileName.substring(lastDotIndex + 1);
    }

    private String getFileNameWithoutExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return (lastDotIndex == -1) ? fileName : fileName.substring(0, lastDotIndex);
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return error;
    }
}