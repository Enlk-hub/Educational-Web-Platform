package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "text")
    private String text;

    private Integer points;

    @Column(columnDefinition = "text")
    private String explanation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    @OrderBy("id")
    private List<Option> options = new java.util.ArrayList<>();
}
