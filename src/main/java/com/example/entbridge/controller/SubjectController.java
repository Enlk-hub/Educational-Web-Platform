package com.example.entbridge.controller;

import com.example.entbridge.dto.SubjectDto;
import com.example.entbridge.mapper.SubjectMapper;
import com.example.entbridge.repository.SubjectRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/subjects")
public class SubjectController {
    private final SubjectRepository subjectRepository;
    private final SubjectMapper mapper;

    public SubjectController(SubjectRepository subjectRepository, SubjectMapper mapper) {
        this.subjectRepository = subjectRepository;
        this.mapper = mapper;
    }

    @GetMapping
    public List<SubjectDto> list() {
        return subjectRepository.findAll(Sort.by("id")).stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/search")
    public List<SubjectDto> search(@org.springframework.web.bind.annotation.RequestParam String query) {
        return subjectRepository.findByNameContainingIgnoreCase(query).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}
