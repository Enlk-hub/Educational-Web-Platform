package com.example.entbridge.controller;

import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.security.UserPrincipal;
import com.example.entbridge.service.HomeworkService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/v1/homework")
public class HomeworkController {
    private final HomeworkService homeworkService;

    public HomeworkController(HomeworkService homeworkService) {
        this.homeworkService = homeworkService;
    }

    @GetMapping
    public List<HomeworkDtos.HomeworkDto> list(@AuthenticationPrincipal UserPrincipal principal) {
        return homeworkService.listForStudent(requireUserId(principal));
    }

    @PostMapping("/{homeworkId}/submit")
    public HomeworkDtos.SubmissionDto submit(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable Long homeworkId,
                                             @RequestBody @Valid HomeworkDtos.SubmitHomeworkRequest request) {
        return homeworkService.submit(requireUserId(principal), homeworkId, request);
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.id() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Требуется авторизация");
        }
        return principal.id();
    }
}
