import React from "react";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";


const Login = () => {
  const [email, setEmail] = useState("meena89@gmail.com");
  const [password, setPassword] = useState("Meena@123");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      // const res = await fetch("http://localhost:3000/login", {
      const res = await axios.post(
        BASE_URL+"/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      console.log(res.data);
      dispatch(addUser(res.data));
     navigate("/");
      // dispatch({ type: "user/login", payload: res.data });
      // console.log(res);
    } catch (err) {
      // console.log(err?.response?.message)
      console.log(err?.response?.message || "Something went wrong");
      setError(err?.response?.data?.data || "Something went wrong");
      // console.error("Error during login:", err);
    }
  };

  return (
    <div className="flex justify-center my-10">
      <div className="card card-border bg-base-300 w-96">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>
          <fieldset className="fieldset">
            {/* <legend className="fieldset-legend">Email ID:</legend> */}
            <input
              type="text"
              value={email}
              className="input"
              placeholder="Email ID"
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="label">Mandatory</p>
          </fieldset>
          <fieldset className="fieldset">
            {/* <legend className="fieldset-legend">Email ID:</legend> */}
            <input
              value={password}
              type="text"
              className="input"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="label">Mandatory</p>
          </fieldset>
          <p className="text-red-500">{error}</p>
          <div className="card-actions justify-center">
            <button className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
