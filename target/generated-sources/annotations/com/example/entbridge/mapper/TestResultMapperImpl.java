package com.example.entbridge.mapper;

import com.example.entbridge.dto.TestDtos;
import com.example.entbridge.entity.Subject;
import com.example.entbridge.entity.TestResult;
import com.example.entbridge.entity.User;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-06T02:25:08+0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class TestResultMapperImpl implements TestResultMapper {

    @Override
    public TestDtos.ResultDto toDto(TestResult result) {
        if ( result == null ) {
            return null;
        }

        String userId = null;
        String subjectId = null;
        String subjectName = null;
        Instant date = null;
        String id = null;
        Integer score = null;
        Integer maxScore = null;
        Integer totalQuestions = null;
        Integer correctAnswers = null;

        userId = map( resultUserId( result ) );
        subjectId = resultSubjectCode( result );
        subjectName = resultSubjectTitle( result );
        date = result.getCompletedAt();
        id = map( result.getId() );
        score = result.getScore();
        maxScore = result.getMaxScore();
        totalQuestions = result.getTotalQuestions();
        correctAnswers = result.getCorrectAnswers();

        TestDtos.ResultDto resultDto = new TestDtos.ResultDto( id, userId, subjectId, subjectName, score, maxScore, totalQuestions, correctAnswers, date );

        return resultDto;
    }

    private Long resultUserId(TestResult testResult) {
        if ( testResult == null ) {
            return null;
        }
        User user = testResult.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String resultSubjectCode(TestResult testResult) {
        if ( testResult == null ) {
            return null;
        }
        Subject subject = testResult.getSubject();
        if ( subject == null ) {
            return null;
        }
        String code = subject.getCode();
        if ( code == null ) {
            return null;
        }
        return code;
    }

    private String resultSubjectTitle(TestResult testResult) {
        if ( testResult == null ) {
            return null;
        }
        Subject subject = testResult.getSubject();
        if ( subject == null ) {
            return null;
        }
        String title = subject.getTitle();
        if ( title == null ) {
            return null;
        }
        return title;
    }
}
