package com.example.entbridge.service;

import com.example.entbridge.dto.AuthDtos;
import com.example.entbridge.entity.User;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.mapper.UserMapper;
import com.example.entbridge.repository.UserRepository;
import com.example.entbridge.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

@Service
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    public AuthDtos.AuthResponse login(String usernameOrEmail, String password) {
        log.info("Login attempt for user: {}", usernameOrEmail);
        User user = userRepository
                .findByEmailIgnoreCaseOrUsernameIgnoreCase(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> {
                    log.warn("Login failed: user {} not found", usernameOrEmail);
                    return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Неверный логин или пароль");
                });
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Login failed: incorrect password for user {}", usernameOrEmail);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Неверный логин или пароль");
        }

        log.info("User {} logged in successfully", user.getUsername());
        String token = jwtUtil.generateToken(user);
        return new AuthDtos.AuthResponse(token, userMapper.toAuthDto(user));
    }

    public AuthDtos.AuthResponse register(String fullName, String email, String username, String password) {
        log.info("Registration attempt for email: {}, username: {}", email, username);
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            log.warn("Registration failed: email {} already taken", email);
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMAIL_TAKEN", "Пользователь с таким email уже существует");
        }
        if (userRepository.findByUsernameIgnoreCase(username).isPresent()) {
            log.warn("Registration failed: username {} already taken", username);
            throw new ApiException(HttpStatus.BAD_REQUEST, "USERNAME_TAKEN",
                    "Пользователь с таким именем уже существует");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(User.Role.STUDENT);
        userRepository.save(user);

        log.info("User {} registered successfully", username);
        String token = jwtUtil.generateToken(user);
        return new AuthDtos.AuthResponse(token, userMapper.toAuthDto(user));
    }
}
