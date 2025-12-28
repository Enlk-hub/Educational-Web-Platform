package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String title;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "is_mandatory")
    private boolean mandatory;

    private String category;

    @Column(name = "max_score")
    private Integer maxScore;
}
