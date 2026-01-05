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

    public AdminService(UserRepository userRepository,
                        TestResultRepository testResultRepository,
                        SubjectRepository subjectRepository,
                        QuestionRepository questionRepository,
                        OptionRepository optionRepository,
                        UserMapper userMapper,
                        TestResultMapper testResultMapper,
                        HomeworkService homeworkService) {
        this.userRepository = userRepository;
        this.testResultRepository = testResultRepository;
        this.subjectRepository = subjectRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.userMapper = userMapper;
        this.testResultMapper = testResultMapper;
        this.homeworkService = homeworkService;
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

    public HomeworkDtos.SubmissionDto reviewSubmission(Long submissionId, HomeworkDtos.ReviewSubmissionRequest request) {
        return homeworkService.review(submissionId, request);
    }

    public HomeworkDtos.HomeworkDto addHomeworkAttachments(Long homeworkId, List<MultipartFile> files) {
        return homeworkService.addHomeworkAttachments(homeworkId, files);
    }

    @Transactional
    public Subject createSubject(AdminDtos.CreateSubjectRequest request) {
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
        return subjectRepository.save(subject);
    }

    @Transactional
    public Question createQuestion(AdminDtos.CreateQuestionRequest request) {
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
        questionRepository.save(question);

        List<Option> options = request.options().stream().map(opt -> {
            Option option = new Option();
            option.setQuestion(question);
            option.setText(opt.text());
            option.setIsCorrect(opt.isCorrect());
            return option;
        }).toList();
        optionRepository.saveAll(options);
        return question;
    }

    @Transactional
    public AdminDtos.ImportQuestionsResponse importQuestions(String subjectId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_EMPTY", "Файл пустой");
        }
        Subject subject = subjectRepository.findByCode(subjectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));
        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();
            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                String questionText = cellValue(row.getCell(1));
                if (questionText == null || questionText.isBlank()) {
                    continue;
                }
                String explanation = cellValue(row.getCell(6));
                List<AdminDtos.QuestionOptionRequest> options = new ArrayList<>();
                for (int col = 2; col <= 5; col++) {
                    String answer = cellValue(row.getCell(col));
                    if (answer == null || answer.isBlank()) {
                        continue;
                    }
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
}
