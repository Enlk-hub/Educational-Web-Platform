package com.example.entbridge.repository;

import com.example.entbridge.entity.VideoLesson;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideoLessonRepository extends JpaRepository<VideoLesson, Long> {
    @Override
    @EntityGraph(attributePaths = {"subject"})
    List<VideoLesson> findAll();

    @EntityGraph(attributePaths = {"subject"})
    List<VideoLesson> findBySubject_Code(String code);
}
