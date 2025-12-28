package com.example.entbridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SubjectDto(
        String id,
        @JsonProperty("name") String name,
        @JsonProperty("isMandatory") boolean isMandatory,
        String category,
        @JsonProperty("maxScore") Integer maxScore
) {}
