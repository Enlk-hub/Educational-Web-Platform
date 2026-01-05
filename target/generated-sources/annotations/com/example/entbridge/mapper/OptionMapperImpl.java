package com.example.entbridge.mapper;

import com.example.entbridge.dto.OptionDto;
import com.example.entbridge.entity.Option;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-06T02:25:08+0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class OptionMapperImpl implements OptionMapper {

    @Override
    public OptionDto toDto(Option option) {
        if ( option == null ) {
            return null;
        }

        String id = null;
        String text = null;

        id = map( option.getId() );
        text = option.getText();

        OptionDto optionDto = new OptionDto( id, text );

        return optionDto;
    }
}
