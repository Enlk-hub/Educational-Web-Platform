package com.example.entbridge.service;

import com.example.entbridge.exception.ApiException;
import com.example.entbridge.repository.QuestionRepository;
import com.example.entbridge.repository.SubjectRepository;
import com.example.entbridge.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TestService testService;

    @Test
    void questions_ShouldThrowException_WhenSubjectNotFound() {
        // Arrange
        String subjectCode = "NONEXISTENT";
        when(subjectRepository.findByCode(subjectCode)).thenReturn(Optional.empty());

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> testService.questions(subjectCode));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertEquals("SUBJECT_NOT_FOUND", exception.getError());
    }
}
