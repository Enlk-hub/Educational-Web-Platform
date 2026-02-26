package com.example.entbridge.service;

import com.example.entbridge.dto.AuthDtos;
import com.example.entbridge.entity.User;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.mapper.UserMapper;
import com.example.entbridge.repository.UserRepository;
import com.example.entbridge.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        // Arrange
        String username = "testuser";
        String password = "password";
        User user = new User();
        user.setUsername(username);
        user.setPassword("encodedPassword");

        when(userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(anyString(), anyString()))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("mock-token");
        when(userMapper.toAuthDto(user)).thenReturn(mock(AuthDtos.UserDto.class));

        // Act
        AuthDtos.AuthResponse response = authService.login(username, password);

        // Assert
        assertNotNull(response);
        assertEquals("mock-token", response.token());
        verify(userRepository).findByEmailIgnoreCaseOrUsernameIgnoreCase(username, username);
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> authService.login("nonexistent", "password"));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
}
