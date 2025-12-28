package com.example.entbridge.mapper;

import com.example.entbridge.dto.SubjectDto;
import com.example.entbridge.entity.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubjectMapper {
    @Mapping(source = "code", target = "id")
    @Mapping(source = "title", target = "name")
    @Mapping(source = "mandatory", target = "isMandatory")
    SubjectDto toDto(Subject subject);
}
