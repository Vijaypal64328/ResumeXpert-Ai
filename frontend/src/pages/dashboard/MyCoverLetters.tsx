import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

interface CoverLetter {
  id: string;
  jobDescription: string;
  companyName?: string;
  roleName?: string;
  template?: string;
  generatedText: string;
  createdAt?: { _seconds: number };
}

const MyCoverLetters = () => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/cover-letter").then(res => {
      setCoverLetters(res.data.coverLetters || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Cover Letters</h2>
      {loading ? (
        <div className="flex items-center gap-2"><Loader className="animate-spin" /> Loading...</div>
      ) : coverLetters.length === 0 ? (
        <div>No cover letters found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coverLetters.map(cl => (
            <Card key={cl.id}>
              <CardHeader>
                <CardTitle>{cl.roleName || "Untitled Role"} @ {cl.companyName || "Unknown Company"}</CardTitle>
                <div className="text-xs text-gray-500">{cl.createdAt ? new Date(cl.createdAt._seconds * 1000).toLocaleString() : ""}</div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 font-semibold">Job Description:</div>
                <div className="mb-2 text-sm text-gray-700 line-clamp-3">{cl.jobDescription}</div>
                <div className="mb-2 font-semibold">Cover Letter:</div>
                <div className="text-sm text-gray-800 whitespace-pre-line line-clamp-6">{cl.generatedText}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoverLetters;
