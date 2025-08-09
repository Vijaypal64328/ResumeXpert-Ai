const Step5_Skills = ({ data, setData }) => {
  const handleChange = (e) => {
    setData({ ...data, skills: e.target.value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Technical Skills & Interests</h2>
      <textarea name="skills" value={data.skills || ''} onChange={handleChange} placeholder="List your skills..." className="input w-full" rows={4} />
    </div>
  );
};

export default Step5_Skills;