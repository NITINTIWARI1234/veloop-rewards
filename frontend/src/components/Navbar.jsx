import "./Navbar.css";

function Navbar({ gems }) {
  return (
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
  );
}

export default Navbar;