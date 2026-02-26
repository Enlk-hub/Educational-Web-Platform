package com.example.entbridge.repository;

import com.example.entbridge.entity.Question;
import com.example.entbridge.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @EntityGraph(attributePaths = { "options", "subject" })
    List<Question> findBySubject_CodeOrderByIdAsc(String code);

    long countByCreatedBy(User admin);
}
