package com.example.entbridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "homework")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Homework {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assigned_by")
    private String assignedBy;

    @OneToMany(mappedBy = "homework", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HomeworkSubmission> submissions = new ArrayList<>();
}
