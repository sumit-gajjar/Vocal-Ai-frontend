import React from 'react';

const ScoreCard = ({ feedback }) => {
  const { 'Quality Score': quality, Clarity: clarity, Engagement: engagement, Professionalism: professionalism } = feedback;
  return (
    <div className="ScoreCard">
      <div>
        <h3>Quality Score</h3>
        <p>{quality}</p>
      </div>
      <div>
        <h3>Clarity</h3>
        <p>{clarity}</p>
      </div>
      <div>
        <h3>Engagement</h3>
        <p>{engagement}</p>
      </div>
      <div>
        <h3>Professionalism</h3>
        <p>{professionalism}</p>
      </div>
    </div>
  );
};

export default ScoreCard;
