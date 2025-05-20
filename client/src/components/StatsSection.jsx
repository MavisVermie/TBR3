import './StatsSection.css';

const StatsSection = () => {
  return (
    <section className="stats-section">
      <h2>Who we are?</h2>
      <div className="stats-cards">
        <div className="stats-card card-black">
          <p>Jordan</p>
        </div>
        <div className="stats-card card-red">
          <p>Al al-Bayt University</p>
        </div>
        <div className="stats-card card-green">
          <p>College of Technology</p>
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
