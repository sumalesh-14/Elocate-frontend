import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { setEmail, setPhoneNumber, setToken, setUser, setUserID, setUserName, setfullname } from "./auth";

const Signin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const login = async () => {
    toast.loading("Loading..")
    try {
      // --- DUMMY AUTHENTICATION START ---
      // Comment out this block and uncomment the API call below for production
      const user = {
        id: "dummy-citizen-id-789",
        email: formData.email || "citizen@elocate.com",
        token: "dummy-citizen-token",
        phoneNumber: "7777777777",
        fullname: "Citizen User",
        username: "citizenuser",
      };

      /* ORIGINAL API CALL - Uncomment for production
      const response = await axios.post(
        "http://localhost:8080/elocate/api/v1/auth/login",
        formData
      );
      const user = response.data;
      */
      // --- DUMMY AUTHENTICATION END ---

      console.log(user);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login Successful!");

      if (user) {
        setUser(user);
        setEmail(user.email);
        setToken(user.token)
        setPhoneNumber(user.phoneNumber);
        setfullname(user.fullname);
        setUserID(user.id);
        if (user.username) {
          setUserName(user.username);
        }
      }

      window.location.href = "/citizen";
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login Failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center md:h-screen h-[70vh]">
      <div className="relative flex flex-col bg-white shadow-2xl rounded-2xl md:flex-row">

        {/* ✅ FORM CONTAINER */}
        <div
          className="
          flex flex-col justify-center
          p-10 md:p-16
          w-[420px] md:w-[480px]
          text-[1.15rem]
        "
        >
          <span className="mb-4 text-4xl font-bold">
            Welcome back
          </span>

          <span className="font-light text-gray-400 mb-10">
            Welcome back! Please enter your details
          </span>

          <form className="py-4">
            <span className="mb-2 block text-lg">Email</span>
            <input
              type="text"
              className="w-full p-4 text-lg rounded-md border"
              name="email"
              placeholder="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </form>

          <div className="py-4">
            <span className="mb-2 block text-lg">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="password"
              className="w-full p-4 text-lg rounded-md border"
              onChange={handleInputChange}
              value={formData.password}
            />
          </div>

          <div className="flex justify-between w-full py-6 text-base">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 scale-125"
                onClick={togglePasswordVisibility}
              />
              Show Password
            </label>

            <Link href="/citizen/forget-password" className="font-bold">
              Forgot password?
            </Link>
          </div>

          <button
            className="w-full bg-black mt-4 text-white py-4 text-xl rounded-lg hover:bg-emerald-400"
            onClick={login}
          >
            Sign in
          </button>

          <div className="text-center text-gray-400 mt-6 text-base">
            Don&apos;t have an account?
            <Link href="/citizen/sign-up" className="font-bold ml-1">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Signin;

