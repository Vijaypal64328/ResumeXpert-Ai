// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js'; // install via: npm i html2pdf.js
import TemplateClassic from '../components/resumeTemplates/TemplateClassic';
import TemplateModern from '../components/resumeTemplates/TemplateModern';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const q = query(
  collection(db, "resumes"),
  where("userId", "==", currentUser.uid),
  where("status", "==", "complete"), // Only completed resumes
  orderBy("createdAt", "desc")
);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setResumes(data);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDownload = (resume) => {
    const element = document.createElement('div');
    const template =
      resume.selectedTemplate === 'template1' ? (
        <TemplateClassic formData={resume} />
      ) : (
        <TemplateModern formData={resume} />
      );

    const root = document.createElement('div');
    root.id = 'download-root';
    document.body.appendChild(root);
    import('react-dom').then(({ createRoot }) => {
      const rootInstance = createRoot(root);
      rootInstance.render(template);

      setTimeout(() => {
        html2pdf()
          .from(root)
          .save(`${resume.fullName || 'Resume'}.pdf`)
          .then(() => {
            rootInstance.unmount();
            document.body.removeChild(root);
          });
      }, 1000);
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      await deleteDoc(doc(db, 'resumes', id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-semibold mb-6 text-center">What would you like to do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
          <button onClick={() => navigate('/create-resume')} className="bg-white p-6 rounded-2xl shadow hover:bg-blue-50">
            <h3 className="text-xl font-bold text-blue-600 mb-2">Create / Edit Resume</h3>
            <p className="text-gray-600">Build a powerful resume with AI help.</p>
          </button>
          <button onClick={() => navigate('/analyze-resume')} className="bg-white p-6 rounded-2xl shadow hover:bg-green-50">
            <h3 className="text-xl font-bold text-green-600 mb-2">Analyze Resume</h3>
            <p className="text-gray-600">Get AI feedback and improve your resume.</p>
          </button>
          <button onClick={() => navigate('/find-jobs')} className="bg-white p-6 rounded-2xl shadow hover:bg-purple-50">
            <h3 className="text-xl font-bold text-purple-600 mb-2">Find Jobs</h3>
            <p className="text-gray-600">Match with jobs based on your skills.</p>
          </button>
        </div>
      </div>

      {/* Resume Cards */}
      <div className="mt-10 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Your Saved Resumes</h3>
        {resumes.length === 0 ? (
          <p className="text-gray-600">You have no saved resumes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold text-lg truncate">{resume.fullName || 'Untitled Resume'}</h4>
                <p className="text-sm text-gray-500">
                  Updated: {new Date(resume.updatedAt?.seconds * 1000).toLocaleDateString()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => navigate(`/create-resume/builder/${resume.id}`)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Update
                  </button>
                  <button onClick={() => alert("Shareable link feature coming soon")} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
                    Share
                  </button>
                  <button onClick={() => handleDelete(resume.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
