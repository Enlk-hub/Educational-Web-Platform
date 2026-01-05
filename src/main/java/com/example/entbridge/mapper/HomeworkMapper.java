package com.example.entbridge.mapper;

import com.example.entbridge.dto.HomeworkDtos;
import com.example.entbridge.entity.Homework;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HomeworkMapper {
    @Mapping(source = "subject.code", target = "subjectId")
    @Mapping(target = "submissions", expression = "java(java.util.List.of())")
    @Mapping(target = "attachments", expression = "java(java.util.List.of())")
    HomeworkDtos.HomeworkDto toDto(Homework homework);

    default String map(Long value) {
        return value == null ? null : value.toString();
    }
}
