package com.example.entbridge.dto;

import java.time.Instant;

public class AdminProfileDtos {
        public record AdminStatsDto(
                        long questionsCreated,
                        long homeworkReviewed,
                        long totalActions) {
        }

        public record AdminNoteDto(
                        String id,
                        String content,
                        boolean completed,
                        Instant createdAt) {
        }

        public record CreateNoteRequest(
                        String content) {
        }

        public record UpdateNoteRequest(
                        String content,
                        Boolean completed) {
        }

        public record AuditLogDto(
                        String id,
                        String action,
                        String entityType,
                        String entityId,
                        String details,
                        Instant createdAt) {
        }
}
