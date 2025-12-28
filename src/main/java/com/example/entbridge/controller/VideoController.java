package com.example.entbridge.controller;

import com.example.entbridge.dto.VideoLessonDto;
import com.example.entbridge.service.VideoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
public class VideoController {
    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public List<VideoLessonDto> list(@RequestParam(value = "subjectId", required = false) String subjectId) {
        return videoService.list(subjectId);
    }
}
