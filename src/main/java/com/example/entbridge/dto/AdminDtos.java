package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

public final class AdminDtos {
        private AdminDtos() {
        }

        public static record UserSummaryDto(
                        String id,
                        @JsonProperty("name") String name,
                        String email,
                        String username,
                        @JsonProperty("isAdmin") boolean isAdmin,
                        @JsonProperty("createdAt") Instant createdAt) {
        }

        public static record CreateSubjectRequest(
                        @NotBlank String code,
                        @NotBlank String title,
                        String iconUrl,
                        @JsonProperty("isMandatory") boolean isMandatory,
                        String category,
                        @JsonProperty("maxScore") Integer maxScore) {
        }

        public static record CreateQuestionRequest(
                        @JsonProperty("subjectId") @NotBlank String subjectId,
                        @NotBlank String text,
                        Integer points,
                        String explanation,
                        @NotEmpty List<QuestionOptionRequest> options) {
        }

        public static record QuestionOptionRequest(
                        @NotBlank String text,
                        @NotNull Boolean isCorrect) {
        }

        public static record ImportQuestionsResponse(
                        int created,
                        int skipped,
                        List<String> errors) {
        }

        public static record CreateVideoRequest(
                        @NotBlank String title,
                        @NotBlank String subjectId,
                        @NotBlank String youtubeUrl,
                        String description,
                        String thumbnail,
                        String duration) {
        }

        public static record UpdateVideoRequest(
                        String title,
                        String subjectId,
                        String youtubeUrl,
                        String description,
                        String thumbnail,
                        String duration) {
        }

}
