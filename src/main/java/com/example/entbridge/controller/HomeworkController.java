package com.example.entbridge.controller;

import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.security.UserPrincipal;
import com.example.entbridge.service.HomeworkService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

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
        return homeworkService.submit(requireUserId(principal), homeworkId, request.content(), List.of());
    }

    @PostMapping(value = "/{homeworkId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public HomeworkDtos.SubmissionDto submitMultipart(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long homeworkId,
                                                      @RequestPart(value = "content", required = false) String content,
                                                      @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return homeworkService.submit(requireUserId(principal), homeworkId, content, files);
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadHomeworkAttachment(@AuthenticationPrincipal UserPrincipal principal,
                                                               @PathVariable Long attachmentId) {
        requireUserId(principal);
        HomeworkService.FileDownload file = homeworkService.getHomeworkAttachment(attachmentId);
        Resource resource = new FileSystemResource(file.path());
        return ResponseEntity.ok()
                .contentType(file.contentType() == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(file.contentType()))
                .header("Content-Disposition", "attachment; filename=\"" + file.originalName() + "\"")
                .body(resource);
    }

    @GetMapping("/submissions/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadSubmissionAttachment(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable Long attachmentId) {
        Long userId = requireUserId(principal);
        boolean isAdmin = principal != null && "ADMIN".equalsIgnoreCase(principal.role());
        HomeworkService.FileDownload file = homeworkService.getSubmissionAttachment(userId, isAdmin, attachmentId);
        Resource resource = new FileSystemResource(file.path());
        return ResponseEntity.ok()
                .contentType(file.contentType() == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(file.contentType()))
                .header("Content-Disposition", "attachment; filename=\"" + file.originalName() + "\"")
                .body(resource);
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.id() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Требуется авторизация");
        }
        return principal.id();
    }
}
