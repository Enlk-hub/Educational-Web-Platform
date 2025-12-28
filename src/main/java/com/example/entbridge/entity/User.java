package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "average_score")
    private Double averageScore = 0.0;

    @Column(name = "total_score")
    private Integer totalScore = 0;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public enum Role { STUDENT, ADMIN }
}
