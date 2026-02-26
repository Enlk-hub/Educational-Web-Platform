package com.example.entbridge.config;

import com.example.entbridge.security.JwtAuthenticationFilter;
import com.example.entbridge.security.RestAccessDeniedHandler;
import com.example.entbridge.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.HttpMethod;

import com.example.entbridge.security.OAuth2LoginSuccessHandler;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final RestAuthenticationEntryPoint authenticationEntryPoint;
        private final RestAccessDeniedHandler accessDeniedHandler;
        private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                        RestAuthenticationEntryPoint authenticationEntryPoint,
                        RestAccessDeniedHandler accessDeniedHandler,
                        OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.authenticationEntryPoint = authenticationEntryPoint;
                this.accessDeniedHandler = accessDeniedHandler;
                this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http,
                        CorsConfigurationSource corsConfigurationSource) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(authenticationEntryPoint)
                                                .accessDeniedHandler(accessDeniedHandler))
                                // ВАЖНО: сначала CORS (чтобы OPTIONS/preflight проходил нормально)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .authorizeHttpRequests(auth -> auth
                                                // preflight запросы
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                // auth + swagger
                                                .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**")
                                                .permitAll()
                                                // публичные ресурсы
                                                .requestMatchers("/api/v1/subjects/**", "/api/v1/videos/**").permitAll()
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oAuth2LoginSuccessHandler))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
