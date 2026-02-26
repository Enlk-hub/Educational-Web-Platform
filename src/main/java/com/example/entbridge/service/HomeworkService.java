package com.example.entbridge.service;

import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.entity.Homework;
import com.example.entbridge.entity.HomeworkAttachment;
import com.example.entbridge.entity.HomeworkSubmission;
import com.example.entbridge.entity.HomeworkSubmissionAttachment;
import com.example.entbridge.entity.HomeworkSubmissionStatus;
import com.example.entbridge.entity.Subject;
import com.example.entbridge.entity.User;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.repository.HomeworkAttachmentRepository;
import com.example.entbridge.repository.HomeworkRepository;
import com.example.entbridge.repository.HomeworkSubmissionAttachmentRepository;
import com.example.entbridge.repository.HomeworkSubmissionRepository;
import com.example.entbridge.repository.SubjectRepository;
import com.example.entbridge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HomeworkService {
    private final HomeworkRepository homeworkRepository;
    private final HomeworkSubmissionRepository submissionRepository;
    private final HomeworkAttachmentRepository homeworkAttachmentRepository;
    private final HomeworkSubmissionAttachmentRepository submissionAttachmentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public HomeworkService(HomeworkRepository homeworkRepository,
            HomeworkSubmissionRepository submissionRepository,
            HomeworkAttachmentRepository homeworkAttachmentRepository,
            HomeworkSubmissionAttachmentRepository submissionAttachmentRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.homeworkRepository = homeworkRepository;
        this.submissionRepository = submissionRepository;
        this.homeworkAttachmentRepository = homeworkAttachmentRepository;
        this.submissionAttachmentRepository = submissionAttachmentRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<HomeworkDtos.HomeworkDto> listForAdmin() {
        List<Homework> homework = homeworkRepository.findAll();
        if (homework.isEmpty()) {
            return List.of();
        }
        List<HomeworkSubmission> submissions = submissionRepository.findByHomeworkIn(homework);
        Map<Long, List<HomeworkSubmission>> grouped = submissions.stream()
                .collect(Collectors.groupingBy(s -> s.getHomework().getId()));
        return homework.stream()
                .map(hw -> toDto(hw, grouped.getOrDefault(hw.getId(), List.of())))
                .toList();
    }

    @SuppressWarnings("null")
    @Transactional(readOnly = true)
    public List<HomeworkDtos.HomeworkDto> listForStudent(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        List<Homework> homework = homeworkRepository.findAll();
        if (homework.isEmpty()) {
            return List.of();
        }
        Map<Long, HomeworkSubmission> byHomework = submissionRepository.findByUser(user).stream()
                .collect(Collectors.toMap(s -> s.getHomework().getId(), s -> s, (a, b) -> a));

        return homework.stream()
                .map(hw -> {
                    HomeworkSubmission submission = byHomework.get(hw.getId());
                    List<HomeworkSubmission> submissions = submission == null ? List.of() : List.of(submission);
                    return toDto(hw, submissions);
                })
                .toList();
    }

    @SuppressWarnings("null")
    @Transactional
    public HomeworkDtos.HomeworkDto create(Long adminId, HomeworkDtos.CreateHomeworkRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        Subject subject = subjectRepository.findByCode(request.subjectId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));

        Homework homework = new Homework();
        homework.setTitle(request.title());
        homework.setDescription(request.description());
        homework.setSubject(subject);
        homework.setDueDate(request.dueDate());
        homework.setAssignedBy(admin.getUsername());
        homeworkRepository.save(homework);

        return toDto(homework, List.of());
    }

    @Transactional
    public HomeworkDtos.HomeworkDto update(Long homeworkId, HomeworkDtos.UpdateHomeworkRequest request) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOMEWORK_NOT_FOUND", "Задание не найдено"));
        Subject subject = subjectRepository.findByCode(request.subjectId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));

        homework.setTitle(request.title());
        homework.setDescription(request.description());
        homework.setSubject(subject);
        homework.setDueDate(request.dueDate());
        homeworkRepository.save(homework);

        return toDto(homework, new ArrayList<>(homework.getSubmissions()));
    }

    @SuppressWarnings("null")
    @Transactional
    public void delete(Long homeworkId) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOMEWORK_NOT_FOUND", "Задание не найдено"));
        homeworkRepository.delete(homework);
    }

    @SuppressWarnings("null")
    @Transactional
    public HomeworkDtos.SubmissionDto submit(Long userId, Long homeworkId, String content, List<MultipartFile> files) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOMEWORK_NOT_FOUND", "Задание не найдено"));

        HomeworkSubmission submission = submissionRepository.findByHomeworkAndUser(homework, user)
                .orElseGet(() -> {
                    HomeworkSubmission s = new HomeworkSubmission();
                    s.setHomework(homework);
                    s.setUser(user);
                    return s;
                });

        if (submission.getId() != null
                && submission.getStatus() != null
                && submission.getStatus() != HomeworkSubmissionStatus.NEEDS_REVISION) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "SUBMISSION_LOCKED",
                    "Ответ уже отправлен, дождитесь проверки");
        }

        boolean hasText = hasMeaningfulText(content);
        boolean hasNewFiles = files != null && files.stream().anyMatch(file -> file != null && !file.isEmpty());
        boolean hasExistingText = hasMeaningfulText(submission.getContent());
        boolean hasExistingFiles = submission.getAttachments() != null && !submission.getAttachments().isEmpty();
        if (!hasText && !hasNewFiles && !hasExistingText && !hasExistingFiles) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_SUBMISSION", "Добавьте текст или файл");
        }
        if (content != null) {
            submission.setContent(hasText ? content : null);
        }
        submission.setStatus(HomeworkSubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(Instant.now());
        submission.setUpdatedAt(Instant.now());
        submissionRepository.save(submission);
        if (hasNewFiles) {
            List<HomeworkSubmissionAttachment> attachments = files.stream()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(file -> storeSubmissionAttachment(submission, file))
                    .toList();
            submissionAttachmentRepository.saveAll(attachments);
            submission.getAttachments().addAll(attachments);
        }
        return toDto(submission);
    }

    @SuppressWarnings("null")
    @Transactional
    public HomeworkDtos.SubmissionDto review(Long adminId, Long submissionId,
            HomeworkDtos.ReviewSubmissionRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBMISSION_NOT_FOUND", "Работа не найдена"));
        HomeworkSubmissionStatus status = parseStatus(request.status());
        submission.setStatus(status);
        submission.setFeedback(request.feedback());
        submission.setGrade(request.grade());
        submission.setReviewedBy(admin);
        submission.setUpdatedAt(Instant.now());
        submissionRepository.save(submission);
        return toDto(submission);
    }

    @SuppressWarnings("null")
    @Transactional
    public HomeworkDtos.HomeworkDto addHomeworkAttachments(Long homeworkId, List<MultipartFile> files) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOMEWORK_NOT_FOUND", "Задание не найдено"));
        if (files == null || files.stream().noneMatch(file -> file != null && !file.isEmpty())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILES_EMPTY", "Выберите файл");
        }
        List<HomeworkAttachment> attachments = files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> storeHomeworkAttachment(homework, file))
                .toList();
        homeworkAttachmentRepository.saveAll(attachments);
        homework.getAttachments().addAll(attachments);
        return toDto(homework, new ArrayList<>(homework.getSubmissions()));
    }

    @SuppressWarnings("null")
    @Transactional(readOnly = true)
    public FileDownload getHomeworkAttachment(Long attachmentId) {
        HomeworkAttachment attachment = homeworkAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND", "Файл не найден"));
        return new FileDownload(fileStorageService.resolve(attachment.getStoragePath()),
                attachment.getContentType(),
                attachment.getOriginalName());
    }

    @SuppressWarnings("null")
    @Transactional(readOnly = true)
    public FileDownload getSubmissionAttachment(Long userId, boolean isAdmin, Long attachmentId) {
        HomeworkSubmissionAttachment attachment = submissionAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND", "Файл не найден"));
        HomeworkSubmission submission = attachment.getSubmission();
        if (!isAdmin && (submission == null || submission.getUser() == null
                || submission.getUser().getId() == null
                || !submission.getUser().getId().equals(userId))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Нет доступа к файлу");
        }
        return new FileDownload(fileStorageService.resolve(attachment.getStoragePath()),
                attachment.getContentType(),
                attachment.getOriginalName());
    }

    private HomeworkSubmissionStatus parseStatus(String value) {
        try {
            return HomeworkSubmissionStatus.valueOf(value);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "STATUS_INVALID", "Некорректный статус");
        }
    }

    private HomeworkDtos.HomeworkDto toDto(Homework homework, List<HomeworkSubmission> submissions) {
        List<HomeworkDtos.SubmissionDto> submissionDtos = submissions.stream()
                .sorted(Comparator.comparing(HomeworkSubmission::getSubmittedAt).reversed())
                .map(this::toDto)
                .toList();

        String subjectId = homework.getSubject() == null ? null : homework.getSubject().getCode();
        return new HomeworkDtos.HomeworkDto(
                homework.getId() == null ? null : homework.getId().toString(),
                homework.getTitle(),
                homework.getDescription(),
                subjectId,
                homework.getDueDate(),
                homework.getAssignedBy(),
                submissionDtos,
                homework.getAttachments() == null
                        ? List.of()
                        : homework.getAttachments().stream().map(this::toAttachmentDto).toList());
    }

    private HomeworkDtos.SubmissionDto toDto(HomeworkSubmission submission) {
        String userName = submission.getUser() == null ? null : submission.getUser().getFullName();
        if (userName == null || userName.isBlank()) {
            userName = submission.getUser() == null ? null : submission.getUser().getUsername();
        }
        return new HomeworkDtos.SubmissionDto(
                submission.getId() == null ? null : submission.getId().toString(),
                submission.getHomework() == null || submission.getHomework().getId() == null
                        ? null
                        : submission.getHomework().getId().toString(),
                submission.getUser() == null || submission.getUser().getId() == null
                        ? null
                        : submission.getUser().getId().toString(),
                userName,
                submission.getContent(),
                submission.getSubmittedAt(),
                submission.getStatus() == null ? null : submission.getStatus().name(),
                submission.getGrade(),
                submission.getFeedback(),
                submission.getAttachments() == null
                        ? List.of()
                        : submission.getAttachments().stream().map(this::toAttachmentDto).toList());
    }

    private HomeworkDtos.AttachmentDto toAttachmentDto(HomeworkAttachment attachment) {
        return new HomeworkDtos.AttachmentDto(
                attachment.getId() == null ? null : attachment.getId().toString(),
                attachment.getOriginalName(),
                attachment.getContentType(),
                attachment.getSize(),
                "/homework/attachments/" + attachment.getId() + "/download",
                attachment.getUploadedAt());
    }

    private HomeworkDtos.AttachmentDto toAttachmentDto(HomeworkSubmissionAttachment attachment) {
        return new HomeworkDtos.AttachmentDto(
                attachment.getId() == null ? null : attachment.getId().toString(),
                attachment.getOriginalName(),
                attachment.getContentType(),
                attachment.getSize(),
                "/homework/submissions/attachments/" + attachment.getId() + "/download",
                attachment.getUploadedAt());
    }

    private HomeworkAttachment storeHomeworkAttachment(Homework homework, MultipartFile file) {
        FileStorageService.StoredFile storedFile = fileStorageService.store("homework", file);
        HomeworkAttachment attachment = new HomeworkAttachment();
        attachment.setHomework(homework);
        attachment.setOriginalName(storedFile.originalName());
        attachment.setStoragePath(storedFile.storagePath());
        attachment.setContentType(storedFile.contentType());
        attachment.setSize(storedFile.size());
        attachment.setUploadedAt(Instant.now());
        return attachment;
    }

    private HomeworkSubmissionAttachment storeSubmissionAttachment(HomeworkSubmission submission, MultipartFile file) {
        FileStorageService.StoredFile storedFile = fileStorageService.store("submissions", file);
        HomeworkSubmissionAttachment attachment = new HomeworkSubmissionAttachment();
        attachment.setSubmission(submission);
        attachment.setOriginalName(storedFile.originalName());
        attachment.setStoragePath(storedFile.storagePath());
        attachment.setContentType(storedFile.contentType());
        attachment.setSize(storedFile.size());
        attachment.setUploadedAt(Instant.now());
        return attachment;
    }

    private boolean hasMeaningfulText(String content) {
        if (content == null) {
            return false;
        }
        String stripped = content.replaceAll("<[^>]*>", "").trim();
        return !stripped.isEmpty();
    }

    public record FileDownload(java.nio.file.Path path, String contentType, String originalName) {
    }
}
