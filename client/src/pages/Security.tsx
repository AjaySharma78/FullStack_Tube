import Updatetext from "../components/Updatetext";
import editText from "../assets/edittext.png";
import { useState } from "react";
import { toast } from "sonner";
import { enable2FA } from "../app/api/authApis";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import QRCardComponent from "../components/QRCardComponent";

const Security = () => {
  const [showEditProfileInfo, setShowEditProfileInfo] = useState(false);
  const [textType, setTextType] = useState<string | null>(null);
  const user = useSelector((state: any) => state.auth.user);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const navigate = useNavigate();

  const handleUpdateTextType = (textType: string) => {
    setTextType(textType);
  };

  const handleEditProfileInfo = () => {
    setShowEditProfileInfo(!showEditProfileInfo);
  };

  const handleUpdateTextTypMFA = () => {
    if (!user.isTwoFactorEnabled) {
      toast.promise(
        new Promise<string>(async (resolve, reject) => {
          try {
            const response = await enable2FA();
            if (response.success) {
              setQrCode(response.data.qrCode);
              setSecret(response.data.secret);
              resolve(response.message);
            } else {
              reject(response.message);
            }
          } catch (error: any) {
            console.log(error);
            reject("Failed to generate 2FA secret");
          }
        }),
        {
          loading: "Generating 2FA secret...",
          success: (message: string) => message,
          error: (message) => message,
        }
      );
    } else {
      navigate("/2fa", { state: { disable2FA: true } });
    }
  };

  const handleNext = () => {
    navigate("/2fa");
    setQrCode("");
  };

  const handleClose = () => {
    setQrCode("");
  };

  return (
    <div className="w-full h-screen p-5">
      {showEditProfileInfo && (
        <Updatetext
          handleClose={handleEditProfileInfo}
          type={textType as "oldPassword"}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold py-4 dark:text-white">
          Security & Privacy
        </h1>
      </div>
      <div className="w-full md:w-1/2 my-5 text-xs md:text-base">
        <table className="min-w-full rounded-md bg-white dark:bg-zinc-700  dark:text-white">
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                Password
              </td>
              <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                ********
              </td>
              <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                <img
                  onClick={() => {
                    handleEditProfileInfo();
                    handleUpdateTextType("oldPassword");
                  }}
                  className="w-5 h-5 cursor-pointer"
                  src={editText}
                  alt="image/png"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4">SetUp MFA</td>
              <td className="py-2 px-4 ">
                {user.isTwoFactorEnabled ? "MFA Enabled" : "MFA Disabled"}
              </td>
              <td className="py-2 px-4 ">
                <label className="relative inline-flex items-center cursor-pointer ">
                  <input
                    type="checkbox"
                    className="sr-only peer "
                    onChange={handleUpdateTextTypMFA}
                    checked={user.isTwoFactorEnabled}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300  dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-purple-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-purple-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        {qrCode && (
          <div>
            <QRCardComponent
              qrCode={qrCode}
              qrSecret={secret}
              handleVerification={handleNext}
              handleClose={handleClose}
            />
            <div className="text-zinc-400">QR will be Disabled in 30s</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
