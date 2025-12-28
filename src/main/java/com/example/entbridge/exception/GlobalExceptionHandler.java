package com.example.entbridge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.stream.Collectors;
import org.springframework.web.bind.MethodArgumentNotValidException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApi(ApiException ex) {
        return build(ex.getStatus(), ex.getError(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraint(ConstraintViolationException ex) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleBadJson(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "MALFORMED_JSON", "Некорректный формат запроса");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handle(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", ex.getMessage());
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String error, String message) {
        return ResponseEntity.status(status).body(new ApiError(error, message, Instant.now().toString()));
    }
}
