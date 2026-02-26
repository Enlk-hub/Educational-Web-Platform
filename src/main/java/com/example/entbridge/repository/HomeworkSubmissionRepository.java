package com.example.entbridge.repository;

import com.example.entbridge.entity.Homework;
import com.example.entbridge.entity.HomeworkSubmission;
import com.example.entbridge.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, Long> {
    @EntityGraph(attributePaths = { "homework", "user" })
    List<HomeworkSubmission> findByUser(User user);

    @EntityGraph(attributePaths = { "homework", "user" })
    List<HomeworkSubmission> findByHomeworkIn(List<Homework> homework);

    Optional<HomeworkSubmission> findByHomeworkAndUser(Homework homework, User user);

    long countByReviewedBy(User admin);
}
