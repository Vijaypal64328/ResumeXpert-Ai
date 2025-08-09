import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';
import createImg from '../assets/create-resume.png';
import analyzeImg from '../assets/analyze-resume.png';
import findImg from '../assets/find-jobs.png';
import user1 from '../assets/user1.jpg';
import user2 from '../assets/user2.jpg';
import user3 from '../assets/user3.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const testimonials = [
    { img: user1, text: "ResumeXpert helped me land interviews fast!", subtitle: "Senior Product Manager", name: "Aisha R." },
    { img: user2, text: "The analyzer gave me powerful resume feedback.", subtitle: "Software Engineer", name: "Rohan K." },
    { img: user3, text: "Job matching saved me hours of searching!", subtitle: "UX Designer", name: "Priya D." },
    { img: user1, text: "I love the easy resume builder interface.", subtitle: "Marketing Specialist", name: "Sana L." },
    { img: user2, text: "Fantastic job matches in minutes!", subtitle: "Data Analyst", name: "Vikram P." }
  ];
  const [startIndex, setStartIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(window.innerWidth < 768 ? 1 : 3);
  useEffect(() => {
    const handleResize = () => setItemsToShow(window.innerWidth < 768 ? 1 : 3);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const maxIndex = testimonials.length - itemsToShow;

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <h2 className="text-4xl font-bold mb-4">AI Resume Builder, Analyzer & Job Matcher</h2>
        <p className="text-lg mb-6">Craft your perfect resume, analyze it for improvements, and get matched with top jobs using AI.</p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700"
        >
          Get Started
        </button>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 px-6 text-center">
        <h3 className="text-3xl font-bold mb-8 text-indigo-800">What You Can Do</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition-colors hover:bg-blue-100">
            <h4 className="text-xl font-semibold mb-2 text-blue-600">Create Resume</h4>
            <p className="mb-4 text-gray-600">Build a professional resume with our AI-assisted editor.</p>
            <img src={createImg} alt="Create Resume" className="mx-auto w-full h-48 object-cover rounded" />
          </div>
          <div className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition-colors hover:bg-green-100">
            <h4 className="text-xl font-semibold mb-2 text-green-600">Analyze Resume</h4>
            <p className="mb-4 text-gray-600">Get AI-powered feedback to optimize your resume.</p>
            <img src={analyzeImg} alt="Analyze Resume" className="mx-auto w-full h-48 object-cover rounded" />
          </div>
          <div className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition-colors hover:bg-yellow-100">
            <h4 className="text-xl font-semibold mb-2 text-yellow-600">Find Jobs</h4>
            <p className="mb-4 text-gray-600">Match with relevant job postings tailored to your profile.</p>
            <img src={findImg} alt="Find Jobs" className="mx-auto w-full h-48 object-cover rounded" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-6 text-center bg-indigo-50">
        <h3 className="text-3xl font-bold mb-8 text-indigo-800">What Our Users Say</h3>
        <div className="relative flex items-center">
          <button
            onClick={() => setStartIndex(i => Math.max(0, i - 1))}
            disabled={startIndex === 0}
            className="text-3xl text-indigo-600 px-4 disabled:text-gray-400"
          >&lt;</button>
          <div className="flex gap-6 overflow-hidden flex-1 mx-4">
            {testimonials.slice(startIndex, startIndex + itemsToShow).map((t, idx) => (
              <div key={idx} className="bg-white shadow-lg p-6 rounded-lg flex-1">
                <img src={t.img} alt={t.name} className="mx-auto mb-4 w-24 h-24 rounded-full border-4 border-gray-300" />
                <p className="mb-2 text-gray-700">“{t.text}”</p>
                <p className="text-sm text-gray-500 mb-2">{t.subtitle}</p>
                <span className="block mt-2 font-semibold text-gray-800">– {t.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStartIndex(i => Math.min(maxIndex, i + 1))}
            disabled={startIndex === maxIndex}
            className="text-3xl text-indigo-600 px-4 disabled:text-gray-400"
          >&gt;</button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-6 bg-gray-200 text-center">
        <h3 className="text-3xl font-bold mb-4">Contact Us</h3>
        <p className="mb-2">Email: support@resumexpert.com | Phone: +1 (800) 123-4567</p>
        <div className="flex justify-center gap-6 mt-4 text-2xl text-gray-700">
          <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-blue-600"><FaLinkedin /></a>
          <a href="https://github.com" aria-label="GitHub" className="hover:text-gray-900"><FaGithub /></a>
          <a href="https://twitter.com" aria-label="Twitter" className="hover:text-blue-400"><FaTwitter /></a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        © 2025 ResumeXpert. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
