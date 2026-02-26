package com.example.entbridge.security;

import com.example.entbridge.entity.User;
import com.example.entbridge.repository.UserRepository;
import com.example.entbridge.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Basic check for required attributes
        if (email == null) {
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=oauth_email_missing");
            return;
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> registerNewUser(email, name));

        String token = jwtUtil.generateToken(user);

        String builtUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .queryParam("token", token)
                .build().toUriString();

        String targetUrl = builtUrl != null ? builtUrl : frontendUrl;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private User registerNewUser(String email, String name) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(name != null ? name : "Google User");
        // Generate a random username base from email
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        while (userRepository.findByUsernameIgnoreCase(username).isPresent()) {
            username = baseUsername + counter++;
        }
        user.setUsername(username);
        user.setRole(User.Role.STUDENT);
        // Set a random password since they use Google auth
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        return userRepository.save(user);
    }
}
