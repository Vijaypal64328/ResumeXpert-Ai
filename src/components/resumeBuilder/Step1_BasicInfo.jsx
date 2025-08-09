const Step1_BasicInfo = ({ data, setData }) => {
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Basic Information</h2>
      <input name="fullName" value={data.fullName || ""} onChange={handleChange} placeholder="Full Name" className="input w-full" />
      <input name="email" value={data.email || ""} onChange={handleChange} placeholder="Email" className="input w-full" />
      <input name="mobile" value={data.mobile || ""} onChange={handleChange} placeholder="Mobile Number" className="input w-full" />
      <input name="github" value={data.github || ""} onChange={handleChange} placeholder="GitHub URL" className="input w-full" />
      <input name="linkedin" value={data.linkedin || ""} onChange={handleChange} placeholder="LinkedIn Profile" className="input w-full" />
      <input name="portfolio" value={data.portfolio || ""} onChange={handleChange} placeholder="Portfolio Website" className="input w-full" />
    </div>
  );
};

export default Step1_BasicInfo;