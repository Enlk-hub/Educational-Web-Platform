package com.example.entbridge.service;

import com.example.entbridge.dto.VideoLessonDto;
import com.example.entbridge.mapper.VideoLessonMapper;
import com.example.entbridge.repository.VideoLessonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VideoService {
    private final VideoLessonRepository videoLessonRepository;
    private final VideoLessonMapper videoLessonMapper;

    public VideoService(VideoLessonRepository videoLessonRepository, VideoLessonMapper videoLessonMapper) {
        this.videoLessonRepository = videoLessonRepository;
        this.videoLessonMapper = videoLessonMapper;
    }

    @Transactional(readOnly = true)
    public List<VideoLessonDto> list(String subjectCode) {
        if (subjectCode == null || subjectCode.isBlank()) {
            return videoLessonRepository.findAll().stream()
                    .map(videoLessonMapper::toDto)
                    .toList();
        }
        return videoLessonRepository.findBySubject_Code(subjectCode).stream()
                .map(videoLessonMapper::toDto)
                .toList();
    }
}
