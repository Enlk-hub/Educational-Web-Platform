package com.example.entbridge.service;

import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.entity.Homework;
import com.example.entbridge.entity.HomeworkSubmission;
import com.example.entbridge.entity.HomeworkSubmissionStatus;
import com.example.entbridge.entity.Subject;
import com.example.entbridge.entity.User;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.repository.HomeworkRepository;
import com.example.entbridge.repository.HomeworkSubmissionRepository;
import com.example.entbridge.repository.SubjectRepository;
import com.example.entbridge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public HomeworkService(HomeworkRepository homeworkRepository,
                           HomeworkSubmissionRepository submissionRepository,
                           SubjectRepository subjectRepository,
                           UserRepository userRepository) {
        this.homeworkRepository = homeworkRepository;
        this.submissionRepository = submissionRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
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

    @Transactional
    public void delete(Long homeworkId) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HOMEWORK_NOT_FOUND", "Задание не найдено"));
        homeworkRepository.delete(homework);
    }

    @Transactional
    public HomeworkDtos.SubmissionDto submit(Long userId, Long homeworkId, HomeworkDtos.SubmitHomeworkRequest request) {
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

        submission.setContent(request.content());
        submission.setStatus(HomeworkSubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(Instant.now());
        submission.setUpdatedAt(Instant.now());
        submissionRepository.save(submission);
        return toDto(submission);
    }

    @Transactional
    public HomeworkDtos.SubmissionDto review(Long submissionId, HomeworkDtos.ReviewSubmissionRequest request) {
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBMISSION_NOT_FOUND", "Работа не найдена"));
        HomeworkSubmissionStatus status = parseStatus(request.status());
        submission.setStatus(status);
        submission.setFeedback(request.feedback());
        submission.setGrade(request.grade());
        submission.setUpdatedAt(Instant.now());
        submissionRepository.save(submission);
        return toDto(submission);
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
                submissionDtos
        );
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
                submission.getFeedback()
        );
    }
}
