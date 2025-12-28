package com.example.entbridge.controller;

import com.example.entbridge.dto.QuestionDto;
import com.example.entbridge.dto.TestDtos;
import com.example.entbridge.security.UserPrincipal;
import com.example.entbridge.service.TestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tests")
public class TestController {
    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping("/questions")
    public ResponseEntity<List<QuestionDto>> questions(@RequestParam("subjectId") String subjectId) {
        return ResponseEntity.ok(testService.questions(subjectId));
    }

    @PostMapping("/submit")
    public ResponseEntity<TestDtos.ResultDto> submit(@AuthenticationPrincipal UserPrincipal principal,
                                                     @RequestBody @Valid TestDtos.SubmitRequest request) {
        return ResponseEntity.ok(testService.submit(principal.id(), request));
    }
}
