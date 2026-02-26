package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
        private AuthDtos() {
        }

        public static record LoginRequest(
                        @NotBlank String username,
                        @NotBlank String password) {
        }

        public static record RegisterRequest(
                        @JsonProperty("full_name") @NotBlank String fullName,
                        @Email @NotBlank String email,
                        @NotBlank String username,
                        @NotBlank @Size(min = 6) String password) {
        }

        public static record AuthResponse(String token, UserDto user) {
        }

        public static record UserDto(
                        String id,
                        @JsonProperty("name") String name,
                        String email,
                        @JsonProperty("username") String username,
                        @JsonProperty("isAdmin") boolean isAdmin,
                        @JsonProperty("createdAt") java.time.Instant createdAt) {
        }
}
