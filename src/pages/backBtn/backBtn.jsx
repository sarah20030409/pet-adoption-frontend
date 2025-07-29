import React from "react";
import { useNavigate } from "react-router-dom";
import "./backBtn.css";

export default function BackBtn({ path, morePid = false }) {
  const navigate = useNavigate();

  const fromMoreBack = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/back`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        console.log("morePid");
        localStorage.removeItem("morePid");
        navigate(path);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBack = () => {
    navigate(path);
  };

  return (
    <button
      type="button"
      className={`backBtn`}
      onClick={morePid ? fromMoreBack : handleBack}
    >
      ←
    </button>
  );
}
