package com.example.entbridge.repository;

import com.example.entbridge.entity.Homework;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    @SuppressWarnings("null")
    @Override
    @EntityGraph(attributePaths = { "subject" })
    List<Homework> findAll();

    @SuppressWarnings("null")
    @Override
    @EntityGraph(attributePaths = { "subject" })
    Optional<Homework> findById(Long id);
}
