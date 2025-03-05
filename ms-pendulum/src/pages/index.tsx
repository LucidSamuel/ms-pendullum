import { useState, useEffect } from "react";
import Head from "next/head";
import { motion, useAnimation } from "framer-motion";
import styles from "../styles/Home.module.scss";

export default function Home() {
  const [sentiment, setSentiment] = useState(50);
  const pendulumControls = useAnimation();

  // Update pendulum position based on sentiment value
  useEffect(() => {
    // Map sentiment (0-100) to rotation (-45 to 45 degrees)
    const rotation = ((sentiment - 50) / 50) * 45;

    pendulumControls.start({
      rotate: rotation,
      transition: { type: "spring", stiffness: 50, damping: 15 },
    });
  }, [sentiment, pendulumControls]);

  // Simulate market sentiment changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Random walk algorithm for realistic sentiment changes
      const change = (Math.random() - 0.5) * 5; // Random change between -2.5 and 2.5
      setSentiment((prev) => {
        const newValue = Math.max(0, Math.min(100, prev + change));
        return newValue;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
              <div className={styles.parameter}>
                <span className={styles.paramLabel}>Volatility</span>
                <span className={styles.paramValue}>Medium</span>
              </div>
              <div className={styles.parameter}>
                <span className={styles.paramLabel}>Volume</span>
                <span className={styles.paramValue}>High</span>
              </div>
              <div className={styles.parameter}>
                <span className={styles.paramLabel}>Trend</span>
                <span className={styles.paramValue}>Bullish</span>
              </div>
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

              <div className={styles.pendulumFrame}>
                <div className={styles.frameTop}></div>
                <div className={styles.frameLeft}></div>
                <div className={styles.frameRight}></div>
                <div className={styles.frameShadow}></div>
              </div>

              <div className={styles.pendulumBase}>
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
