const Step3_Experience = ({ data, setData }) => {
  const handleChange = (e, index) => {
    const newExperience = [...data.experience];
    newExperience[index][e.target.name] = e.target.value;
    setData({ ...data, experience: newExperience });
  };

  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { company: '', role: '', duration: '' }]
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Experience</h2>
      {data.experience.map((exp, index) => (
        <div key={index} className="space-y-2">
          <input name="company" value={exp.company} onChange={(e) => handleChange(e, index)} placeholder="Company" className="input w-full" />
          <input name="role" value={exp.role} onChange={(e) => handleChange(e, index)} placeholder="Role" className="input w-full" />
          <input name="duration" value={exp.duration} onChange={(e) => handleChange(e, index)} placeholder="Duration" className="input w-full" />
        </div>
      ))}
      <button onClick={addExperience} className="btn">Add More</button>
    </div>
  );
};

export default Step3_Experience;
