package com.example.entbridge.controller;

import com.example.entbridge.dto.AuthDtos;
import com.example.entbridge.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@RequestBody @Valid AuthDtos.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.username(), req.password()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.AuthResponse> register(@RequestBody @Valid AuthDtos.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req.fullName(), req.email(), req.username(), req.password()));
    }
}
