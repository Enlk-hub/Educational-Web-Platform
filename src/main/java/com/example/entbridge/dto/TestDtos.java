package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.Instant;
import java.util.List;

public final class TestDtos {
        private TestDtos() {
        }

        public static record SubmitRequest(
                        @JsonProperty("subjectId") @NotBlank String subjectId,
                        @JsonProperty("answers") @NotEmpty List<Answer> answers) {
        }

        public static record Answer(@JsonProperty("questionId") @NotBlank String questionId,
                        @JsonProperty("selectedOptionId") String selectedOptionId) {
        }

        public static record AnswerResultDto(
                        @JsonProperty("questionId") String questionId,
                        @JsonProperty("selectedOptionId") String selectedOptionId,
                        @JsonProperty("isCorrect") boolean isCorrect,
                        @JsonProperty("correctOptionId") String correctOptionId) {
        }

        public static record ResultDto(String id,
                        @JsonProperty("userId") String userId,
                        @JsonProperty("subjectId") String subjectId,
                        @JsonProperty("subjectName") String subjectName,
                        Integer score,
                        @JsonProperty("maxScore") Integer maxScore,
                        @JsonProperty("totalQuestions") Integer totalQuestions,
                        @JsonProperty("correctAnswers") Integer correctAnswers,
                        @JsonProperty("date") Instant date,
                        @JsonProperty("answers") List<AnswerResultDto> answers) {
        }
}
