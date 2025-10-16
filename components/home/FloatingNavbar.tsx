"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useUserContext } from "@/contexts/UserContext";
import { useState } from "react";

const Logo = "/assets/TheHomePage/image/logo.webp";

const FloatingNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useUserContext();
  const [loginHover, setLoginHover] = useState(false);
  const [signupHover, setSignupHover] = useState(false);

  return (
    <>
      <style jsx>{`
        .navbar-container {
          position: relative;
          width: 95%;
          max-width: 1300px;
          height: 90px;
          background: transparent;
        }

        .navbar-background {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #333333;
          border: 2px solid #FFCCDD;
          border-radius: 10px;
          z-index: 1;
          box-sizing: border-box;
        }
      `}</style>

      <div
        style={{
          position: "sticky",
          top: "20px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          width: "100%",
          padding: "0 20px",
        }}
      >
        <div className="navbar-container">
          <div className="navbar-background" style={{ position: "absolute", width: "100%", height: "100%" }} />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              padding: "0 100px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
          {/* Logo */}
          <div
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "60px",
                  height: "50px",
                  background: "#FFCCDD",
                  borderRadius: "10px",
                  zIndex: 0,
                }}
              />
              <Image
                src={Logo}
                alt="HexaPink Logo"
                width={50}
                height={40}
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 600,
                color: "#FFCCDD",
                margin: 0,
                fontFamily: "Kanit, sans-serif",
              }}
            >
              HexaPink
            </h2>
          </div>

          {/* Navigation Buttons */}
          {pathname === "/" && (
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              {currentUser ? (
                <>
                  <button
                    onClick={() =>
                      router.push(currentUser.role === "admin" ? "/admin" : "/user")
                    }
                    style={{
                      padding: "12px 28px",
                      backgroundColor: "transparent",
                      border: "2px solid #FFCCDD",
                      color: "#FFCCDD",
                      fontSize: "16px",
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "all 0.3s",
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      padding: "12px 28px",
                      backgroundColor: "#FF6699",
                      border: "2px solid #FF6699",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "all 0.3s",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Login Button - clean flat */}
                  <button
                    onClick={() => router.push("/login")}
                    onMouseEnter={() => setLoginHover(true)}
                    onMouseLeave={() => setLoginHover(false)}
                    style={{
                      padding: "12px 28px",
                      backgroundColor: loginHover ? "white" : "transparent",
                      border: "2px solid #FFCCDD",
                      color: loginHover ? "#333333" : "#FFCCDD",
                      fontSize: "16px",
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "all 0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.25 12H12.75"
                        stroke={loginHover ? "#333333" : "#FFCCDD"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 8.25L12.75 12L9 15.75"
                        stroke={loginHover ? "#333333" : "#FFCCDD"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.75 3.75H18.75V20.25H12.75"
                        stroke={loginHover ? "#333333" : "#FFCCDD"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Log In</span>
                  </button>

                  {/* Signup Button - clean flat */}
                  <button
                    onClick={() => router.push("/signup/1")}
                    onMouseEnter={() => setSignupHover(true)}
                    onMouseLeave={() => setSignupHover(false)}
                    style={{
                      padding: "12px 28px",
                      backgroundColor: signupHover ? "white" : "#FF6699",
                      border: "2px solid #FFCCDD",
                      color: signupHover ? "#333333" : "white",
                      fontSize: "16px",
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "all 0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18.75 12.75H23.25"
                        stroke={signupHover ? "#333333" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 10.5V15"
                        stroke={signupHover ? "#333333" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.125 15C13.2316 15 15.75 12.4816 15.75 9.375C15.75 6.2684 13.2316 3.75 10.125 3.75C7.0184 3.75 4.5 6.2684 4.5 9.375C4.5 12.4816 7.0184 15 10.125 15Z"
                        stroke={signupHover ? "#333333" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.25 18.75C4.17656 16.4578 6.89625 15 10.125 15C13.3537 15 16.0734 16.4578 18 18.75"
                        stroke={signupHover ? "#333333" : "white"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Create Account</span>
                  </button>
                </>
              )}
            </div>
          )}

          {pathname === "/login" && (
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "transparent",
                  border: "2px solid #FFCCDD",
                  color: "#FFCCDD",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
              >
                Home
              </button>
              <button
                onClick={() => router.push("/signup/1")}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#FF6699",
                  border: "2px solid #FFCCDD",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {(pathname === "/signup/1" ||
            pathname === "/forgot-password" ||
            pathname === "/reset-password") && (
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "transparent",
                  border: "2px solid #FFCCDD",
                  color: "#FFCCDD",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
              >
                Home
              </button>
              <button
                onClick={() => router.push("/login")}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "transparent",
                  border: "2px solid #FFCCDD",
                  color: "#FFCCDD",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
              >
                Log In
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingNavbar;
