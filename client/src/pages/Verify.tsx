import { verifyEmail as verify } from "../app/api/authApis.ts";
import Container from "../components/Container/Container.tsx";
import Updatetext from "../components/Updatetext";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.tsx";
import React, { useState } from "react";
import image from "../assets/terms.png";
import { toast } from "sonner";

function Verify() {
  const [showEditProfileInfo, setShowEditProfileInfo] = useState(false);
  const [textType, setTextType] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [resend, setResend] = React.useState(false);
  const navigate = useNavigate();

  const verifyEmail = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          setLoading(true);
          if (token) {
            const response = await verify(token ? token : "");
            if (response.message === "Invalid token or token expired") {
              reject(
                "User with the requested ID could not be found.Looks like the link is invalid or expired."
              );
              setResend(true);
            } else if (
              response.message === "User email verified successfully"
            ) {
              resolve("User email verified successfully");
              navigate("/login");
            }
          }
        } catch (error) {
          setLoading(false);
          reject(
            "User with the requested ID could not be found.Looks like the link is invalid or expired. Please try again after login ."
          );
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: "Verifying Email...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    );
  };

  const handleUpdateTextType = (textType: string) => {
    setTextType(textType);
  };

  const handleEditProfileInfo = () => {
    setShowEditProfileInfo(!showEditProfileInfo);
  };
  
  return (
    <>
      <div className="w-full h-full">
        {showEditProfileInfo && (
          <Updatetext
            handleClose={handleEditProfileInfo}
            type={textType as "userName" | "fullName" | "email" | "resendMail"}
          />
        )}
        <Container className="h-screen flex flex-wrap justify-center items-center ">
          <div className="bg-stone-950 p-5 rounded-lg border relative">
            {resend && (
              <div
                onClick={() => {
                  handleEditProfileInfo();
                  handleUpdateTextType("resendMail");
                }}
                className="absolute text-center text-red-500 underline cursor-pointer"
              >
                Resend Verification mail.{" "}
              </div>
            )}
            <div>
              <img src={image} alt="image" width="500px" />
            </div>
            <div className="flex flex-wrap justify-center ">
              <Button
                className=" w-2/4 py-1 md:py-2 rounded-md text-center"
                bgColor="bg-purple-400 hover:bg-purple-500"
                onClick={verifyEmail}
              >
                {loading ? "Loading...." : "Verify Email"}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default Verify;
