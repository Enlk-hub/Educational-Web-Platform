package com.example.entbridge.mapper;

import com.example.entbridge.dto.QuestionDto;
import com.example.entbridge.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = OptionMapper.class)
public interface QuestionMapper {
    @Mapping(source = "subject.code", target = "subjectId")
    @Mapping(source = "text", target = "question")
    QuestionDto toDto(Question question);
}
