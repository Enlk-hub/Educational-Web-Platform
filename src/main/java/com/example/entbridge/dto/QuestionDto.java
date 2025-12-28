package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record QuestionDto(
        String id,
        @JsonProperty("subjectId") String subjectId,
        @JsonProperty("question") String question,
        List<OptionDto> options
) {}
