package com.example.entbridge.service;

import com.example.entbridge.entity.User;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.mapper.TestResultMapper;
import com.example.entbridge.repository.TestResultRepository;
import com.example.entbridge.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    private final UserRepository userRepository;
    private final TestResultRepository testResultRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final TestResultMapper testResultMapper;

    public ProfileService(UserRepository userRepository,
                          TestResultRepository testResultRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          TestResultMapper testResultMapper) {
        this.userRepository = userRepository;
        this.testResultRepository = testResultRepository;
        this.passwordEncoder = passwordEncoder;
        this.testResultMapper = testResultMapper;
    }

    @Transactional(readOnly = true)
    public Page<com.example.entbridge.dto.TestDtos.ResultDto> history(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        return testResultRepository.findByUser(user, pageable).map(testResultMapper::toDto);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Неверный старый пароль");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User updateProfile(Long userId, String name, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
        if (!user.getEmail().equalsIgnoreCase(email)
                && userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMAIL_TAKEN", "Пользователь с таким email уже существует");
        }
        user.setFullName(name);
        user.setEmail(email);
        userRepository.save(user);
        return user;
    }

    public User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Пользователь не найден"));
    }
}
