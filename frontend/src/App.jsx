import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Navbar from "./components/Navbar";

const API_URL = "http://localhost:5000";

const savedUser = JSON.parse(
  localStorage.getItem("veloopUser") || "null"
);

const USER_ID = savedUser?.id;

function App() {
  const [captcha, setCaptcha] = useState(null);

  const [answer, setAnswer] = useState("");

  const [result, setResult] = useState("");

  const [checking, setChecking] = useState(false);

  const [recentEarnings, setRecentEarnings] = useState([]);

  const [gems, setGems] = useState(0);

  const [streak, setStreak] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);

  const [dailyProgress, setDailyProgress] = useState({
    completed: 0,
    limit: 5,
    remaining: 5,
  });

  const [walletSummary, setWalletSummary] = useState({
    currentGems: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    calculatedBalance: 0,
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




  const fetchWalletSummary = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/transactions/${USER_ID}/wallet-summary`
      );

      setWalletSummary(response.data.wallet);
    } catch (error) {
      console.log(
        "Failed to fetch wallet summary:",
        error.message
      );
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/rewards`
      );

      setRewards(response.data.rewards);
    } catch (error) {
      console.log(
        "Failed to fetch rewards:",
        error.message
      );
    }
  };

  const handleRedeem = async (rewardId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/rewards/redeem`,
        {
          userId: USER_ID,
          rewardId: rewardId,
        }
      );

      setGems(response.data.gems);
      setResult(response.data.message);

      fetchTransactions();
      fetchWalletSummary();
    } catch (error) {
      setResult(
        error.response?.data?.message || "Redemption failed."
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

    if (!USER_ID) {
      window.location.replace("/login");
      return;
    }



    fetchCaptcha();
    fetchUser();
    fetchTransactions();
    fetchDailyProgress();
    fetchRewards();

    fetchWalletSummary();
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



      // Update wallet summary
      await fetchWalletSummary();

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

      <Navbar gems={gems} />




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
                        className={`captcha-option ${answer === option
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
              <span>📈 Total Earned</span>
              <strong>{walletSummary.totalEarned}</strong>
            </div>

            <div className="stat">
              <span>🎁 Total Redeemed</span>
              <strong>{walletSummary.totalRedeemed}</strong>
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

        <section className="reward-preview" id="rewards">
          <p className="small-title">YOUR REWARDS</p>
          <h2>Turn your Gems into rewards</h2>
          <p>
            Complete more challenges and build your balance.
          </p>

          <div className="reward-list">
            {rewards.length === 0 ? (
              <p>Loading rewards...</p>
            ) : (
              rewards.map((reward) => (
                <div className="reward-item" key={reward._id}>
                  <div>
                    <h3>{reward.name}</h3>
                    <p>{reward.description}</p>
                  </div>

                  <div className="reward-action">
                    <div className="reward-cost">
                      💎 {reward.cost}
                    </div>

                    <button
                      type="button"
                      className="redeem-btn"
                      disabled={gems < reward.cost}
                      onClick={() => handleRedeem(reward._id)}
                    >
                      {gems < reward.cost ? "Not enough Gems" : "Redeem"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>




        <section className="wallet-overview">
          <p className="small-title">YOUR WALLET</p>
          <h2>Wallet Overview</h2>
          <p className="wallet-description">
            Track your Gems and rewards in one place.
          </p>

          <div className="wallet-summary-grid">
            <div className="wallet-summary-card earned-card">
              <div className="wallet-card-icon">📈</div>
              <p>Total Earned</p>
              <h3>{walletSummary.totalEarned} <span>Gems</span></h3>
              <small>Your lifetime earnings</small>
            </div>

            <div className="wallet-summary-card redeemed-card">
              <div className="wallet-card-icon">🎁</div>
              <p>Total Redeemed</p>
              <h3>{walletSummary.totalRedeemed} <span>Gems</span></h3>
              <small>Gems spent on rewards</small>
            </div>

            <div className="wallet-summary-card balance-card">
              <div className="wallet-card-icon">💎</div>
              <p>Current Balance</p>
              <h3>{walletSummary.currentGems} <span>Gems</span></h3>
              <small>Available to redeem</small>
            </div>
          </div>
        </section>



        <section className="history-preview" id="history">
          <div className="history-heading">
            <div>
              <p className="small-title">YOUR ACTIVITY</p>
              <h2>Transaction History</h2>
              <p className="history-subtitle">
                Keep track of your Gems earned and redeemed.
              </p>
            </div>

            <div className="history-count">
              {transactions.length} transactions
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="history-empty">
              <span>💎</span>
              <h3>No activity yet</h3>
              <p>Complete a CAPTCHA to see your first transaction here.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => {
                const isEarned = transaction.type === "EARN";

                return (
                  <div
                    className="transaction-item"
                    key={transaction._id}
                  >
                    <div className={`transaction-icon ${isEarned ? "icon-earned" : "icon-redeemed"}`}>
                      {isEarned ? "↗" : "🎁"}
                    </div>

                    <div className="transaction-details">
                      <strong>{transaction.description}</strong>
                      <p>
                        {transaction.source === "CAPTCHA"
                          ? "CAPTCHA Challenge"
                          : transaction.source === "REWARD"
                            ? "Reward Redemption"
                            : transaction.source}
                        {" · "}
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`transaction-status ${isEarned ? "status-earned" : "status-redeemed"}`}>
                        {isEarned ? "✓ Gems earned" : "✓ Reward redeemed"}
                      </span>
                    </div>

                    <div className={`transaction-amount ${isEarned ? "amount-earned" : "amount-redeemed"}`}>
                      {isEarned ? "+" : "-"}{transaction.amount}
                      <span>Gems</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>


      </main>

    </div >
  );
}

export default App;