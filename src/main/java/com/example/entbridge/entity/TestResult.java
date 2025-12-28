package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "test_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    private Integer score;

    @Column(name = "max_score")
    private Integer maxScore;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "correct_answers")
    private Integer correctAnswers;

    @Column(name = "completed_at")
    private Instant completedAt = Instant.now();
}
