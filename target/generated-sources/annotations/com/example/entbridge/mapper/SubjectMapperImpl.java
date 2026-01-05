package com.example.entbridge.mapper;

import com.example.entbridge.dto.SubjectDto;
import com.example.entbridge.entity.Subject;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-06T02:25:08+0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class SubjectMapperImpl implements SubjectMapper {

    @Override
    public SubjectDto toDto(Subject subject) {
        if ( subject == null ) {
            return null;
        }

        String id = null;
        String name = null;
        boolean isMandatory = false;
        String category = null;
        Integer maxScore = null;

        id = subject.getCode();
        name = subject.getTitle();
        isMandatory = subject.isMandatory();
        category = subject.getCategory();
        maxScore = subject.getMaxScore();

        SubjectDto subjectDto = new SubjectDto( id, name, isMandatory, category, maxScore );

        return subjectDto;
    }
}
