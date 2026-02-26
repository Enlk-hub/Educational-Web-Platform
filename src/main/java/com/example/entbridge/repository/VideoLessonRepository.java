package com.example.entbridge.repository;

import com.example.entbridge.entity.VideoLesson;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.lang.NonNull;

public interface VideoLessonRepository extends JpaRepository<VideoLesson, Long> {
    @Override
    @EntityGraph(attributePaths = { "subject" })
    @NonNull
    List<VideoLesson> findAll();

    @EntityGraph(attributePaths = { "subject" })
    List<VideoLesson> findBySubject_Code(String code);
}
