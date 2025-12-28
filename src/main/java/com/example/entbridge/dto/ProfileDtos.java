package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ProfileDtos {
    private ProfileDtos() {}

    public static record UpdateProfileRequest(
            @JsonProperty("name") @NotBlank String name,
            @Email @NotBlank String email
    ) {}

    public static record ChangePasswordRequest(
            @JsonProperty("oldPassword") @NotBlank String oldPassword,
            @JsonProperty("newPassword") @NotBlank @Size(min = 6) String newPassword
    ) {}
}
