import React from 'react';
import './WelcomeSection.css';


const WelcomeSection = () => {
  return (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2>أهلاً بكم في شجرة وحديقة</h2>
        <p>
          نؤمن بأن الزراعة أكثر من مجرد نباتات، إنها طريقة حياة. نحن نزرع الجمال ونرعى البيئة عبر حلولنا المستدامة في الزراعة والتشجير والتنسيق البيئي.
        </p>
        <a href="#about" className="about-link">المزيد عنا</a>
      </div>
      <div className="welcome-image">
       
      </div>
    </section>
  );
};

export default WelcomeSection;
