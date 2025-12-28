package com.example.entbridge.controller;

import com.example.entbridge.dto.AuthDtos;
import com.example.entbridge.dto.ProfileDtos;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.mapper.UserMapper;
import com.example.entbridge.security.UserPrincipal;
import com.example.entbridge.service.ProfileService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;

import java.util.Map;
@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {
    private final ProfileService profileService;
    private final UserMapper userMapper;

    public ProfileController(ProfileService profileService,
                             UserMapper userMapper) {
        this.profileService = profileService;
        this.userMapper = userMapper;
    }

    @GetMapping("/results")
    public ResponseEntity<?> results(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        var pr = profileService.history(requireUserId(principal),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "completedAt")));
        return ResponseEntity.ok(Map.of("content", pr.getContent(), "totalElements", pr.getTotalElements()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestBody @Valid ProfileDtos.ChangePasswordRequest body) {
        profileService.changePassword(requireUserId(principal), body.oldPassword(), body.newPassword());
        return ResponseEntity.ok(Map.of("message", "Пароль успешно изменён"));
    }

    @PutMapping
    public ResponseEntity<AuthDtos.UserDto> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                          @RequestBody @Valid ProfileDtos.UpdateProfileRequest body) {
        var updated = profileService.updateProfile(requireUserId(principal), body.name(), body.email());
        return ResponseEntity.ok(userMapper.toAuthDto(updated));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDtos.UserDto> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userMapper.toAuthDto(profileService.getUser(requireUserId(principal))));
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.id() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Требуется авторизация");
        }
        return principal.id();
    }
}
