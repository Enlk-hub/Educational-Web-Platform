package com.example.entbridge.service;

import com.example.entbridge.dto.QuestionDto;
import com.example.entbridge.dto.TestDtos;
import com.example.entbridge.entity.*;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.mapper.QuestionMapper;
import com.example.entbridge.mapper.TestResultMapper;
import com.example.entbridge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TestService {
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final TestResultRepository testResultRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TestResultMapper testResultMapper;
    private final QuestionMapper questionMapper;

    public TestService(QuestionRepository questionRepository,
            OptionRepository optionRepository,
            TestResultRepository testResultRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            TestResultMapper testResultMapper,
            QuestionMapper questionMapper) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.testResultRepository = testResultRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.testResultMapper = testResultMapper;
        this.questionMapper = questionMapper;
    }

    @Transactional
    public TestDtos.ResultDto submit(Long userId, TestDtos.SubmitRequest request) {
        log.info("Test submission attempt by user {} for subject code {}", userId, request.subjectId());
        Subject subject = subjectRepository.findByCode(request.subjectId())
                .orElseThrow(() -> {
                    log.error("Test submission failed: subject with code {} not found", request.subjectId());
                    return new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден");
                });
        List<Question> questions = questionRepository.findBySubject_CodeOrderByIdAsc(subject.getCode());
        if (questions.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NO_QUESTIONS", "В этом предмете нет вопросов");
        }

        questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        Map<String, String> userAnswers = request.answers().stream()
                .filter(a -> a.selectedOptionId() != null && !a.selectedOptionId().isBlank())
                .collect(Collectors.toMap(TestDtos.Answer::questionId, TestDtos.Answer::selectedOptionId,
                        (a1, a2) -> a1));

        int correctAnswers = 0;
        List<TestDtos.AnswerResultDto> evaluatedAnswers = new java.util.ArrayList<>();

        for (Question question : questions) {
            String qId = question.getId().toString();
            String selectedOptId = userAnswers.get(qId);
            boolean isCorrect = false;

            String correctOptId = question.getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .map(o -> o.getId().toString())
                    .findFirst().orElse(null);

            if (selectedOptId != null && selectedOptId.equals(correctOptId)) {
                isCorrect = true;
                correctAnswers++;
            }
            evaluatedAnswers.add(new TestDtos.AnswerResultDto(qId, selectedOptId, isCorrect, correctOptId));
        }

        int totalQuestions = questions.size();
        int maxScore = subject.getMaxScore() == null ? totalQuestions : subject.getMaxScore();
        // Масштабируем результат под максимальный балл предмета.
        int score = (int) Math.round((double) correctAnswers * maxScore / totalQuestions);

        @SuppressWarnings("null")
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));

        TestResult tr = new TestResult();
        tr.setUser(user);
        tr.setSubject(subject);
        tr.setScore(score);
        tr.setMaxScore(maxScore);
        tr.setTotalQuestions(totalQuestions);
        tr.setCorrectAnswers(correctAnswers);
        tr = testResultRepository.save(tr);

        // update user stats
        int totalScore = (user.getTotalScore() == null ? 0 : user.getTotalScore()) + score;
        user.setTotalScore(totalScore);
        List<TestResult> results = testResultRepository.findByUser(user);
        double avg = results.stream().mapToInt(TestResult::getScore).average().orElse(0.0);
        user.setAverageScore(avg);
        userRepository.save(user);

        log.info("Test submitted successfully by user {}. Score: {}/{}", userId, score, maxScore);

        TestDtos.ResultDto dto = testResultMapper.toDto(tr);
        return new TestDtos.ResultDto(
                dto.id(), dto.userId(), dto.subjectId(), dto.subjectName(),
                dto.score(), dto.maxScore(), dto.totalQuestions(), dto.correctAnswers(), dto.date(),
                evaluatedAnswers);
    }

    public List<QuestionDto> questions(String subjectCode) {
        Subject subject = subjectRepository.findByCode(subjectCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));
        return questionRepository.findBySubject_CodeOrderByIdAsc(subject.getCode()).stream()
                .map(questionMapper::toDto)
                .collect(Collectors.toList());
    }

    private Long parseId(String value, String errorCode) {
        if (value == null || value.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, errorCode, "Некорректный идентификатор");
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, errorCode, "Некорректный идентификатор");
        }
    }
}
