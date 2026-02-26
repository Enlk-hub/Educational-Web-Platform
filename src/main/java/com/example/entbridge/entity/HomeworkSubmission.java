package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "homework_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HomeworkSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homework_id")
    private Homework homework;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    private HomeworkSubmissionStatus status = HomeworkSubmissionStatus.SUBMITTED;

    @Column(columnDefinition = "text")
    private String feedback;

    private Integer grade;

    @Column(name = "submitted_at")
    private Instant submittedAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<HomeworkSubmissionAttachment> attachments = new java.util.ArrayList<>();
}
