package com.example.entbridge.service;

import com.example.entbridge.dto.AuthDtos;
import com.example.entbridge.entity.User;
import com.example.entbridge.exception.ApiException;
import com.example.entbridge.mapper.UserMapper;
import com.example.entbridge.repository.UserRepository;
import com.example.entbridge.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

@Service
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
        User user = userRepository
                .findByEmailIgnoreCaseOrUsernameIgnoreCase(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Неверный логин или пароль"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Неверный логин или пароль");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthDtos.AuthResponse(token, userMapper.toAuthDto(user));
    }

    public AuthDtos.AuthResponse register(String fullName, String email, String username, String password) {
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMAIL_TAKEN", "Пользователь с таким email уже существует");
        }
        if (userRepository.findByUsernameIgnoreCase(username).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "USERNAME_TAKEN", "Пользователь с таким именем уже существует");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(User.Role.STUDENT);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return new AuthDtos.AuthResponse(token, userMapper.toAuthDto(user));
    }
}
