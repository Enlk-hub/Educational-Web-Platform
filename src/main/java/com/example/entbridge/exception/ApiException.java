package com.example.entbridge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;

public class ApiException extends RuntimeException {
    private final String error;
    @NonNull
    private final HttpStatus status;

    public ApiException(@NonNull HttpStatus status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
    }

    public String getError() {
        return error;
    }

    @NonNull
    public HttpStatus getStatus() {
        return status;
    }
}
