package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record VideoLessonDto(
        String id,
        String title,
        @JsonProperty("subjectId") String subjectId,
        @JsonProperty("youtubeUrl") String youtubeUrl,
        String thumbnail,
        String duration,
        String description
) {}
