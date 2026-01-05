package com.example.entbridge.mapper;

import com.example.entbridge.dto.OptionDto;
import com.example.entbridge.dto.QuestionDto;
import com.example.entbridge.entity.Option;
import com.example.entbridge.entity.Question;
import com.example.entbridge.entity.Subject;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-06T02:25:08+0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class QuestionMapperImpl implements QuestionMapper {

    @Autowired
    private OptionMapper optionMapper;

    @Override
    public QuestionDto toDto(Question question) {
        if ( question == null ) {
            return null;
        }

        String subjectId = null;
        String question1 = null;
        String id = null;
        List<OptionDto> options = null;

        subjectId = questionSubjectCode( question );
        question1 = question.getText();
        id = optionMapper.map( question.getId() );
        options = optionListToOptionDtoList( question.getOptions() );

        QuestionDto questionDto = new QuestionDto( id, subjectId, question1, options );

        return questionDto;
    }

    private String questionSubjectCode(Question question) {
        if ( question == null ) {
            return null;
        }
        Subject subject = question.getSubject();
        if ( subject == null ) {
            return null;
        }
        String code = subject.getCode();
        if ( code == null ) {
            return null;
        }
        return code;
    }

    protected List<OptionDto> optionListToOptionDtoList(List<Option> list) {
        if ( list == null ) {
            return null;
        }

        List<OptionDto> list1 = new ArrayList<OptionDto>( list.size() );
        for ( Option option : list ) {
            list1.add( optionMapper.toDto( option ) );
        }

        return list1;
    }
}
