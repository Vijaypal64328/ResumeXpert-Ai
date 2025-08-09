const Step4_Projects = ({ data, setData }) => {
  const handleChange = (e, index) => {
    const newProjects = [...data.projects];
    newProjects[index][e.target.name] = e.target.value;
    setData({ ...data, projects: newProjects });
  };

  const addProject = () => {
    setData({
      ...data,
      projects: [...data.projects, { title: '', description: '' }]
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Projects</h2>
      {data.projects.map((proj, index) => (
        <div key={index} className="space-y-2">
          <input name="title" value={proj.title} onChange={(e) => handleChange(e, index)} placeholder="Project Title" className="input w-full" />
          <textarea name="description" value={proj.description} onChange={(e) => handleChange(e, index)} placeholder="Description" className="input w-full" />
        </div>
      ))}
      <button onClick={addProject} className="btn">Add Project</button>
    </div>
  );
};

export default Step4_Projects;