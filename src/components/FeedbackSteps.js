import React from 'react';

const FeedbackSteps = ({ feedback }) => {
  return (
    <div className="FeedbackSteps">
      <h3>Steps to Improve Your Score</h3>
      <ul>
        {/* Add specific steps for improvement based on the feedback */}
        <li>Step 1: {feedback['Corrected Transcript']}</li>
        {/* Add more steps as needed */}
      </ul>
    </div>
  );
};

export default FeedbackSteps;
