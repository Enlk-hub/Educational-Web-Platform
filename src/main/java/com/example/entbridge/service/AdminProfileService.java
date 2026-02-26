package com.example.entbridge.service;

import com.example.entbridge.dto.AdminProfileDtos;
import com.example.entbridge.entity.AdminNote;
import com.example.entbridge.entity.User;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class AdminProfileService {
        private final AdminNoteRepository noteRepository;
        private final AuditLogRepository auditLogRepository;
        private final QuestionRepository questionRepository;
        private final HomeworkSubmissionRepository submissionRepository;
        private final UserRepository userRepository;

        public AdminProfileService(AdminNoteRepository noteRepository,
                        AuditLogRepository auditLogRepository,
                        QuestionRepository questionRepository,
                        HomeworkSubmissionRepository submissionRepository,
                        UserRepository userRepository) {
                this.noteRepository = noteRepository;
                this.auditLogRepository = auditLogRepository;
                this.questionRepository = questionRepository;
                this.submissionRepository = submissionRepository;
                this.userRepository = userRepository;
        }

        public AdminProfileDtos.AdminStatsDto getStats(Long adminId) {
                if (adminId == null)
                        throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ID", "ID не может быть пустым");
                User admin = userRepository.findById(adminId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                                                "Пользователь не найден"));

                long questions = questionRepository.countByCreatedBy(admin);
                long reviews = submissionRepository.countByReviewedBy(admin);
                long totalActions = auditLogRepository.countByAdmin(admin);

                return new AdminProfileDtos.AdminStatsDto(questions, reviews, totalActions);
        }

        public List<AdminProfileDtos.AdminNoteDto> getNotes(Long adminId) {
                if (adminId == null)
                        throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ID", "ID не может быть пустым");
                User admin = userRepository.findById(adminId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                                                "Пользователь не найден"));
                return noteRepository.findByAdminOrderByCreatedAtDesc(admin).stream()
                                .map(note -> new AdminProfileDtos.AdminNoteDto(
                                                note.getId().toString(),
                                                note.getContent(),
                                                note.isCompleted(),
                                                note.getCreatedAt()))
                                .toList();
        }

        @Transactional
        public AdminProfileDtos.AdminNoteDto createNote(Long adminId, AdminProfileDtos.CreateNoteRequest request) {
                if (adminId == null)
                        throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ID", "ID не может быть пустым");
                User admin = userRepository.findById(adminId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                                                "Пользователь не найден"));
                AdminNote note = new AdminNote();
                note.setAdmin(admin);
                note.setContent(request.content());
                note = noteRepository.save(note);
                return new AdminProfileDtos.AdminNoteDto(note.getId().toString(), note.getContent(), note.isCompleted(),
                                note.getCreatedAt());
        }

        @Transactional
        public AdminProfileDtos.AdminNoteDto updateNote(Long adminId, Long noteId,
                        AdminProfileDtos.UpdateNoteRequest request) {
                if (noteId == null)
                        throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ID", "ID заметки не может быть пустым");
                AdminNote note = noteRepository.findById(noteId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOTE_NOT_FOUND",
                                                "Заметка не найдена"));
                if (!note.getAdmin().getId().equals(adminId)) {
                        throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Нет доступа");
                }
                if (request.content() != null)
                        note.setContent(request.content());
                if (request.completed() != null)
                        note.setCompleted(request.completed());
                note.setUpdatedAt(Instant.now());
                note = noteRepository.save(note);
                return new AdminProfileDtos.AdminNoteDto(note.getId().toString(), note.getContent(), note.isCompleted(),
                                note.getCreatedAt());
        }

        @Transactional
        public void deleteNote(Long adminId, Long noteId) {
                if (noteId == null)
                        throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ID", "ID заметки не может быть пустым");
                AdminNote note = noteRepository.findById(noteId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOTE_NOT_FOUND",
                                                "Заметка не найдена"));
                if (!note.getAdmin().getId().equals(adminId)) {
                        throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Нет доступа");
                }
                noteRepository.delete(note);
        }

        public List<AdminProfileDtos.AuditLogDto> getAuditLogs(Long adminId) {
                if (adminId == null)
                        throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ID", "ID не может быть пустым");
                User admin = userRepository.findById(adminId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                                                "Пользователь не найден"));
                return auditLogRepository.findByAdminOrderByCreatedAtDesc(admin).stream().limit(20)
                                .map(log -> new AdminProfileDtos.AuditLogDto(
                                                log.getId().toString(),
                                                log.getAction(),
                                                log.getEntityType(),
                                                log.getEntityId() == null ? null : log.getEntityId().toString(),
                                                log.getDetails(),
                                                log.getCreatedAt()))
                                .toList();
        }
}
