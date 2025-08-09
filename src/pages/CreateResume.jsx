import React from "react";
import { useNavigate } from "react-router-dom";

const CreateResume = () => {
  const navigate = useNavigate();

  const templates = [
    { id: "template1", name: "Classic", preview: "/template1.png" },
    { id: "template2", name: "Modern", preview: "/template2.png" },
  ];

  const handleSelect = (templateId) => {
    // Ideally save the selected template in context or localStorage
    localStorage.setItem("selectedTemplate", templateId);
    navigate("/create-resume/builder");
  };

return (
    <div className="min-h-screen p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-center">Choose a Resume Template</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {templates.map((template) => (
                <div key={template.id} className="border rounded shadow p-4 bg-white flex flex-col items-center">
                    <div className="w-full h-[32rem] flex items-center justify-center mb-2">
                        <img
                            src={template.preview}
                            alt={template.name}
                            className="max-h-[30rem] w-auto object-contain rounded"
                            style={{ maxWidth: "100%" }}
                        />
                    </div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <button
                        onClick={() => handleSelect(template.id)}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Use This Template
                    </button>
                </div>
            ))}
        </div>
    </div>
);
};

export default CreateResume;
