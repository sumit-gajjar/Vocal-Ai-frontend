import axios from 'axios';
import { Chart } from 'chart.js/auto';
import 'chartjs-plugin-annotation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaAssistiveListeningSystems, FaCalendarCheck, FaChartBar, FaEye, FaFileAlt, FaHandsHelping, FaSmile, FaUpload, FaUsers, FaVolumeUp, FaWalking } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './Dashboard.css';

function Dashboard() {
  const [results, setResults] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chartRef = useRef(null);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [highlightedCircleIndex, setHighlightedCircleIndex] = useState(null);
  const [collapseCardIndex, setCollapseCardIndex] = useState(0);
  const [animatingCardIndex, setAnimatingCardIndex] = useState(null);
  const [inputFeatures, setInputFeatures] = useState({});
  const user_id = localStorage.getItem('user_id');
  const bellCurveCharts = useRef({});
  const uploadURL = `${config.baseUrl}/upload`
  const resultsURL = `${config.baseUrl}/results`
  const navigate = useNavigate(); // <-- Add this line

  useEffect(() => {
    fetchResults();
  }, [user_id]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(resultsURL, {
        params: { user_id },
      });
      const sortedResults = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setResults(sortedResults);
      if (sortedResults.length >= 2) {
        updateChart(sortedResults);
      }
    } catch (error) {
      console.error('Error fetching results', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid audio file.');
      setFile(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleCardClick = useCallback((cardIndex) => {
    setAnimatingCardIndex(cardIndex);
    setTimeout(() => {
      setCollapseCardIndex(cardIndex);
      setExpandedCardIndex(null);
      setAnimatingCardIndex(null);
      setTimeout(() => {
        renderBellCurveChart(results[cardIndex].feedback['Overall Score'], `bellCurveChart-${cardIndex}`);
      }, 300);
    }, 300);
  }, [results]);

  const handleCircleClick = (cardIndex, circleIndex) => {
    setHighlightedCircleIndex(circleIndex);
    setExpandedCardIndex(cardIndex);
    setCollapseCardIndex(null);
    setRelevantInputFeatures(results[cardIndex].input_features, circleIndex);
  };

  const setRelevantInputFeatures = (features, circleIndex) => {
    switch (circleIndex) {
      case 0:
        setInputFeatures({
          'Mean MFCC': features.mean_mfcc,
          'Mean ZCR': features.mean_zcr,
          'Filler Word Count': features.filler_word_count,
          'Grammar Errors': features.grammar_errors,
        });
        break;
      case 1:
        setInputFeatures({
          'Filler Word Count': features.filler_word_count,
          'Grammar Errors': features.grammar_errors,
        });
        break;
      case 2:
        setInputFeatures({
          'Mean Chroma': features.mean_chroma,
          'Stopword Count': features.stopword_count,
        });
        break;
      case 3:
        setInputFeatures({
          'Mean MFCC': features.mean_mfcc,
          'Avg Words Per Sentence': features.avg_words_per_sentence,
        });
        break;
      default:
        setInputFeatures({});
        break;
    }
  };

  const getColor = (score) => {
    if (score > 65) {
      return "#00c853";
    } else if (score > 30) {
      return "#ffeb3b";
    } else {
      return "#d32f2f";
    }
  };

  const renderCircle = (score, label, cardIndex, circleIndex) => (
    <div
      className={`score-circle ${expandedCardIndex === cardIndex && highlightedCircleIndex === circleIndex ? 'highlight' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        handleCircleClick(cardIndex, circleIndex);
      }}
      key={circleIndex}
    >
      <div className="circle-container">
        <div className="circle-front">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path
              className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle"
              strokeDasharray={`${score}, 100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              stroke={getColor(score)}
            />
            <text x="18" y="20.35" className="percentage">{score}%</text>
          </svg>
          <p>{label}</p>
        </div>
      </div>
    </div>
  );

  const handleFileUpload = async () => {
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', user_id);

      try {
        const response = await axios.post(uploadURL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newResults = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setResults(newResults);
        setCollapseCardIndex(0);
        setExpandedCardIndex(null);
        setHighlightedCircleIndex(null);
        setFile(null);
        if (newResults.length >= 2) {
          updateChart(newResults);
        }
      } catch (error) {
        console.error('Error uploading file', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const extractFileName = (filePath) => {
    if (!filePath) {
      return '';
    }
    return filePath.split('\\').pop().split('/').pop();
  };

  const truncateFileName = (fileName, maxLength = 15) => {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const extension = fileName.split('.').pop();
    return `${fileName.substring(0, maxLength - extension.length - 3)}...${extension}`;
  };

  const updateChart = (data) => {
    const ctx = chartRef.current.getContext('2d');
    const recentResults = data.slice(0, 5).reverse();
    const scores = recentResults.map(result => result.feedback['Overall Score']);
    const labels = recentResults.map(result => truncateFileName(extractFileName(result.file_name ? result.file_name : '')));
    const pointColors = scores.map(score => getColor(score));

    window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: scores,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.2)',
          fill: true,
          tension: 0.1,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointHoverBackgroundColor: pointColors,
          pointHoverBorderColor: pointColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
            external: function (context) {
              let tooltipEl = document.getElementById('chartjs-tooltip');
              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.innerHTML = '<table></table>';
                document.body.appendChild(tooltipEl);
              }
              const tooltipModel = context.tooltip;
              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }
              tooltipEl.classList.remove('above', 'below', 'no-transform');
              if (tooltipModel.yAlign) {
                tooltipEl.classList.add(tooltipModel.yAlign);
              } else {
                tooltipEl.classList.add('no-transform');
              }
              function getBody(bodyItem) {
                return bodyItem.lines;
              }
              if (tooltipModel.body) {
                const titleLines = tooltipModel.title || [];
                const bodyLines = tooltipModel.body.map(getBody);
                let innerHtml = '<thead>';
                titleLines.forEach(function (title) {
                  innerHtml += '<tr><th>' + title + '</th></tr>';
                });
                innerHtml += '</thead><tbody>';
                bodyLines.forEach(function (body, i) {
                  const color = pointColors[tooltipModel.dataPoints[i].dataIndex];
                  let style = 'background:' + color;
                  style += '; border-color:' + color;
                  style += '; border-width: 2px';
                  const span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                  innerHtml += `<tr><td>${span}<span style="color:${color};">${body}</span></td></tr>`;
                });
                innerHtml += '</tbody>';
                const tableRoot = tooltipEl.querySelector('table');
                tableRoot.innerHTML = innerHtml;
              }
              const position = context.chart.canvas.getBoundingClientRect();
              tooltipEl.style.opacity = 1;
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
              tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
              tooltipEl.style.padding = `${tooltipModel.padding}px ${tooltipModel.padding}px`;
              tooltipEl.style.pointerEvents = 'none';
              tooltipEl.style.transform = 'translateX(-50%)';
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              borderDash: [5, 5],
              drawBorder: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              display: false
            }
          }
        }
      }
    });
  };

  const generateBellCurveData = () => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const y = Math.exp(-0.5 * Math.pow((x - 0.5) / 0.15, 2)) / (0.15 * Math.sqrt(2 * Math.PI));
      points.push({ x: i, y: y });
    }
    return points;
  };

  const renderBellCurveChart = (score, containerId) => {
    if (bellCurveCharts.current[containerId]) {
      bellCurveCharts.current[containerId].destroy();
    }

    const ctx = document.getElementById(containerId).getContext('2d');

    const bellCurveData = generateBellCurveData();
    const fillData = bellCurveData.map(point => (point.x <= score ? point.y : null));
    let fillColor;
    if (score <= 30) {
      fillColor = 'rgba(211, 47, 47, 0.5)';
    } else if (score <= 60) {
      fillColor = 'rgba(255, 235, 59, 0.5)';
    } else {
      fillColor = 'rgba(0, 200, 83, 0.5)';
    }
    const data = {
      labels: bellCurveData.map(point => point.x),
      datasets: [
        {
          label: 'Bell Curve Fill',
          data: fillData,
          backgroundColor: fillColor,
          borderColor: 'rgba(0, 0, 0, 0)',
          fill: true,
          tension: 0.1,
          pointRadius: 0
        },
        {
          label: 'Bell Curve Grey',
          data: bellCurveData.map(point => point.y),
          backgroundColor: '#F6F6F6',
          borderColor: 'rgba(0, 0, 0, 0)',
          fill: true,
          tension: 0.1,
          pointRadius: 0
        }
      ]
    };

    const colorPlugin = {
      id: 'colorPlugin',
      beforeDraw: (chart) => {
        const { ctx, chartArea: { left, right, bottom }, scales: { x } } = chart;
        const radius = 2;
        const barHeight = 5;
        const yPosition = bottom + 3;

        const gradient = ctx.createLinearGradient(left, 0, right, 0);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.3, 'red');
        gradient.addColorStop(0.31, 'rgb(255, 235, 59)');
        gradient.addColorStop(0.6, 'rgb(255, 235, 59)');
        gradient.addColorStop(0.61, 'rgb(0, 200, 83)');
        gradient.addColorStop(1, 'rgb(0, 200, 83)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(left + radius, yPosition);
        ctx.lineTo(right - radius, yPosition);
        ctx.arcTo(right, yPosition, right, yPosition + radius, radius);
        ctx.lineTo(right, yPosition + barHeight - radius);
        ctx.arcTo(right, yPosition + barHeight, right - radius, yPosition + barHeight, radius);
        ctx.lineTo(left + radius, yPosition + barHeight);
        ctx.arcTo(left, yPosition + barHeight, left, yPosition + barHeight - radius, radius);
        ctx.lineTo(left, yPosition + radius);
        ctx.arcTo(left, yPosition, left + radius, yPosition, radius);
        ctx.closePath();
        ctx.fill();

        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Needs Work', left + (right - left) * 0.15, yPosition + barHeight + 15);
        ctx.fillText('On Track', left + (right - left) * 0.45, yPosition + barHeight + 15);
        ctx.fillText('Good Job', left + (right - left) * 0.8, yPosition + barHeight + 15);
      }
    };

    const chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          annotation: {
            annotations: {
              scoreLine: {
                type: 'line',
                xMin: score,
                xMax: score,
                borderColor: 'black',
                borderWidth: 2
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            grid: {
              display: false
            },
            ticks: {
              callback: function (value) {
                return '';
              }
            }
          },
          y: {
            display: false
          }
        }
      },
      plugins: [colorPlugin]
    });

    bellCurveCharts.current[containerId] = chart;
  };

  const getHighlightedText = (cardIndex) => {
    const sampleTexts = {
      Quality: "Sample text for Quality Score.",
      Clarity: "Sample text for Clarity.",
      Engagement: "Sample text for Engagement.",
      Professionalism: "Sample text for Professionalism."
    };
    if (highlightedCircleIndex === 0) return sampleTexts.Quality;
    if (highlightedCircleIndex === 1) return sampleTexts.Clarity;
    if (highlightedCircleIndex === 2) return sampleTexts.Engagement;
    if (highlightedCircleIndex === 3) return sampleTexts.Professionalism;
    return '';
  };

  const getColorForValue = (value) => {
    if (value < -30) return "#d32f2f"; // red
    if (value < -10) return "#ff9800"; // orange
    if (value < 10) return "#ffeb3b"; // yellow
    if (value < 30) return "#8bc34a"; // light green
    return "#4caf50"; // green
  };

  const getDescriptionForValue = (value) => {
    if (value < -30) return "Very low energy in the audio signal.";
    if (value < -10) return "Low energy in the audio signal.";
    if (value < 10) return "Medium energy in the audio signal.";
    if (value < 30) return "High energy in the audio signal.";
    return "Very high energy in the audio signal.";
  };


  useEffect(() => {
    results.forEach((result, index) => {
      const canvasId = `bellCurveChart-${index}`;
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        renderBellCurveChart(result.feedback['Overall Score'], canvasId);
      }
    });
  }, [results]);

  const renderInputFeatures = (inputFeatures) => (
    <div>
      <h4>Input Features</h4>
      <ul>
        {Object.entries(inputFeatures).map(([feature, value]) => (
          <li key={feature}>{feature}: {Array.isArray(value) ? value.join(', ') : value}</li>
        ))}
      </ul>
    </div>
  );

  const renderExpandedContent = (cardIndex, result) => (
    <div className="expanded-content">
      <div className={`scores-container ${expandedCardIndex === cardIndex ? 'highlighted' : ''}`}>
        <div className="scores-grid">
          {renderCircle(result.feedback['Quality Score'], "Quality Score", cardIndex, 0)}
          {renderCircle(result.feedback['Clarity'], "Clarity", cardIndex, 1)}
          {renderCircle(result.feedback['Engagement'], "Engagement", cardIndex, 2)}
          {renderCircle(result.feedback['Professionalism'], "Professionalism", cardIndex, 3)}
        </div>
      </div>
      <div className="separator"></div>
      <div className="dynamic-text-area">
        <h4>Detailed Analysis</h4>
        <p>{getHighlightedText(cardIndex)}</p>
        {inputFeatures && renderInputFeatures(inputFeatures)}
        {/* Add more detailed analysis here */}
        <div className="detailed-analysis">
          <h4>Quality Score Breakdown</h4>
          <ul>
            <li>Mean MFCC: {result.input_features.mean_mfcc.join(', ')}</li>
            <li>Mean ZCR: {result.input_features.mean_zcr}</li>
            <li>Filler Word Count: {result.input_features.filler_word_count}</li>
            <li>Grammar Errors: {result.input_features.grammar_errors}</li>
          </ul>
          {/* Add charts or more detailed explanations here */}
        </div>
      </div>
    </div>
  );

  const minHeight = results.length > 0 ? 'fit-content' : '100vh';

  return (
    <div className="dashboard" style={{ minHeight }}>
      <div className="content-section">
        <div className="upload-section">
          <h3>Upload New Audio File</h3>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            id="upload-file"
            className="file-input"
            ref={fileInputRef}
          />
          <button onClick={handleUploadClick} className="upload-btn">Choose File</button>
          {file && (
            <>
              <span className="file-name">{file.name}</span>
              <button onClick={handleFileUpload} className="upload-btn" disabled={loading}>
                {loading ? (
                  <ThreeDots color="#fff" height={23} width={63} />
                ) : (
                  <>
                    <FaUpload />
                    Upload
                  </>
                )}
              </button>
            </>
          )}
          {/* {loading && (
            <div className="loader">
              <ThreeDots
                color="#007bff"
                height={50}
                width={50}
              />
            </div>
          )} */}
        </div>

        <div className="results-section">
          {results.length > 0 ? (
            results.map((result, cardIndex) => (
              <div
                key={result._id}
                className={`result-card ${expandedCardIndex === cardIndex ? 'expanded' : collapseCardIndex === cardIndex ? 'collapsed active' : 'hidden'} ${animatingCardIndex === cardIndex ? 'animating' : ''}`}
                onClick={() => handleCardClick(cardIndex)}
              >
                <div className="result-card-header">
                  <span className="result-card-filename">{extractFileName(result.file_name ? result.file_name : '')}</span>
                  <span className="combined-score">Combined Score: {result.feedback['Overall Score']}</span>
                </div>
                {expandedCardIndex === cardIndex && renderExpandedContent(cardIndex, result)}
                {collapseCardIndex === cardIndex && expandedCardIndex !== cardIndex && (
                  <div className="scores-container">
                    <div className="bell-curve-chart-container">
                      <canvas id={`bellCurveChart-${cardIndex}`}></canvas>
                    </div>
                    <div className="scores-grid">
                      {renderCircle(result.feedback['Quality Score'], "Quality Score", cardIndex, 0)}
                      {renderCircle(result.feedback['Clarity'], "Clarity", cardIndex, 1)}
                      {renderCircle(result.feedback['Engagement'], "Engagement", cardIndex, 2)}
                      {renderCircle(result.feedback['Professionalism'], "Professionalism", cardIndex, 3)}
                      <button
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/expanded-result/${result._id}`);
                        }}
                      >
                        View Detailed Analysis
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              <p className="no-uploads-message">You have no uploads yet.</p>
              <p className="instructions">To get started, upload your first audio file using the button above.</p>
            </>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        {results.length >= 2 && (
          <div className="chart-section">
            <h3 className='tips-header'>Previous Scores</h3>
            <canvas id="myChart" ref={chartRef}></canvas>
          </div>
        )}
        <div className="tips-section">
          <h3 className='tips-header'>Tips</h3>
          <ul className="tips-list">
            <li><FaCalendarCheck /> Practice regularly to build confidence and improve your speaking skills.</li>
            <li><FaUsers /> Know your audience and tailor your message to their interests and level of understanding.</li>
            <li><FaFileAlt /> Structure your speech with a clear beginning, middle, and end.</li>
            <li><FaChartBar /> Use visual aids to enhance your message and engage your audience.</li>
            <li><FaEye /> Make eye contact with your audience to build a connection and maintain their interest.</li>
            <li><FaVolumeUp /> Speak clearly and at a moderate pace to ensure your audience can follow along.</li>
            <li><FaHandsHelping /> Use body language and gestures to emphasize your points and convey enthusiasm.</li>
            <li><FaAssistiveListeningSystems /> Practice active listening and be open to feedback to improve your delivery.</li>
            <li><FaSmile /> Manage your nerves by taking deep breaths and focusing on your message.</li>
            <li><FaWalking /> Rehearse in different settings to become comfortable speaking in various environments.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
