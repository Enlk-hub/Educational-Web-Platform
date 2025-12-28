package com.example.entbridge.mapper;

import com.example.entbridge.dto.TestDtos;
import com.example.entbridge.entity.TestResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TestResultMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "subject.code", target = "subjectId")
    @Mapping(source = "subject.title", target = "subjectName")
    @Mapping(source = "completedAt", target = "date")
    TestDtos.ResultDto toDto(TestResult result);

    default String map(Long value) {
        return value == null ? null : value.toString();
    }
}
