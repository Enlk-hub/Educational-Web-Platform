package com.example.entbridge.controller;

import com.example.entbridge.dto.AdminProfileDtos;
import com.example.entbridge.security.UserPrincipal;
import com.example.entbridge.service.AdminProfileService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/profile")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {
    private final AdminProfileService profileService;

    public AdminProfileController(AdminProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/stats")
    public AdminProfileDtos.AdminStatsDto getStats(@AuthenticationPrincipal UserPrincipal principal) {
        return profileService.getStats(principal.id());
    }

    @GetMapping("/notes")
    public List<AdminProfileDtos.AdminNoteDto> getNotes(@AuthenticationPrincipal UserPrincipal principal) {
        return profileService.getNotes(principal.id());
    }

    @PostMapping("/notes")
    public AdminProfileDtos.AdminNoteDto createNote(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid AdminProfileDtos.CreateNoteRequest request) {
        return profileService.createNote(principal.id(), request);
    }

    @PutMapping("/notes/{noteId}")
    public AdminProfileDtos.AdminNoteDto updateNote(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long noteId,
            @RequestBody AdminProfileDtos.UpdateNoteRequest request) {
        return profileService.updateNote(principal.id(), noteId, request);
    }

    @DeleteMapping("/notes/{noteId}")
    public Map<String, String> deleteNote(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long noteId) {
        profileService.deleteNote(principal.id(), noteId);
        return Map.of("message", "Заметка удалена");
    }

    @GetMapping("/activity")
    public List<AdminProfileDtos.AuditLogDto> getActivity(@AuthenticationPrincipal UserPrincipal principal) {
        return profileService.getAuditLogs(principal.id());
    }
}
