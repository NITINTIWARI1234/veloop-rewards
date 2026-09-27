
import { useState } from "react";
import "./App.css";

function App() {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = (e) => {
    const handleSubmit = (e) => {
      e.preventDefault();

      if (!answer.trim()) {
        setResult("Please enter the CAPTCHA.");
        return;
      }

      setChecking(true);
      setResult("");

      setTimeout(() => {
        if (answer.trim().toUpperCase() === "AB7K9") {
          setResult("Correct! You earned +1 Gem.");
        } else {
          setResult("Wrong CAPTCHA. You earned +0.5 Gem.");
        }

        setChecking(false);
        setAnswer("");
      }, 800);
    };

    if (answer.trim().toUpperCase() === "AB7K9") {
      setResult("Correct! You earned +1 Gem.");
    } else {
      setResult("Wrong CAPTCHA. You earned +0.5 Gem.");
    }

    setAnswer("");
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          VELOop <span>Rewards</span>
        </div>

        <nav>
          <a href="#earn">Earn</a>
          <a href="#rewards">Rewards</a>
          <a href="#history">History</a>
        </nav>

        <div className="wallet">
          💎 <span>0 Gems</span>
        </div>
      </header>

      <main>
        <section className="earn-section" id="earn">
          <div className="earn-content">
            <p className="small-title">EARN REWARDS</p>

            <h1>
              Complete CAPTCHA
              <br />
              <span>and earn Gems</span>
            </h1>

            <p className="description">
              Complete the CAPTCHA correctly to earn rewards.
              Keep your streak going and collect more Gems.
            </p>

            <div className="captcha-card">
              <div className="card-header">
                <h2>CAPTCHA Challenge</h2>
                <span>+1 Gem</span>
              </div>

              <div className="captcha-box">
                <strong>AB7K9</strong>

                <button
                  type="button"
                  className="refresh-btn"
                  onClick={() => {
                    setResult("New CAPTCHA generated.");
                    setAnswer("");
                  }}
                >
                  ↻
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Enter CAPTCHA"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setResult("");
                  }}
                />

                <button type="submit">
                  Verify & Earn
                </button>
              </form>

              {result && <p className="captcha-result">{result}</p>}
            </div>
          </div>

          <div className="stats-card">
            <h3>Your Progress</h3>

            <div className="stat">
              <span>🔥 Current Streak</span>
              <strong>0 Days</strong>
            </div>

            <div className="stat">
              <span>💎 Total Gems</span>
              <strong>0</strong>
            </div>

            <div className="stat">
              <span>🎯 Challenges</span>
              <strong>0</strong>
            </div>
          </div>
        </section>

        <section className="reward-preview" id="rewards">
          <p className="small-title">YOUR REWARDS</p>
          <h2>Turn your Gems into rewards</h2>
          <p>
            Complete more challenges and build your balance.
          </p>
        </section>

        <section className="history-preview" id="history">
          <p className="small-title">RECENT ACTIVITY</p>
          <h2>Transaction History</h2>
          <p>No transactions yet.</p>
        </section>
      </main>
    </div>
  );
}

export default App;

