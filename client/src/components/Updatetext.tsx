import { selectCurrentUser, setUser } from "../app/api/slice/authSlice";
import { useForm, SubmitHandler } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input } from "../components/Index";
import { useState } from "react";
import {
  changePassword,
  resendVerificationEmail,
  updateUserInfo,
} from "../app/api/authApis";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProfileInfo {
  userName: string;
  email: string;
  fullName: string;
  resendMail: string;
  oldPassword: string;
  newPassword: string;
}

interface UpdateText {
  handleClose: () => void;
  type:
    | "userName"
    | "email"
    | "fullName"
    | "resendMail"
    | "oldPassword"
    | "newPassword";
}

const Updatetext: React.FC<UpdateText> = ({ handleClose, type }) => {
  const { register, handleSubmit, formState } = useForm<ProfileInfo>();
  const user = useSelector(selectCurrentUser);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { errors } = formState;

  const onSubmit: SubmitHandler<ProfileInfo> = async (data) => {
    if (type === "userName" && data.userName === user?.userName) {
      toast.warning("Username is same as the current username");
      setError("Username is same as the current username");
      return;
    } else if (type === "email" && data.email === user?.email) {
      toast.warning("Email is same as the current email");
      setError("Email is same as the current email");
      return;
    } else if (type === "fullName" && data.fullName === user?.fullName) {
      toast.warning("Full Name is same as the current Full Name");
      setError("Full Name is same as the current Full Name");
      return;
    }
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          let response;
          if (type === "resendMail") {
            response = await resendVerificationEmail(data.resendMail);
          } else if (type === "oldPassword") {
            response = await changePassword(data.oldPassword, data.newPassword);
          } else {
            response = await updateUserInfo(data);
          }
          if (
            response.message ===
            "You can only change your username once every three months"
          ) {
            reject(response.message);
            setError(response.message);
            return;
          }
          if (type === "fullName") {
            if (!response.success) {
              reject(response.message);
            }
            resolve(response.message);
            dispatch(
              setUser({
                ...user,
                fullName: response.data.user.fullName,
              })
            );
          } else if (type === "userName") {
            console.log(response);
            if (!response.success) {
              reject(response.message);
            }
            resolve(response.message);
            dispatch(
              setUser({
                ...user,
                userName: response.data.user.userName,
              })
            );
          } else if (type === "email") {
            if (!response.success) {
              reject(response.message);
            }
            resolve(response.message);
            dispatch(
              setUser({
                ...user,
                email: response.data.user.email,
              })
            );
          } else if (type === "resendMail") {
            if (!response.success) {
              reject(response.message);
            }
            resolve(response.message);
            navigate("/login");
          } else {
            if (!response.success) {
              reject(response.message);
            }
            resolve(response.message);
          }
          handleClose();
        } catch (error) {
          reject("Failed to update");
          console.error("Error updating profile info:", error);
        }
      }),
      {
        loading: `Updating ${type}...`,
        success: (message: string) => message,
        error: (message: string) => message,
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-200 dark:bg-zinc-800 p-6 rounded-lg shadow-lg w-11/12 lg:w-1/3 max-w-md">
        <div className="relative flex justify-between items-center">
          {error && (
            <p className="text-red-500 text-xs absolute -inset-4">{error}</p>
          )}
          <h2 className="text-lg font-bold mb-4 dark:text-zinc-400 ">Update {type}</h2>
          <button className="z-10 dark:text-white hover:text-red-500 dark:hover:text-red-500" onClick={() => handleClose()}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            className="py-2 text-sm px-2"
            label={`Enter ${type}:`}
            type={
              type === "email"
                ? "email"
                : type === "oldPassword"
                ? "password"
                : "text"
            }
            defaultValue={
              type === "oldPassword"
                ? ""
                : type === "resendMail"
                ? ""
                : type === "newPassword"
                ? ""
                : user?.[type]
            }
            {...register(type, {
              required: `${type} is required.`,
              ...(type === "email" && {
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              }),
              ...(type === "oldPassword" && {
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                validate: {
                  hasNumber: (value) =>
                    /\d/.test(value) ||
                    "Password must contain at least one number",
                  hasLetter: (value) =>
                    /[a-zA-Z]/.test(value) ||
                    "Password must contain at least one letter",
                  hasUpperCase: (value) =>
                    /[A-Z]/.test(value) ||
                    "Password must contain at least one uppercase letter",
                  hasLowerCase: (value) =>
                    /[a-z]/.test(value) ||
                    "Password must contain at least one lowercase letter",
                  hasSpecialChar: (value) =>
                    /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                    "Password must contain at least one special character",
                },
              }),
            })}
            mess={errors[type]?.message}
          />
          {type === "oldPassword" && (
            <Input
              className="py-2 text-sm px-2"
              label="Enter newPassword:"
              type="password"
              {...register("newPassword", {
                required: "Confirm Password is required.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                validate: {
                  hasNumber: (value) =>
                    /\d/.test(value) ||
                    "Password must contain at least one number",
                  hasLetter: (value) =>
                    /[a-zA-Z]/.test(value) ||
                    "Password must contain at least one letter",
                },
              })}
              mess={errors.newPassword?.message}
            />
          )}
          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              bgColor="hover:bg-purple-500 bg-purple-400 rounded-md"
              className="w-full"
            >
              {type === "resendMail"
                ? "Send"
                : type === "oldPassword"
                ? "Change"
                : "Save"}{" "}
              {type}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Updatetext;
