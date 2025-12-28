package com.example.entbridge.util;

import com.example.entbridge.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private Long expirationMs;

    public String generateToken(User user) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .claim("role", user.getRole().name())
                .claim("username", user.getUsername())
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key)
                .compact();
    }

    public Jws<Claims> parseToken(String token) throws JwtException {
        Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }

    public Long getUserId(String token) {
        return Long.valueOf(parseToken(token).getBody().getSubject());
    }

    public String getRole(String token) {
        Object role = parseToken(token).getBody().get("role");
        return role == null ? null : role.toString();
    }

    public String getUsername(String token) {
        Object username = parseToken(token).getBody().get("username");
        return username == null ? null : username.toString();
    }
}
