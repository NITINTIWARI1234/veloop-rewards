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

  const [dailyProgress, setDailyProgress] = useState({
    completed: 0,
    limit: 5,
    remaining: 5,
  });

  const challengeCount = transactions.filter(
    (transaction) =>
      transaction.type === "EARN" &&
      transaction.source === "CAPTCHA"
  ).length;

  // -----------------------------
  // FETCH CAPTCHA
  // -----------------------------
  const fetchCaptcha = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/captcha`
      );

      setCaptcha(response.data.captcha);

      setAnswer("");

      setResult("");
    } catch (error) {
      console.log(
        "Failed to fetch CAPTCHA:",
        error.message
      );

      setCaptcha(null);

      setResult(
        error.response?.data?.message ||
          "CAPTCHA is not available."
      );
    }
  };

  // -----------------------------
  // FETCH USER
  // -----------------------------
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/${USER_ID}`
      );

      setGems(response.data.user.gems);

      setStreak(response.data.user.streak);
    } catch (error) {
      console.log(
        "Failed to fetch user:",
        error.message
      );
    }
  };

  // -----------------------------
  // FETCH TRANSACTIONS
  // -----------------------------
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/transactions/${USER_ID}`
      );

      setTransactions(
        response.data.transactions || []
      );
    } catch (error) {
      console.log(
        "Failed to fetch transactions:",
        error.message
      );
    }
  };

  // -----------------------------
  // FETCH DAILY PROGRESS
  // -----------------------------
  const fetchDailyProgress = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/${USER_ID}/daily-progress`
      );

      setDailyProgress(response.data.progress);
    } catch (error) {
      console.log(
        "Failed to fetch daily progress:",
        error.message
      );
    }
  };

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
  useEffect(() => {
    fetchCaptcha();
    fetchUser();
    fetchTransactions();
    fetchDailyProgress();
  }, []);

  // -----------------------------
  // SUBMIT CAPTCHA
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer) {
      setResult("Please select an option.");
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
          captchaId: captcha.id,
          answer: answer,
          userId: USER_ID,
        }
      );

      setResult(response.data.message);

      setGems(response.data.gems);

      setStreak(response.data.streak);

      setAnswer("");

      // Update transactions
      await fetchTransactions();

      // Update daily progress
      await fetchDailyProgress();

      // Get a new CAPTCHA
      await fetchCaptcha();
    } catch (error) {
      setResult(
        error.response?.data?.message ||
          "Verification failed."
      );
    } finally {
      setChecking(false);
    }
  };

  // -----------------------------
  // REFRESH CAPTCHA
  // -----------------------------
  const handleRefresh = async () => {
    if (checking) {
      return;
    }

    setAnswer("");

    setResult("");

    await fetchCaptcha();
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

        <section
          className="earn-section"
          id="earn"
        >

          <div className="earn-content">

            <p className="small-title">
              EARN REWARDS
            </p>

            <h1>
              Complete CAPTCHA
              <br />
              <span>and earn Gems</span>
            </h1>

            <p className="description">
              Complete the CAPTCHA correctly to earn
              rewards. Keep your streak going and collect
              more Gems.
            </p>

            <div className="captcha-card">

              <div className="card-header">

                <h2>CAPTCHA Challenge</h2>

                <span>+1 Gem</span>

              </div>

              <div className="captcha-box">

                <strong>
                  {captcha
                    ? captcha.question
                    : "Loading..."}
                </strong>

                <button
                  type="button"
                  className="refresh-btn"
                  onClick={handleRefresh}
                  disabled={checking}
                >
                  ↻
                </button>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="captcha-options">

                  {captcha?.options?.map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        className={`captcha-option ${
                          answer === option
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          setAnswer(option);
                          setResult("");
                        }}
                        disabled={checking}
                      >
                        {option}
                      </button>
                    )
                  )}

                </div>

                <button
                  type="submit"
                  disabled={
                    checking || !captcha
                  }
                >
                  {checking
                    ? "Checking..."
                    : "Verify & Earn"}
                </button>

              </form>

              {result && (
                <p className="captcha-result">
                  {result}
                </p>
              )}

            </div>

          </div>

          <div className="stats-card">

            <h3>Your Progress</h3>

            <div className="stat">

              <span>🔥 Current Streak</span>

              <strong>
                {streak} Days
              </strong>

            </div>

            <div className="stat">

              <span>💎 Total Gems</span>

              <strong>
                {gems}
              </strong>

            </div>

            <div className="stat">

              <span>🎯 Challenges</span>

              <strong>
                {challengeCount}
              </strong>

            </div>

            <div className="stat">

              <span>📅 Today's Checks</span>

              <strong>
                {dailyProgress.completed} /{" "}
                {dailyProgress.limit}
              </strong>

            </div>

            <div className="stat">

              <span>🎁 Checks Remaining</span>

              <strong>
                {dailyProgress.remaining}
              </strong>

            </div>

          </div>

        </section>

        <section
          className="reward-preview"
          id="rewards"
        >

          <p className="small-title">
            YOUR REWARDS
          </p>

          <h2>
            Turn your Gems into rewards
          </h2>

          <p>
            Complete more challenges and build
            your balance.
          </p>

        </section>

        <section
          className="history-preview"
          id="history"
        >

          <p className="small-title">
            RECENT ACTIVITY
          </p>

          <h2>
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <p>
              No transactions yet.
            </p>
          ) : (
            <div className="transaction-list">

              {transactions.map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction._id}
                  >

                    <div>

                      <strong>
                        {transaction.description}
                      </strong>

                      <p>
                        {transaction.source} •{" "}
                        {new Date(
                          transaction.createdAt
                        ).toLocaleDateString()}
                      </p>

                    </div>

                    <strong>
                      {transaction.type === "EARN"
                        ? "+"
                        : "-"}
                      {transaction.amount} Gem
                    </strong>

                  </div>

                )
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;