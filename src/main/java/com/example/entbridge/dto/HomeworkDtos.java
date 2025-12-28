package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

public final class HomeworkDtos {
    private HomeworkDtos() {}

    public static record CreateHomeworkRequest(
            @NotBlank String title,
            @NotBlank String description,
            @JsonProperty("subjectId") @NotBlank String subjectId,
            @JsonProperty("dueDate") @NotNull LocalDate dueDate
    ) {}

    public static record UpdateHomeworkRequest(
            @NotBlank String title,
            @NotBlank String description,
            @JsonProperty("subjectId") @NotBlank String subjectId,
            @JsonProperty("dueDate") @NotNull LocalDate dueDate
    ) {}

    public static record SubmitHomeworkRequest(
            @NotBlank String content
    ) {}

    public static record ReviewSubmissionRequest(
            @JsonProperty("status") @NotBlank String status,
            String feedback,
            Integer grade
    ) {}

    public static record SubmissionDto(
            String id,
            @JsonProperty("homeworkId") String homeworkId,
            @JsonProperty("userId") String userId,
            @JsonProperty("userName") String userName,
            String content,
            @JsonProperty("submittedAt") Instant submittedAt,
            String status,
            Integer grade,
            String feedback
    ) {}

    public static record HomeworkDto(
            String id,
            String title,
            String description,
            @JsonProperty("subjectId") String subjectId,
            @JsonProperty("dueDate") LocalDate dueDate,
            @JsonProperty("assignedBy") String assignedBy,
            List<SubmissionDto> submissions
    ) {}
}
