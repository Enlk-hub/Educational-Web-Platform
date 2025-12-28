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
    public HomeworkDtos.SubmissionDto reviewSubmission(@PathVariable Long submissionId,
                                                       @RequestBody @Valid HomeworkDtos.ReviewSubmissionRequest request) {
        return adminService.reviewSubmission(submissionId, request);
    }

    @PostMapping("/subjects")
    public SubjectDto createSubject(@RequestBody @Valid AdminDtos.CreateSubjectRequest request) {
        return subjectMapper.toDto(adminService.createSubject(request));
    }

    @PostMapping("/questions")
    public Map<String, String> createQuestion(@RequestBody @Valid AdminDtos.CreateQuestionRequest request) {
        var question = adminService.createQuestion(request);
        return Map.of("id", question.getId().toString(), "message", "Вопрос создан");
    }
}
