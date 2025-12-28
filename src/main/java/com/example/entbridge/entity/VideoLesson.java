package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "video_lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VideoLesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(name = "youtube_url")
    private String youtubeUrl;

    private String thumbnail;

    private String duration;

    @Column(columnDefinition = "text")
    private String description;
}
