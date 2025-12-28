package com.example.entbridge.mapper;

import com.example.entbridge.dto.OptionDto;
import com.example.entbridge.entity.Option;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OptionMapper {
    OptionDto toDto(Option option);

    default String map(Long value) {
        return value == null ? null : value.toString();
    }
}
