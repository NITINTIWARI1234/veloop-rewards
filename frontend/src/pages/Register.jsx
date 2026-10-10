
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./Auth.css";

const API_URL = "http://localhost:5000";

function Register() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(`${API_URL}/api/auth/register`, {
                username: form.username,
                email: form.email,
                password: form.password,
            });

            if (response.data.success) {
                localStorage.setItem(
                    "veloopUser",
                    JSON.stringify(response.data.user)
                );

                alert("Account created successfully!");
                navigate("/dashboard");
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleSuccess = async (credentialResponse) => {
        try {
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
    console.error("Google sign-in error:", error);

    alert(
        error.response?.data?.message ||
        "Google sign-in failed. Please try again."
    );
} finally {
    setLoading(false);
}
    };

return (
    <main className="auth-page">
        <section className="auth-card">
            <Link to="/" className="auth-brand">
                VELOOP <span>Rewards</span>
            </Link>

            <h1>Create Account</h1>

            <p className="auth-subtitle">
                Join VELOOP Rewards and start earning
            </p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                />

                <label htmlFor="confirmPassword">
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    minLength={8}
                    required
                />

                <button
                    className="auth-submit"
                    type="submit"
                    disabled={loading}
                >
                    Create Account
                </button>
            </form>

            <div className="auth-divider">
                <span>Or</span>
            </div>

            <div className="google-login">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() =>
                        alert("Google sign-in failed. Please try again.")
                    }
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    width="320"
                />
            </div>

            {loading && (
                <p className="auth-subtitle">
                    Signing in with Google...
                </p>
            )}

            <p className="auth-footer">
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>

            <p className="auth-copyright">
                © 2026 VELOOP
            </p>
        </section>
    </main>
);
}

export default Register;
