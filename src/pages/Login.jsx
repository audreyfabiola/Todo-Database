import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logInWithEmailAndPassword, signInWithGoogle } from "../firebase";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    try {
      await logInWithEmailAndPassword(email, password);
      toast.success("Login successful!");
      console.log("Redirecting to /todo...");
      // Redirect to welcome page after successful login
      navigate("/homepage");
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        toast.error("Invalid email or password");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else {
        toast.error("Invalid email or password");
      }

      setFormData({ email: "", password: "" });
      setShowPassword(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Google login successful!");
      console.log("Redirecting to /todo...");
      // Redirect to welcome page after successful login
      navigate("/homepage");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      toast.error("Error logging in with Google");
    }
  };
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-96">
        <div className="bg-white p-10 rounded-lg shadow-xl">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-pink-400"> Login </h1>
            {/* Login form */}
            <form className="mt-4">
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="border rounded-md p-2 w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="border rounded-md p-2 w-full pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 mt-2 mr-2 focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"} 
                </button>
              </div>

              {/* Login button */}
              <button 
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-full mt-4 w-full" 
                onClick={handleLogin}
              >
                Login
              </button>

            {/* Horizontal line with "or" */}
            <div className="flex items-center mt-4">
              <hr className="flex-grow border-gray-300 mr-4" />
              <span className="text-gray-500">or</span>
              <hr className="flex-grow border-gray-300 ml-4" />
            </div>

            {/* Login with Google button */}
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="text-white bg-pink-500 hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-500/50 font-bold py-2 px-4 rounded-full mt-4 w-full text-center inline-flex items-center justify-center dark:focus:ring-pink-500/55 me-2 mb-2"
            >
              <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
              </svg>
              Login with Google
            </button>

            </form>

            {/* Sign up link */}
            <p className="text-sm text-pink-700 mt-2">
              <span className="text-black">Don't have an account? </span>
              <Link to="/signup" className="hover:underline">
                Sign up here.
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
