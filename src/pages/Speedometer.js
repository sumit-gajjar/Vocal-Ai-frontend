import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

const SpeedometerComponent = ({ score }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '200px', marginBottom: '20px' }}>
      <ReactSpeedometer
        value={score}
        minValue={0}
        maxValue={200}
        segments={3}
        startColor="green"
        endColor="red"
        textColor="#666"
        ringWidth={30}
        needleTransitionDuration={4000}
        needleTransition="easeElastic"
        needleColor="#007bff"
        currentValueText=""
        segmentLabels={[]}
        customSegmentLabels={[
          {
            text: "Slow",
            position: "OUTSIDE",
            color: "#666",
          },
          {
            text: "Conversational",
            position: "OUTSIDE",
            color: "#666",
          },
          {
            text: "Fast",
            position: "OUTSIDE",
            color: "#666",
          },
        ]}
        height={180}
        width={300}
      />
    </div>
  );
};

export default SpeedometerComponent;
