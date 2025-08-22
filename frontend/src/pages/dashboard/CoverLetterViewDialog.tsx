import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CoverLetterViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coverLetter: {
    roleName?: string;
    companyName?: string;
    jobDescription: string;
    generatedText: string;
    createdAt?: { _seconds: number };
  } | null;
}

export default function CoverLetterViewDialog({ open, onOpenChange, coverLetter }: CoverLetterViewDialogProps) {
  if (!coverLetter) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {coverLetter.roleName || "Untitled Role"} @ {coverLetter.companyName || "Unknown Company"}
          </DialogTitle>
          <div className="text-xs text-gray-500">
            {coverLetter.createdAt ? new Date(coverLetter.createdAt._seconds * 1000).toLocaleString() : ""}
          </div>
        </DialogHeader>
        <div className="mb-2 font-semibold">Job Description:</div>
        <div className="mb-4 text-sm text-gray-700 whitespace-pre-line">{coverLetter.jobDescription}</div>
        <div className="mb-2 font-semibold">Cover Letter:</div>
        <div className="text-base text-gray-900 whitespace-pre-line border rounded p-3 bg-gray-50 max-h-96 overflow-auto">
          {coverLetter.generatedText}
        </div>
      </DialogContent>
    </Dialog>
  );
}
