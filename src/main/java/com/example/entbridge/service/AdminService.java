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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}
