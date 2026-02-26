package com.example.entbridge.service;

import com.example.entbridge.dto.AdminDtos;
import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.dto.TestDtos;
import com.example.entbridge.entity.Option;
import com.example.entbridge.entity.Question;
import com.example.entbridge.entity.Subject;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.mapper.TestResultMapper;
import com.example.entbridge.mapper.UserMapper;
import com.example.entbridge.repository.OptionRepository;
import com.example.entbridge.repository.QuestionRepository;
import com.example.entbridge.repository.SubjectRepository;
import com.example.entbridge.repository.TestResultRepository;
import com.example.entbridge.repository.UserRepository;
import com.example.entbridge.entity.User;
import com.example.entbridge.entity.VideoLesson;
import com.example.entbridge.mapper.VideoLessonMapper;
import com.example.entbridge.repository.VideoLessonRepository;
import com.example.entbridge.dto.VideoLessonDto;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.ArrayList;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final TestResultRepository testResultRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final UserMapper userMapper;
    private final TestResultMapper testResultMapper;
    private final HomeworkService homeworkService;
    private final com.example.entbridge.repository.AuditLogRepository auditLogRepository;
    private final VideoLessonRepository videoLessonRepository;
    private final VideoLessonMapper videoLessonMapper;

    public AdminService(UserRepository userRepository,
            TestResultRepository testResultRepository,
            SubjectRepository subjectRepository,
            QuestionRepository questionRepository,
            OptionRepository optionRepository,
            UserMapper userMapper,
            TestResultMapper testResultMapper,
            HomeworkService homeworkService,
            com.example.entbridge.repository.AuditLogRepository auditLogRepository,
            VideoLessonRepository videoLessonRepository,
            VideoLessonMapper videoLessonMapper) {
        this.userRepository = userRepository;
        this.testResultRepository = testResultRepository;
        this.subjectRepository = subjectRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.userMapper = userMapper;
        this.testResultMapper = testResultMapper;
        this.homeworkService = homeworkService;
        this.auditLogRepository = auditLogRepository;
        this.videoLessonRepository = videoLessonRepository;
        this.videoLessonMapper = videoLessonMapper;
    }

    private void logAction(Long adminId, String action, String entityType, Long entityId, String details) {
        if (adminId == null)
            return;
        User admin = userRepository.findById(adminId).orElse(null);
        if (admin != null) {
            com.example.entbridge.entity.AuditLog log = new com.example.entbridge.entity.AuditLog();
            log.setAdmin(admin);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setDetails(details);
            auditLogRepository.save(log);
        }
    }

    public List<AdminDtos.UserSummaryDto> listUsers() {
        return userRepository.findAll().stream().map(userMapper::toSummary).toList();
    }

    public List<TestDtos.ResultDto> listResults() {
        return testResultRepository.findAllByOrderByCompletedAtDesc().stream()
                .map(testResultMapper::toDto)
                .toList();
    }

    public List<HomeworkDtos.HomeworkDto> listHomework() {
        return homeworkService.listForAdmin();
    }

    public HomeworkDtos.HomeworkDto createHomework(Long userId, HomeworkDtos.CreateHomeworkRequest request) {
        return homeworkService.create(userId, request);
    }

    public HomeworkDtos.HomeworkDto updateHomework(Long homeworkId, HomeworkDtos.UpdateHomeworkRequest request) {
        return homeworkService.update(homeworkId, request);
    }

    public void deleteHomework(Long homeworkId) {
        homeworkService.delete(homeworkId);
    }

    public HomeworkDtos.SubmissionDto reviewSubmission(Long adminId, Long submissionId,
            HomeworkDtos.ReviewSubmissionRequest request) {
        HomeworkDtos.SubmissionDto dto = homeworkService.review(adminId, submissionId, request);
        logAction(adminId, "REVIEWED_HOMEWORK", "SUBMISSION", submissionId,
                "Status: " + request.status() + (request.grade() != null ? ", Grade: " + request.grade() : ""));
        return dto;
    }

    public HomeworkDtos.HomeworkDto addHomeworkAttachments(Long homeworkId, List<MultipartFile> files) {
        return homeworkService.addHomeworkAttachments(homeworkId, files);
    }

    @Transactional
    public Subject createSubject(Long adminId, AdminDtos.CreateSubjectRequest request) {
        if (subjectRepository.findByCode(request.code()).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "SUBJECT_EXISTS", "Предмет с таким кодом уже существует");
        }
        Subject subject = new Subject();
        subject.setCode(request.code());
        subject.setTitle(request.title());
        subject.setIconUrl(request.iconUrl());
        subject.setMandatory(request.isMandatory());
        subject.setCategory(request.category());
        subject.setMaxScore(request.maxScore());
        subject = subjectRepository.save(subject);
        logAction(adminId, "CREATED_SUBJECT", "SUBJECT", subject.getId(), "Code: " + subject.getCode());
        return subject;
    }

    @SuppressWarnings("null")
    @Transactional
    public Question createQuestion(Long adminId, AdminDtos.CreateQuestionRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        Subject subject = subjectRepository.findByCode(request.subjectId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));
        if (request.options().stream().noneMatch(AdminDtos.QuestionOptionRequest::isCorrect)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NO_CORRECT_OPTION", "Нужен хотя бы один правильный ответ");
        }
        Question question = new Question();
        question.setSubject(subject);
        question.setText(request.text());
        question.setExplanation(request.explanation());
        question.setPoints(request.points() == null ? 1 : request.points());
        question.setCreatedBy(admin);
        questionRepository.save(question);

        List<Option> options = request.options().stream().map(opt -> {
            Option option = new Option();
            option.setQuestion(question);
            option.setText(opt.text());
            option.setIsCorrect(opt.isCorrect());
            return option;
        }).toList();
        optionRepository.saveAll(options);
        logAction(adminId, "CREATED_QUESTION", "QUESTION", question.getId(), "Subject: " + subject.getCode());
        return question;
    }

    @Transactional
    public AdminDtos.ImportQuestionsResponse importQuestions(Long adminId, String subjectCode, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_EMPTY", "Файл пустой");
        }
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        Subject subject = subjectRepository.findByCode(subjectCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));

        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();
            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String questionText = cellValue(row.getCell(1));
                if (questionText == null || questionText.isBlank())
                    continue;

                String explanation = cellValue(row.getCell(6));
                List<AdminDtos.QuestionOptionRequest> options = new ArrayList<>();
                for (int col = 2; col <= 5; col++) {
                    String answer = cellValue(row.getCell(col));
                    if (answer == null || answer.isBlank())
                        continue;
                    boolean isCorrect = answer.trim().startsWith("*");
                    String text = isCorrect ? answer.trim().substring(1).trim() : answer.trim();
                    options.add(new AdminDtos.QuestionOptionRequest(text, isCorrect));
                }

                if (options.size() < 2 || options.stream().noneMatch(AdminDtos.QuestionOptionRequest::isCorrect)) {
                    skipped++;
                    errors.add("Строка " + (i + 1) + ": нужен минимум 2 варианта и 1 правильный ответ");
                    continue;
                }

                Question question = new Question();
                question.setSubject(subject);
                question.setText(questionText.trim());
                question.setExplanation(explanation == null || explanation.isBlank() ? null : explanation.trim());
                question.setPoints(1);
                question.setCreatedBy(admin);
                questionRepository.save(question);

                List<Option> optionEntities = options.stream().map(opt -> {
                    Option option = new Option();
                    option.setQuestion(question);
                    option.setText(opt.text());
                    option.setIsCorrect(opt.isCorrect());
                    return option;
                }).toList();
                optionRepository.saveAll(optionEntities);
                created++;
            }
            logAction(adminId, "IMPORT_QUESTIONS", "SUBJECT", subject.getId(), "Imported questions: " + created);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "IMPORT_FAILED", "Не удалось прочитать файл");
        }

        return new AdminDtos.ImportQuestionsResponse(created, skipped, errors);
    }

    private String cellValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                double value = cell.getNumericCellValue();
                long longValue = (long) value;
                if (value == longValue) {
                    yield Long.toString(longValue);
                }
                yield Double.toString(value);
            }
            case BOOLEAN -> Boolean.toString(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    @Transactional
    public VideoLessonDto createVideo(Long adminId, AdminDtos.CreateVideoRequest request) {
        Subject subject = subjectRepository.findByCode(request.subjectId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));

        VideoLesson video = new VideoLesson();
        video.setTitle(request.title());
        video.setSubject(subject);
        video.setYoutubeUrl(request.youtubeUrl());
        video.setDescription(request.description());
        video.setThumbnail(request.thumbnail());
        video.setDuration(request.duration());

        video = videoLessonRepository.save(video);
        logAction(adminId, "CREATED_VIDEO", "VIDEO", video.getId(), "Title: " + video.getTitle());
        return videoLessonMapper.toDto(video);
    }

    @Transactional
    public VideoLessonDto updateVideo(Long adminId, Long videoId, AdminDtos.UpdateVideoRequest request) {
        VideoLesson video = videoLessonRepository.findById(videoId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VIDEO_NOT_FOUND", "Видео не найдено"));

        if (request.title() != null)
            video.setTitle(request.title());
        if (request.youtubeUrl() != null)
            video.setYoutubeUrl(request.youtubeUrl());
        if (request.description() != null)
            video.setDescription(request.description());
        if (request.thumbnail() != null)
            video.setThumbnail(request.thumbnail());
        if (request.duration() != null)
            video.setDuration(request.duration());

        if (request.subjectId() != null) {
            Subject subject = subjectRepository.findByCode(request.subjectId())
                    .orElseThrow(
                            () -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));
            video.setSubject(subject);
        }

        video = videoLessonRepository.save(video);
        logAction(adminId, "UPDATED_VIDEO", "VIDEO", video.getId(), "Title: " + video.getTitle());
        return videoLessonMapper.toDto(video);
    }

    @Transactional
    public void deleteVideo(Long adminId, Long videoId) {
        VideoLesson video = videoLessonRepository.findById(videoId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VIDEO_NOT_FOUND", "Видео не найдено"));
        videoLessonRepository.delete(video);
        logAction(adminId, "DELETED_VIDEO", "VIDEO", videoId, "Deleted video ID: " + videoId);
    }
}
