package com.wastesort.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/**
 * WasteSort AI — Spring Boot MVC Controller
 * Handles routing for Dashboard, Classify, History, and About pages.
 */
@Controller
public class WasteSortController {

    // In-memory history records store for academic demonstration
    private final List<ClassificationRecord> historyRecords = new ArrayList<>();

    @GetMapping({"/", "/dashboard"})
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Dashboard — WasteSort AI");
        return "dashboard";
    }

    @GetMapping("/classify")
    public String classify(Model model) {
        model.addAttribute("pageTitle", "Classify Waste — WasteSort AI");
        return "classify";
    }

    @PostMapping("/classify")
    public String handleClassification(@RequestParam("file") MultipartFile file, Model model) {
        // Phase 1 Frontend: ML model is not integrated yet.
        model.addAttribute("pageTitle", "Classify Waste — WasteSort AI");
        model.addAttribute("modelNotConnected", true);
        model.addAttribute("message", "AI classification is not connected yet. Image received: " + file.getOriginalFilename());
        return "classify";
    }

    @GetMapping("/history")
    public String history(Model model) {
        model.addAttribute("pageTitle", "Classification History — WasteSort AI");
        model.addAttribute("historyRecords", historyRecords);
        return "history";
    }

    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("pageTitle", "About — WasteSort AI");
        return "about";
    }

    /**
     * Inner DTO representing a classification history record
     */
    public static class ClassificationRecord {
        private String category;
        private String recommendedBin;
        private String disposalTip;
        private String imagePath;
        private java.time.LocalDateTime timestamp;

        public ClassificationRecord(String category, String recommendedBin, String disposalTip, String imagePath) {
            this.category = category;
            this.recommendedBin = recommendedBin;
            this.disposalTip = disposalTip;
            this.imagePath = imagePath;
            this.timestamp = java.time.LocalDateTime.now();
        }

        public String getCategory() { return category; }
        public String getRecommendedBin() { return recommendedBin; }
        public String getDisposalTip() { return disposalTip; }
        public String getImagePath() { return imagePath; }
        public java.time.LocalDateTime getTimestamp() { return timestamp; }
    }
}
