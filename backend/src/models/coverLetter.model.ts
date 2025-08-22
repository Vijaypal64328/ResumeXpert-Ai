export interface CoverLetter {
  id?: string;
  userId: string;
  resumeId: string;
  jobDescription: string;
  companyName?: string;
  roleName?: string;
  template?: string;
  generatedText: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
