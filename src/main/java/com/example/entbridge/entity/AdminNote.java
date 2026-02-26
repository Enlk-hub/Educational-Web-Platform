package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "admin_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "is_completed")
    private boolean completed = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
