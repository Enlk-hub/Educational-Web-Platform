package com.example.entbridge.mapper;

import com.example.entbridge.dto.VideoLessonDto;
import com.example.entbridge.entity.Subject;
import com.example.entbridge.entity.VideoLesson;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-29T01:25:32+0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class VideoLessonMapperImpl implements VideoLessonMapper {

    @Override
    public VideoLessonDto toDto(VideoLesson lesson) {
        if ( lesson == null ) {
            return null;
        }

        String subjectId = null;
        String id = null;
        String title = null;
        String youtubeUrl = null;
        String thumbnail = null;
        String duration = null;
        String description = null;

        subjectId = lessonSubjectCode( lesson );
        id = map( lesson.getId() );
        title = lesson.getTitle();
        youtubeUrl = lesson.getYoutubeUrl();
        thumbnail = lesson.getThumbnail();
        duration = lesson.getDuration();
        description = lesson.getDescription();

        VideoLessonDto videoLessonDto = new VideoLessonDto( id, title, subjectId, youtubeUrl, thumbnail, duration, description );

        return videoLessonDto;
    }

    private String lessonSubjectCode(VideoLesson videoLesson) {
        if ( videoLesson == null ) {
            return null;
        }
        Subject subject = videoLesson.getSubject();
        if ( subject == null ) {
            return null;
        }
        String code = subject.getCode();
        if ( code == null ) {
            return null;
        }
        return code;
    }
}
