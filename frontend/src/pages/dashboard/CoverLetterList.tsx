import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Loader, FileText, Mail, Download, Trash2 } from "lucide-react";
import { downloadTextFile } from "@/lib/downloadTextFile";
import { toast } from "sonner";

interface CoverLetterListProps {
  onDelete?: (id: string) => void;
}

const handleDownload = (cl: CoverLetter) => {
  const filename = `${cl.roleName || "CoverLetter"}_${cl.companyName || "Company"}.txt`;
  downloadTextFile(filename, cl.generatedText);
};
import CoverLetterViewDialog from "./CoverLetterViewDialog";

interface CoverLetter {
  id: string;
  jobDescription: string;
  companyName?: string;
  roleName?: string;
  template?: string;
  generatedText: string;
  createdAt?: { _seconds: number };
}

const CoverLetterList = ({ onDelete }: CoverLetterListProps) => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<CoverLetter | null>(null);

  useEffect(() => {
    apiClient.get("/cover-letter").then(res => {
      setCoverLetters(res.data.coverLetters || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    let deleted = false;
    try {
      await apiClient.delete(`/cover-letter/${id}`);
      deleted = true;
    } catch (e: any) {
      if (e?.response?.status === 404) {
        deleted = true;
      }
    }
    setCoverLetters(prev => prev.filter(cl => cl.id !== id));
    if (onDelete) onDelete(id);
    if (deleted) {
      toast.success('Cover letter deleted', { duration: 2000 });
    } else {
      toast.error('Failed to delete cover letter', { duration: 2000 });
    }
  };

  if (loading) return <div className="flex items-center gap-2"><Loader className="animate-spin" /> Loading cover letters...</div>;
  if (coverLetters.length === 0) return <div className="text-gray-500">No cover letters found.</div>;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {coverLetters.map(cl => (
          <Card key={cl.id} className="overflow-hidden hover:shadow-md transition-shadow border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-4 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-emerald-500" />
                  {cl.roleName || "Untitled Role"} @ {cl.companyName || "Unknown Company"}
                </CardTitle>
                <div className="text-xs text-gray-500">{cl.createdAt ? new Date(cl.createdAt._seconds * 1000).toLocaleString() : ""}</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(cl)}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(cl.id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2 font-semibold">Job Description:</div>
              <div className="mb-2 text-sm text-gray-700 line-clamp-3">{cl.jobDescription}</div>
              <div className="mb-2 font-semibold">Cover Letter:</div>
              <div className="text-sm text-gray-800 whitespace-pre-line line-clamp-6">{cl.generatedText}</div>
            </CardContent>
            <CardFooter className="flex justify-end border-t p-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => { setSelected(cl); setViewOpen(true); }}>
                <FileText className="mr-2 h-4 w-4" /> View
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <CoverLetterViewDialog open={viewOpen} onOpenChange={setViewOpen} coverLetter={selected} />
    </>
  );
};

export default CoverLetterList;
