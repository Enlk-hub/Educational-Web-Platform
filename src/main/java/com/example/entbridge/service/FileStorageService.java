package com.example.entbridge.service;

import com.example.entbridge.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path baseDir;

    public FileStorageService(@Value("${app.storage.base-dir:uploads}") String baseDir) {
        this.baseDir = Paths.get(baseDir).toAbsolutePath().normalize();
    }

    public StoredFile store(String category, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_EMPTY", "Файл пустой");
        }
        String extension = extractExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path targetDir = baseDir.resolve(category).normalize();
        try {
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(storedName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
            String relativePath = baseDir.relativize(target).toString().replace('\\', '/');
            return new StoredFile(relativePath,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize());
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_SAVE_FAILED", "Не удалось сохранить файл");
        }
    }

    public Path resolve(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PATH", "Некорректный путь файла");
        }
        Path resolved = baseDir.resolve(storagePath).normalize();
        if (!resolved.startsWith(baseDir)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PATH", "Некорректный путь файла");
        }
        if (!Files.exists(resolved)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Файл не найден");
        }
        return resolved;
    }

    private String extractExtension(String filename) {
        if (filename == null) {
            return "";
        }
        String cleanName = Objects.toString(filename, "");
        int idx = cleanName.lastIndexOf('.');
        if (idx < 0 || idx == cleanName.length() - 1) {
            return "";
        }
        return cleanName.substring(idx + 1);
    }

    public record StoredFile(String storagePath, String originalName, String contentType, long size) {}
}
