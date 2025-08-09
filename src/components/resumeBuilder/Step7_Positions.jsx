const Step7_Positions = ({ data, setData }) => {
  const handleChange = (e) => {
    setData({ ...data, positions: e.target.value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Positions of Responsibility</h2>
      <textarea name="positions" value={data.positions || ''} onChange={handleChange} placeholder="List positions held..." className="input w-full" rows={4} />
    </div>
  );
};

export default Step7_Positions;