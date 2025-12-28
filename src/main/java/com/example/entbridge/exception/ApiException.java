package com.example.entbridge.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final String error;
    private final HttpStatus status;

    public ApiException(HttpStatus status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
    }

    public String getError() {
        return error;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
