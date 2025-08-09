const Step6_Achievements = ({ data, setData }) => {
  const handleChange = (e) => {
    setData({ ...data, achievements: e.target.value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Achievements & Certifications</h2>
      <textarea name="achievements" value={data.achievements || ''} onChange={handleChange} placeholder="List achievements..." className="input w-full" rows={4} />
    </div>
  );
};

export default Step6_Achievements;