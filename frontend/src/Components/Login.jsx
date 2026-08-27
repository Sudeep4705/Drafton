import { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5555/user/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );
      console.log(response.data);
      alert("Login successful");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  const handlesendrecipientByid = async()=>{
  axios.post(
  "http://localhost:5555/email/send/1",
  {},
  { withCredentials: true }
);
  }

  const handlelogout = async()=>{
      axios.post(
  "http://localhost:5555/user/logout",
  {},
  { withCredentials: true}
);
  }
  return (
    <div className="flex flex-col gap-2.5">
      <h1>Test Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <button
        onClick={() => {
          window.location.href = "http://localhost:5555/auth/google";
        }}
        className="bg-green-400 rounded-2xl w-40"
      >
        Connect Gmail
      </button>
      {/* send email by recipeinet id */}
      <button onClick={handlesendrecipientByid} className="bg-amber-400 w-30 rounded-2xl">send email by recipient id</button>
      <button onClick={handlelogout} className="bg-red-600 w-30 rounded-2xl">logout</button>
    </div>
  );
}

export default Login;
