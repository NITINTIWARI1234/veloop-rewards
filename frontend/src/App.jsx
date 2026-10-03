import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000";
const USER_ID = "6abcd9743be173662986f0b0";

function App() {
  const [captcha, setCaptcha] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [checking, setChecking] = useState(false);
  const [gems, setGems] = useState(0);
  const [streak, setStreak] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const challengeCount = transactions.filter(
    (transaction) =>
      transaction.type === "EARN" &&
      transaction.source === "CAPTCHA"
  ).length;

  const fetchCaptcha = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/captcha`);
      setCaptcha(response.data.captcha);
    } catch (error) {
      console.log("Failed to fetch CAPTCHA:", error.message);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/${USER_ID}`
      );

      setGems(response.data.user.gems);
      setStreak(response.data.user.streak);
    } catch (error) {
      console.log("Failed to fetch user:", error.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/transactions/${USER_ID}`
      );

      setTransactions(response.data.transactions);
    } catch (error) {
      console.log(
        "Failed to fetch transactions:",
        error.message
      );
    }
  };

  useEffect(() => {
    fetchCaptcha();
    fetchUser();
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer.trim()) {
      setResult("Please enter the CAPTCHA.");
      return;
    }

    if (!captcha) {
      setResult("CAPTCHA is not available.");
      return;
    }

    setChecking(true);
    setResult("");

    try {
      const response = await axios.post(
        `${API_URL}/api/captcha/verify`,
        {
          captchaId: captcha._id,
          answer: answer,
          userId: USER_ID,
        }
      );

      setResult(response.data.message);
      setGems(response.data.gems);
      setStreak(response.data.streak);

      setAnswer("");

      // Get a new CAPTCHA after successful verification
      fetchCaptcha();
      fetchTransactions();
    } catch (error) {
      setResult(
        error.response?.data?.message || "Verification failed."
      );
    } finally {
      setChecking(false);
    }
  };

  const handleRefresh = () => {
    fetchCaptcha();
    setResult("New CAPTCHA generated.");
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
          💎 <span>{gems} Gems</span>
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
                <strong>
                  {captcha ? captcha.question : "Loading..."}
                </strong>

                <button
                  type="button"
                  className="refresh-btn"
                  onClick={handleRefresh}
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

                <button type="submit" disabled={checking}>
                  {checking ? "Checking..." : "Verify & Earn"}
                </button>
              </form>

              {result && (
                <p className="captcha-result">{result}</p>
              )}
            </div>
          </div>

          <div className="stats-card">
            <h3>Your Progress</h3>

            <div className="stat">
              <span>🔥 Current Streak</span>
              <strong>{streak} Days</strong>
            </div>

            <div className="stat">
              <span>💎 Total Gems</span>
              <strong>{gems}</strong>
            </div>

            <div className="stat">
              <span>🎯 Challenges</span>
              <strong>{challengeCount}</strong>
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

          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div
                  className="transaction-item"
                  key={transaction._id}
                >
                  <div>
                    <strong>{transaction.description}</strong>
                    <p>
                      {transaction.source} •{" "}
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <strong>
                    {transaction.type === "EARN" ? "+" : "-"}
                    {transaction.amount} Gem
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;