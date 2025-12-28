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

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
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
        Subject subject = subjectRepository.findByCode(request.subjectId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Предмет не найден"));
        List<Question> questions = questionRepository.findBySubject_CodeOrderByIdAsc(subject.getCode());
        if (questions.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NO_QUESTIONS", "В этом предмете нет вопросов");
        }

        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        int correctAnswers = 0;
        for (TestDtos.Answer answer : request.answers()) {
            Long questionId = parseId(answer.questionId(), "QUESTION_ID_INVALID");
            if (answer.selectedOptionId() == null || answer.selectedOptionId().isBlank()) {
                continue;
            }
            Long optionId = parseId(answer.selectedOptionId(), "OPTION_ID_INVALID");
            Question question = questionMap.get(questionId);
            if (question == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "QUESTION_NOT_FOUND", "Вопрос не найден в выбранном предмете");
            }
            Option option = optionRepository.findById(optionId)
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "OPTION_NOT_FOUND", "Вариант ответа не найден"));
            if (!option.getQuestion().getId().equals(questionId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "OPTION_MISMATCH", "Ответ не соответствует вопросу");
            }
            if (Boolean.TRUE.equals(option.getIsCorrect())) {
                correctAnswers++;
            }
        }

        int totalQuestions = questions.size();
        int maxScore = subject.getMaxScore() == null ? totalQuestions : subject.getMaxScore();
        // Масштабируем результат под максимальный балл предмета.
        int score = (int) Math.round((double) correctAnswers * maxScore / totalQuestions);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));

        TestResult tr = new TestResult();
        tr.setUser(user);
        tr.setSubject(subject);
        tr.setScore(score);
        tr.setMaxScore(maxScore);
        tr.setTotalQuestions(totalQuestions);
        tr.setCorrectAnswers(correctAnswers);
        testResultRepository.save(tr);

        // update user stats
        int totalScore = (user.getTotalScore() == null ? 0 : user.getTotalScore()) + score;
        user.setTotalScore(totalScore);
        List<TestResult> results = testResultRepository.findByUser(user);
        double avg = results.stream().mapToInt(TestResult::getScore).average().orElse(0.0);
        user.setAverageScore(avg);
        userRepository.save(user);

        return testResultMapper.toDto(tr);
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
