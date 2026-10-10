
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./Auth.css";

const API_URL = "http://localhost:5000";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    email: email.trim().toLowerCase(),
                    password,
                }
            );

            if (response.data.success) {
                localStorage.setItem(
                    "veloopUser",
                    JSON.stringify(response.data.user)
                );

                navigate("/dashboard");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setError("");
            setLoading(true);

            const response = await axios.post(
                `${API_URL}/api/auth/google`,
                {
                    credential: credentialResponse.credential,
                }
            );

            if (response.data.success) {
                localStorage.setItem(
                    "veloopUser",
                    JSON.stringify(response.data.user)
                );

                navigate("/dashboard");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Google login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Welcome Back</h1>
                <p>Login to continue to VELOop Rewards</p>

                <form onSubmit={handleLogin}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />


                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className="auth-divider">OR</div>

                <div className="google-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() =>
                            setError("Google sign-in was unsuccessful.")
                        }
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width="320"
                    />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <p className="auth-footer">
                    Don't have an account? <Link to="/">Create Account</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;
