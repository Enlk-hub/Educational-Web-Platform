package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "homework_submission_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HomeworkSubmissionAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private HomeworkSubmission submission;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "storage_path")
    private String storagePath;

    @Column(name = "content_type")
    private String contentType;

    private Long size;

    @Column(name = "uploaded_at")
    private Instant uploadedAt = Instant.now();
}
