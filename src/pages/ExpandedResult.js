import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import '@rhds/elements/rh-audio-player/rh-audio-player.js';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../config';
import './ExpandedResult.css';
import Speedometer from './Speedometer';

const ExpandedResult = () => {
  const { resultId } = useParams();
  const [audioSrc, setAudioSrc] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const audioURL = `${config.baseUrl}/audio`;
  const resultURL = `${config.baseUrl}/result`;
  const [expanded, setExpanded] = useState('conciseness'); // Set the first accordion to be open by default

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const resultresponse = await axios.get(resultURL + '/' + resultId);
        const result = await resultresponse.data;
        setResult(result);

        const response = await fetch(`${audioURL}/${result.audio_file_id}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      }
    };

    fetchAudio();
  }, [resultId, audioURL, resultURL]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // const suggestions = [
  //   {
  //     offset: 497,
  //     length: 3,
  //     message: "Possible spelling mistake found.",
  //     replacement: "SMA"
  //   },
  //   {
  //     offset: 522,
  //     length: 3,
  //     message: "Possible spelling mistake found.",
  //     replacement: "SMA"
  //   },
  //   {
  //     offset: 889,
  //     length: 4,
  //     message: "Use a comma before ‘and’ if it connects two independent clauses (unless they are closely connected and short).",
  //     replacement: ", and"
  //   },
  //   {
  //     offset: 1478,
  //     length: 2,
  //     message: "A word may be missing after ‘a’.",
  //     replacement: ""
  //   }
  // ];

  const getFeedbackMessage = (percentageString) => {
    const percentage = parseFloat(percentageString.replace('%', ''));
    if (percentage <= 10) {
      return "Excellent job! Your speech is very concise.";
    } else if (percentage <= 20) {
      return "Great job! Your speech is concise.";
    } else if (percentage <= 30) {
      return "Nice job! It's totally okay to have less than 30% excess words.";
    } else if (percentage <= 40) {
      return "Good job! Consider reducing the number of excess words.";
    } else if (percentage <= 50) {
      return "Not bad! You might want to reduce excess words for more clarity.";
    } else if (percentage <= 60) {
      return "Keep practicing! Try to reduce the number of excess words.";
    } else if (percentage <= 70) {
      return "You have room for improvement. Focus on making your speech more concise.";
    } else if (percentage <= 80) {
      return "Considerable improvement needed. Aim to reduce excess words significantly.";
    } else {
      return "Significant reduction needed. Try to avoid unnecessary words.";
    }
  };

  const getFillerWordsMessage = (percentage) => {
    if (percentage === 0) {
      return "Excellent! You used no filler words.";
    } else if (percentage < 5) {
      return "Great job! You have minimal filler words.";
    } else if (percentage >= 5 && percentage < 10) {
      return "Not bad! You might want to reduce filler words for a more polished speech.";
    } else {
      return "Consider reducing filler words to improve the clarity of your speech.";
    }
  };

  const getPacingMessage = (score) => {
    if (score < 80) {
      return "Try to pick up the pace a bit to keep your audience engaged.";
    } else if (score >= 80 && score < 120) {
      return "Great job! Your pacing is conversational and easy to follow.";
    } else if (score >= 120 && score < 160) {
      return "Your pacing is a bit fast. Try to slow down slightly for clarity.";
    } else {
      return "Your pacing is quite fast. Slowing down will help your audience understand better.";
    }
  };

  return (
    <div className="app">
      <div className="main-content">
        <div className="audio-section">
          {error && <p>Error: {error}</p>}
          {audioSrc && (
            <div>
              <rh-audio-player layout="compact-wide" src={audioSrc}>
                <p slot="series">Code Comments</p>
                <audio
                  ref={audioRef}
                  crossOrigin="anonymous"
                  slot="media"
                  controls
                  onTimeUpdate={handleTimeUpdate}
                >
                  <source type="audio/mp3" srclang="en" src={audioSrc} />
                </audio>
              </rh-audio-player>
            </div>
          )}
          <div className="transcript-section">
            <h3>Record your speech to get insights on your speaking performance!</h3>
            <div className="transcript">
              <div className="transcript-entry">
                {result ? (
                  <TranscriptViewer transcript={result.transcript} wordTimestamps={result.word_timestamps} currentTime={currentTime} />
                ) : (
                  <span className="transcript-text">The transcript of your audio will be displayed here.</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="feedback-section">
          <div className="feedback-header">
            <div className="feedback-header-icon">➔</div>
            <h2>Your Speaking Insights</h2>
          </div>
          {/* <div className="feedback-header-title">
            <h3>Analytics</h3>
          </div> */}
          <div className="insights">
            <Accordion expanded={expanded === 'conciseness'} onChange={handleAccordionChange('conciseness')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className="accordion-summary">
                <Typography>Conciseness</Typography>
                <span className="conciseness-percentage">{result?.feedback?.Conciseness['Excess Words Percentage']}</span>
              </AccordionSummary>
              <AccordionDetails>
                <div className="feedback-message">
                  {result && getFeedbackMessage(result.feedback.Conciseness['Excess Words Percentage'])}
                </div>
                {/* <Typography>
                  {result && getFeedbackMessage(result.feedback.Conciseness['Excess Words Percentage'])}<br /><br />
                </Typography> */}
                <div className="suggestion-box">
                  {result && result?.feedback.Conciseness['Rephrasing Suggestions']}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'pacing'} onChange={handleAccordionChange('pacing')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className="accordion-summary">
                <Typography>Pacing</Typography>
                <span className="pacing-value">{result?.input_features?.pacing.toFixed(0)} words/minute</span>
              </AccordionSummary>
              <AccordionDetails>
                <div className="feedback-message">
                  {result && getPacingMessage(result?.input_features?.pacing.toFixed(0))}
                </div>
                <Speedometer score={result?.input_features?.pacing.toFixed(0)} />
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'fillerwords'} onChange={handleAccordionChange('fillerwords')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className="accordion-summary">
                <Typography>Filler Words</Typography>
                <span className="pacing-value">{result?.input_features?.filler_word_count}</span>
              </AccordionSummary>
              <AccordionDetails>
                <div className="feedback-message">
                  {result && getFillerWordsMessage(result?.input_features?.filler_word_count)}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'summary'} onChange={handleAccordionChange('summary')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className="accordion-summary">
                <Typography>Summary</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {result?.transcript_summary}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

const TranscriptViewer = ({ transcript, wordTimestamps, currentTime }) => {
  const splitTranscript = () => {
    const groups = [];
    let currentGroup = [];

    wordTimestamps.forEach((wordData, index) => {
      currentGroup.push(wordData);

      if (
        index === wordTimestamps.length - 1 || // Last word
        wordTimestamps[index + 1].start_time - wordData.end_time > 2 // More than 2 seconds pause
      ) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    });

    return groups;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const wordGroups = splitTranscript();

  const isCurrentGroup = (group) => {
    return group.some(
      (wordData) => currentTime >= wordData.start_time && currentTime <= wordData.end_time
    );
  };

  return (
    <div className="transcript-viewer">
      {wordGroups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={`transcript-group ${isCurrentGroup(group) ? 'highlight-group' : ''}`}
        >
          <div className="start-time">
            {formatTime(group[0].start_time)}
          </div>
          {group.map((wordData, wordIndex) => (
            <span
              key={wordIndex}
              className={`word ${currentTime >= wordData.start_time && currentTime <= wordData.end_time ? 'highlight-word' : ''}`}
            >
              {wordData.word}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ExpandedResult;
