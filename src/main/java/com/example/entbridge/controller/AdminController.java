package com.example.entbridge.controller;

import com.example.entbridge.dto.AdminDtos;
import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.dto.TestDtos;
import com.example.entbridge.dto.SubjectDto;
import com.example.entbridge.mapper.SubjectMapper;
import com.example.entbridge.security.UserPrincipal;
import com.example.entbridge.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    private final SubjectMapper subjectMapper;

    public AdminController(AdminService adminService, SubjectMapper subjectMapper) {
        this.adminService = adminService;
        this.subjectMapper = subjectMapper;
    }

    @GetMapping("/users")
    public List<AdminDtos.UserSummaryDto> users() {
        return adminService.listUsers();
    }

    @GetMapping("/results")
    public List<TestDtos.ResultDto> results() {
        return adminService.listResults();
    }

    @GetMapping("/homework")
    public List<HomeworkDtos.HomeworkDto> homework() {
        return adminService.listHomework();
    }

    @PostMapping("/homework")
    public HomeworkDtos.HomeworkDto createHomework(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid HomeworkDtos.CreateHomeworkRequest request) {
        return adminService.createHomework(principal.id(), request);
    }

    @PutMapping("/homework/{homeworkId}")
    public HomeworkDtos.HomeworkDto updateHomework(@PathVariable Long homeworkId,
            @RequestBody @Valid HomeworkDtos.UpdateHomeworkRequest request) {
        return adminService.updateHomework(homeworkId, request);
    }

    @DeleteMapping("/homework/{homeworkId}")
    public Map<String, String> deleteHomework(@PathVariable Long homeworkId) {
        adminService.deleteHomework(homeworkId);
        return Map.of("message", "Домашнее задание удалено");
    }

    @PostMapping("/homework/submissions/{submissionId}/review")
    public HomeworkDtos.SubmissionDto reviewSubmission(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long submissionId,
            @RequestBody @Valid HomeworkDtos.ReviewSubmissionRequest request) {
        return adminService.reviewSubmission(principal.id(), submissionId, request);
    }

    @PostMapping(value = "/homework/{homeworkId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public HomeworkDtos.HomeworkDto addHomeworkAttachments(@PathVariable Long homeworkId,
            @RequestPart("files") List<MultipartFile> files) {
        return adminService.addHomeworkAttachments(homeworkId, files);
    }

    @PostMapping("/subjects")
    public SubjectDto createSubject(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid AdminDtos.CreateSubjectRequest request) {
        return subjectMapper.toDto(adminService.createSubject(principal.id(), request));
    }

    @PostMapping("/questions")
    public Map<String, String> createQuestion(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid AdminDtos.CreateQuestionRequest request) {
        var question = adminService.createQuestion(principal.id(), request);
        return Map.of("id", question.getId().toString(), "message", "Вопрос создан");
    }

    @PostMapping(value = "/questions/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AdminDtos.ImportQuestionsResponse importQuestions(@AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("file") MultipartFile file,
            @RequestPart("subjectId") String subjectId) {
        return adminService.importQuestions(principal.id(), subjectId, file);
    }

    @PostMapping("/videos")
    public com.example.entbridge.dto.VideoLessonDto createVideo(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid AdminDtos.CreateVideoRequest request) {
        return adminService.createVideo(principal.id(), request);
    }

    @PutMapping("/videos/{videoId}")
    public com.example.entbridge.dto.VideoLessonDto updateVideo(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long videoId,
            @RequestBody @Valid AdminDtos.UpdateVideoRequest request) {
        return adminService.updateVideo(principal.id(), videoId, request);
    }

    @DeleteMapping("/videos/{videoId}")
    public Map<String, String> deleteVideo(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long videoId) {
        adminService.deleteVideo(principal.id(), videoId);
        return Map.of("message", "Видеоурок удален");
    }

}
