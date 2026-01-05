package com.example.entbridge.mapper;

import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.entity.Homework;
import com.example.entbridge.entity.Subject;
import java.time.LocalDate;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-06T02:27:38+0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class HomeworkMapperImpl implements HomeworkMapper {

    @Override
    public HomeworkDtos.HomeworkDto toDto(Homework homework) {
        if ( homework == null ) {
            return null;
        }

        String subjectId = null;
        String id = null;
        String title = null;
        String description = null;
        LocalDate dueDate = null;
        String assignedBy = null;

        subjectId = homeworkSubjectCode( homework );
        id = map( homework.getId() );
        title = homework.getTitle();
        description = homework.getDescription();
        dueDate = homework.getDueDate();
        assignedBy = homework.getAssignedBy();

        List<HomeworkDtos.SubmissionDto> submissions = java.util.List.of();
        List<HomeworkDtos.AttachmentDto> attachments = java.util.List.of();

        HomeworkDtos.HomeworkDto homeworkDto = new HomeworkDtos.HomeworkDto( id, title, description, subjectId, dueDate, assignedBy, submissions, attachments );

        return homeworkDto;
    }

    private String homeworkSubjectCode(Homework homework) {
        if ( homework == null ) {
            return null;
        }
        Subject subject = homework.getSubject();
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
