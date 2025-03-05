import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { motion, useAnimation } from "framer-motion";
import styles from "../styles/Home.module.scss";

export default function Home() {
  const [sentiment, setSentiment] = useState(75); // Start with bullish sentiment
  const pendulumControls = useAnimation();
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const oscillationRef = useRef<number>(0);

  // Physics constants - refined for smoother motion
  const MAX_AMPLITUDE = 85; // Maximum swing angle
  const NATURAL_FREQUENCY = 0.9; // Slightly faster for more control
  const BASE_DAMPING_RATIO = 0.015; // Base damping for stability
  const VELOCITY_FACTOR = 0.8; // Reduced for more controlled initial movement
  const SPRING_CONSTANT = 0.05; // Added for smooth transitions

  // Animation state
  const [amplitude, setAmplitude] = useState(30); // Reduced initial amplitude
  const [phase, setPhase] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const prevSentimentRef = useRef(50);

  // Add oscillation constants
  const OSCILLATION_PERIOD = 30000; // 30 seconds for full cycle
  const MIN_SENTIMENT = 15; // Minimum sentiment value
  const MAX_SENTIMENT = 85; // Maximum sentiment value
  const SENTIMENT_UPDATE_INTERVAL = 50; // Update every 50ms for smooth transitions

  // Automatic sentiment oscillation
  useEffect(() => {
    const updateSentiment = () => {
      oscillationRef.current += SENTIMENT_UPDATE_INTERVAL;

      // Calculate sentiment using sine wave
      const progress =
        (oscillationRef.current % OSCILLATION_PERIOD) / OSCILLATION_PERIOD;
      const wave = Math.sin(progress * Math.PI * 2);

      // Map wave (-1 to 1) to sentiment range
      const newSentiment =
        ((wave + 1) / 2) * (MAX_SENTIMENT - MIN_SENTIMENT) + MIN_SENTIMENT;

      // Add some random noise for more natural movement
      const noise = Math.random() * 2 - 1; // Random value between -1 and 1
      const finalSentiment = Math.max(
        MIN_SENTIMENT,
        Math.min(MAX_SENTIMENT, newSentiment + noise)
      );

      setSentiment(finalSentiment);
    };

    // Initial update
    updateSentiment();

    // Set up interval for continuous updates
    const intervalId = setInterval(updateSentiment, SENTIMENT_UPDATE_INTERVAL);

    // Reset oscillation every OSCILLATION_PERIOD
    const resetId = setInterval(() => {
      oscillationRef.current = 0;
    }, OSCILLATION_PERIOD);

    return () => {
      clearInterval(intervalId);
      clearInterval(resetId);
    };
  }, []);

  // Update pendulum position based on sentiment value
  useEffect(() => {
    const sentimentDelta = sentiment - prevSentimentRef.current;
    prevSentimentRef.current = sentiment;

    // Map sentiment (0-100) to target amplitude with smooth scaling
    const sentimentDeviation = Math.abs(sentiment - 50);
    const scaleFactor = Math.pow(sentimentDeviation / 50, 1.2); // Non-linear scaling
    const newAmplitude = scaleFactor * MAX_AMPLITUDE;

    // Calculate velocity based on sentiment change rate
    const velocityChange = Math.min(
      Math.abs(sentimentDelta) * VELOCITY_FACTOR,
      MAX_AMPLITUDE * 0.5
    );
    setVelocity((prev) => (prev + velocityChange) * 0.7); // Smooth velocity changes

    // Smoothly transition amplitude
    setAmplitude((prev) => {
      const diff = newAmplitude - prev;
      const smoothing = 0.3; // Smoothing factor
      return prev + diff * smoothing;
    });

    // Dynamic phase adjustment
    if (Math.abs(sentimentDelta) > 2) {
      const phaseShift =
        Math.sign(sentimentDelta) *
        Math.min(Math.abs(sentimentDelta) * 0.02, 0.3);
      setPhase((prev) => prev + phaseShift);
    }
  }, [sentiment]);

  // Animate pendulum using requestAnimationFrame
  useEffect(() => {
    const updatePendulum = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Time in seconds
      lastTimeRef.current = timestamp;

      const time = timestamp / 1000;
      const angularFrequency = NATURAL_FREQUENCY * 2 * Math.PI;

      // Dynamic damping based on amplitude and velocity
      const dynamicDamping =
        BASE_DAMPING_RATIO * (1 + Math.abs(amplitude) / MAX_AMPLITUDE);
      const dampingFactor = Math.exp(-dynamicDamping * time);

      // Calculate sentiment-based bias with smooth transition
      const sentimentBias = (sentiment - 50) / 50;
      const biasedAmplitude = amplitude * sentimentBias;

      // Enhanced angle calculation with spring physics
      const baseAngle =
        biasedAmplitude * Math.cos(angularFrequency * time + phase);
      const velocityComponent =
        velocity * Math.sin(angularFrequency * time) * dampingFactor;

      // Spring force for more natural motion
      const springForce = -SPRING_CONSTANT * baseAngle * (1 - dampingFactor);

      // Combine all forces for final angle
      const angle =
        (baseAngle + velocityComponent + springForce) * dampingFactor;

      // Smooth clamping to prevent sudden stops
      const clampedAngle =
        Math.sign(angle) * Math.min(Math.abs(angle), MAX_AMPLITUDE);

      // Update pendulum position with dynamic easing
      pendulumControls.set({
        rotate: clampedAngle,
        transition: {
          type: "spring",
          stiffness: 100 - Math.abs(clampedAngle) * 0.5, // Dynamic stiffness
          damping: 15 + Math.abs(velocity) * 0.2, // Dynamic damping
        },
      });

      // Gradual velocity decay
      setVelocity((prev) => prev * Math.pow(0.95, deltaTime * 60));

      animationRef.current = requestAnimationFrame(updatePendulum);
    };

    animationRef.current = requestAnimationFrame(updatePendulum);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pendulumControls, amplitude, phase, sentiment, velocity]);

  // Handle click on sentiment scale
  const handleScaleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleWidth = rect.width;
    const newSentiment = (x / scaleWidth) * 100;

    setSentiment(Math.max(0, Math.min(100, newSentiment)));
  };

  // Calculate color based on sentiment
  const getSentimentColor = () => {
    if (sentiment < 30) return "var(--sell-color)";
    if (sentiment > 70) return "var(--buy-color)";
    return "var(--neutral-color)";
  };

  // Update market parameters based on sentiment
  const getMarketParameters = (sentimentValue: number) => {
    if (sentimentValue >= 70) {
      return {
        volatility: "High",
        volume: "Very High",
        trend: "Strong Bullish",
      };
    } else if (sentimentValue >= 60) {
      return {
        volatility: "Medium",
        volume: "High",
        trend: "Bullish",
      };
    } else if (sentimentValue >= 40) {
      return {
        volatility: "Low",
        volume: "Medium",
        trend: "Neutral",
      };
    } else if (sentimentValue >= 30) {
      return {
        volatility: "Medium",
        volume: "High",
        trend: "Bearish",
      };
    } else {
      return {
        volatility: "High",
        volume: "Very High",
        trend: "Strong Bearish",
      };
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Market Sentiment Pendulum</title>
        <meta
          name="description"
          content="Visualize market sentiment with our interactive pendulum"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoText}>MS</span>
          <span className={styles.logoAccent}>Pendulum</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pendulumWrapper}>
          <h1 className={styles.title}>
            Market <span className={styles.accent}>Sentiment</span>
          </h1>

          <div className={styles.pendulumContainer}>
            <div className={styles.marketParameters}>
              {/* Dynamic market parameters */}
              {Object.entries(getMarketParameters(sentiment)).map(
                ([key, value]) => (
                  <div key={key} className={styles.parameter}>
                    <span className={styles.paramLabel}>{key}</span>
                    <span className={styles.paramValue}>{value}</span>
                  </div>
                )
              )}
            </div>

            <div className={styles.sentimentScale} onClick={handleScaleClick}>
              <div className={styles.scaleMarkers}>
                <div className={`${styles.marker} ${styles.sellMarker}`}>
                  <span>Bearish</span>
                </div>
                <div className={`${styles.marker} ${styles.buyMarker}`}>
                  <span>Bullish</span>
                </div>
              </div>

              <div className={styles.pendulumArea}>
                <div className={styles.pendulumMount}>
                  <div className={styles.mountPoint}></div>
                </div>

                <motion.div
                  className={styles.pendulumArm}
                  animate={pendulumControls}
                  style={{ originY: 0, originX: 0.5 }}
                >
                  <div className={styles.pendulumString}>
                    <div className={styles.stringHighlight}></div>
                  </div>
                  <div
                    className={styles.pendulumWeight}
                    style={{
                      boxShadow: `0 5px 25px ${getSentimentColor()}80`,
                    }}
                  >
                    <div className={styles.weightTexture}></div>
                    <div
                      className={styles.weightGlow}
                      style={{ backgroundColor: getSentimentColor() }}
                    ></div>
                  </div>
                </motion.div>
              </div>

              <div className={styles.sentimentMeter}>
                <div
                  className={styles.meterFill}
                  style={{ width: `${sentiment}%` }}
                ></div>
                <div className={styles.meterMarkers}>
                  <div
                    className={styles.meterMarker}
                    style={{ left: "25%" }}
                  ></div>
                  <div
                    className={styles.meterMarker}
                    style={{ left: "50%" }}
                  ></div>
                  <div
                    className={styles.meterMarker}
                    style={{ left: "75%" }}
                  ></div>
                </div>
              </div>

              <div className={styles.sentimentValue}>
                <span>{Math.round(sentiment)}%</span>
                <div className={styles.sentimentLabel}>
                  Market Sentiment
                  <div
                    className={styles.sentimentIndicator}
                    style={{ backgroundColor: getSentimentColor() }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span className={styles.logoText}>MS</span>
          <span className={styles.logoAccent}>Pendulum</span>
        </div>
      </footer>
    </div>
  );
}
