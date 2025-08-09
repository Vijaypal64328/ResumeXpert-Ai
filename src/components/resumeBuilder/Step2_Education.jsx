const Step2_Education = ({ data, setData }) => {
  const handleChange = (e, index) => {
    const newEducation = [...data.education];
    newEducation[index][e.target.name] = e.target.value;
    setData({ ...data, education: newEducation });
  };

  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { institute: '', degree: '', year: '' }]
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Education</h2>
      {data.education.map((edu, index) => (
        <div key={index} className="space-y-2">
          <input name="institute" value={edu.institute} onChange={(e) => handleChange(e, index)} placeholder="Institute Name" className="input w-full" />
          <input name="degree" value={edu.degree} onChange={(e) => handleChange(e, index)} placeholder="Degree" className="input w-full" />
          <input name="year" value={edu.year} onChange={(e) => handleChange(e, index)} placeholder="Year" className="input w-full" />
        </div>
      ))}
      <button onClick={addEducation} className="btn">Add More</button>
    </div>
  );
};

export default Step2_Education;