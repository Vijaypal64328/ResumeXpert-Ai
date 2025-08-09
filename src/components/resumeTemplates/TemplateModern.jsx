import React from "react";

const TemplateModern = ({ formData }) => {
  return (
    <div className="bg-gray-100 p-6 max-w-[794px] mx-auto font-sans">
      <div className="bg-blue-700 text-white text-center py-4 rounded">
        <h1 className="text-3xl font-bold">{formData.fullName || "Your Name"}</h1>
        <p>{formData.email || "you@example.com"} | {formData.mobile || "0000000000"}</p>
      </div>

      <div className="mt-6 space-y-4">
        {formData.education?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-blue-700">Education</h2>
            {formData.education.map((edu, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold">{edu.institute} ({edu.year})</p>
                <p>{edu.degree}</p>
              </div>
            ))}
          </section>
        )}

        {formData.experience?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-blue-700">Experience</h2>
            {formData.experience.map((exp, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold">{exp.company} ({exp.duration})</p>
                <p>{exp.role}</p>
              </div>
            ))}
          </section>
        )}
        {formData.experience && formData.experience.length > 0 && (
  <section>
    <h3>Experience</h3>
    {/* map through experience */}
  </section>
)}


        {formData.projects?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-blue-700">Projects</h2>
            {formData.projects.map((proj, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold">{proj.title}</p>
                <p>{proj.description}</p>
              </div>
            ))}
          </section>
        )}

        {formData.skills && (
          <section>
            <h2 className="text-xl font-semibold text-blue-700">Technical Skills</h2>
            <p className="text-sm">{formData.skills}</p>
          </section>
        )}

        {formData.achievements && (
          <section>
            <h2 className="text-xl font-semibold text-blue-700">Achievements</h2>
            <p className="text-sm">{formData.achievements}</p>
          </section>
        )}

        {formData.positions && (
          <section>
            <h2 className="text-xl font-semibold text-blue-700">Positions of Responsibility</h2>
            <p className="text-sm">{formData.positions}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default TemplateModern;
