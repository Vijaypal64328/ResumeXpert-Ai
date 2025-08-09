// src/pages/ResumeBuilder.jsx
import React, { useState, useEffect } from "react";
import Split from "react-split";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Steps
import Step1_BasicInfo from "../components/resumeBuilder/Step1_BasicInfo";
import Step2_Education from "../components/resumeBuilder/Step2_Education";
import Step3_Experience from "../components/resumeBuilder/Step3_Experience";
import Step4_Projects from "../components/resumeBuilder/Step4_Projects";
import Step5_Skills from "../components/resumeBuilder/Step5_Skills";
import Step6_Achievements from "../components/resumeBuilder/Step6_Achievements";
import Step7_Positions from "../components/resumeBuilder/Step7_Positions";

// Templates
import TemplateClassic from "../components/resumeTemplates/TemplateClassic";
import TemplateModern from "../components/resumeTemplates/TemplateModern";

const steps = [
  { label: "Basic Info", component: Step1_BasicInfo },
  { label: "Education", component: Step2_Education },
  { label: "Experience", component: Step3_Experience },
  { label: "Projects", component: Step4_Projects },
  { label: "Skills", component: Step5_Skills },
  { label: "Achievements", component: Step6_Achievements },
  { label: "Positions", component: Step7_Positions },
];

export default function ResumeBuilder() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [savedSteps, setSavedSteps] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "", email: "", mobile: "", github: "", linkedin: "", portfolio: "",
    education: [{}], experience: [{}], projects: [{}],
    skills: "", achievements: "", positions: "",
  });

  const CurrentComponent = steps[currentStep].component;
  const selectedTemplate = localStorage.getItem("selectedTemplate");

  useEffect(() => {
    const fetchData = async () => {
      if (resumeId && currentUser) {
        const docRef = doc(db, "resumes", resumeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(data);
          const saved = steps.filter(step => data[step.label.toLowerCase()]);
          setSavedSteps(saved.map(step => step.label.toLowerCase()));
        }
      }
    };
    fetchData();
  }, [resumeId, currentUser]);

  const handleSave = async () => {
    if (!currentUser) return alert("Login required to save!");
    const stepKey = steps[currentStep].label.toLowerCase();
    const updatedSteps = [...new Set([...savedSteps, stepKey])];
    setSavedSteps(updatedSteps);

    const resumeData = {
      ...formData,
      userId: currentUser.uid,
      selectedTemplate,
      updatedAt: serverTimestamp(),
    };

    try {
      if (resumeId) {
        await updateDoc(doc(db, "resumes", resumeId), resumeData);
      } else {
        const docRef = await addDoc(collection(db, "resumes"), {
          ...resumeData,
          createdAt: serverTimestamp(),
        });
        navigate(`/create-resume/builder/${docRef.id}`);
      }
      alert(`Step "${steps[currentStep].label}" saved!`);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save. Try again.");
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinalSave = async () => {
    if (!currentUser) return alert("You must be logged in to save!");

    const resumeData = {
      ...formData,
      userId: currentUser.uid,
      selectedTemplate,
      updatedAt: serverTimestamp(),
      createdAt: resumeId ? formData.createdAt : serverTimestamp(),
    };

    try {
      if (resumeId) {
        const docRef = doc(db, "resumes", resumeId);
        await updateDoc(docRef, resumeData);
        alert("Resume updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "resumes"), resumeData);
        alert("Resume saved successfully!");
        window.location.href = `/create-resume/builder/${docRef.id}`;
      }
    } catch (error) {
      console.error("Error saving final resume:", error);
      alert("Failed to save final resume. Try again.");
    }
  };

  const handleDownload = async () => {
  try {
    const previewEl = document.getElementById("resume-preview");
    if (!previewEl) return alert("Resume preview not found.");

    const canvas = await html2canvas(previewEl, {
      useCORS: true, // Important for loading images/fonts
      backgroundColor: "#ffffff", // White background
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("resume.pdf");
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to generate PDF.");
  }
};


  return (
    <div className="h-[calc(100vh-64px)]">
      <Split
        className="flex h-full"
        sizes={[20, 45, 35]}
        minSize={200}
        gutterSize={8}
      >
        {/* Sidebar */}
        <div className="bg-gray-100 p-4 border-r overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Steps</h2>
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li
                key={index}
                className={`cursor-pointer ${index === currentStep ? "font-bold text-blue-600" : ""}`}
                onClick={() => setCurrentStep(index)}
              >
                {index + 1}. {step.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="p-6 bg-white overflow-y-auto">
          <CurrentComponent data={formData} setData={setFormData} />
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Progress
            </button>
            <button
              onClick={handleNext}
              disabled={!savedSteps.includes(steps[currentStep].label.toLowerCase())}
              className={`px-4 py-2 rounded ${
                savedSteps.includes(steps[currentStep].label.toLowerCase())
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div
          className="p-6 bg-gray-50 overflow-y-auto border-l flex flex-col justify-between"
          id="resume-preview"
        >
          <div>
            <h2 className="text-lg font-bold mb-4">Live Resume Preview</h2>
            {selectedTemplate === "template1" && <TemplateClassic formData={formData} />}
            {selectedTemplate === "template2" && <TemplateModern formData={formData} />}
          </div>

          {currentStep === steps.length - 1 && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleFinalSave}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Save Resume to Dashboard
              </button>
              <button
                onClick={handleDownload}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </Split>
    </div>
  );
}
