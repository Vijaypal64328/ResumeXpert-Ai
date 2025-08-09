import React from "react";
import logo from "../../assets/mnnit_logo.png";

const TemplateClassic = ({ formData }) => {
  return (
    <div className="font-serif text-black p-6 bg-white max-w-[794px] mx-auto">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <img src={logo} alt="College Logo" className="w-16 h-16" />
        <div className="text-center">
          <h1 className="text-3xl font-bold">{formData.fullName || "Your Name"}</h1>
          <p className="text-sm">{formData.email || "you@example.com"} | {formData.mobile || "0000000000"}</p>
        </div>
        <div />
      </div>

      {formData.education?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-semibold border-b">Education</h2>
          {formData.education.map((edu, i) => (
            <div key={i} className="text-sm">
              <p className="font-semibold">{edu.institute} ({edu.year})</p>
              <p>{edu.degree}</p>
            </div>
          ))}
        </section>
      )}

      {formData.experience?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-semibold border-b">Experience</h2>
          {formData.experience.map((exp, i) => (
            <div key={i} className="text-sm">
              <p className="font-semibold">{exp.company} ({exp.duration})</p>
              <p>{exp.role}</p>
            </div>
          ))}
        </section>
      )}

      {formData.projects?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-semibold border-b">Projects</h2>
          {formData.projects.map((proj, i) => (
            <div key={i} className="text-sm">
              <p className="font-semibold">{proj.title}</p>
              <p>{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {formData.skills && (
        <section className="mb-4">
          <h2 className="text-lg font-semibold border-b">Technical Skills</h2>
          <p className="text-sm">{formData.skills}</p>
        </section>
      )}

      {formData.achievements && (
        <section className="mb-4">
          <h2 className="text-lg font-semibold border-b">Achievements</h2>
          <p className="text-sm">{formData.achievements}</p>
        </section>
      )}

      {formData.positions && (
        <section className="mb-4">
          <h2 className="text-lg font-semibold border-b">Positions of Responsibility</h2>
          <p className="text-sm">{formData.positions}</p>
        </section>
      )}
      {formData.experience && formData.experience.length > 0 && (
  <section>
    {/* map through experience */}
  </section>
)}


    </div>
  );
};

export default TemplateClassic;