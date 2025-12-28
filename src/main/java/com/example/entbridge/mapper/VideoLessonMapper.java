package com.example.entbridge.mapper;

import com.example.entbridge.dto.VideoLessonDto;
import com.example.entbridge.entity.VideoLesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VideoLessonMapper {
    @Mapping(source = "subject.code", target = "subjectId")
    VideoLessonDto toDto(VideoLesson lesson);

    default String map(Long value) {
        return value == null ? null : value.toString();
    }
}
