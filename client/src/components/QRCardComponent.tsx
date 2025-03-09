import { toast } from "sonner";
import Button from "./Button";

import React from "react";
import Input from "./Input";

interface QRCardComponentProps {
  qrCode: string;
  qrSecret: string;
  handleVerification: () => void;
  handleClose: () => void;
}

const QRCardComponent: React.FC<QRCardComponentProps> = ({
  qrCode,
  qrSecret,
  handleVerification,
  handleClose
}) => {
  const copyClipBoard = () => {
    navigator.clipboard.writeText(qrSecret);
    toast.success("Copied to clipboard");
  };  


  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-zinc-800 dark:text-zinc-400 w-11/12 lg:w-1/3 max-w-md  p-5 rounded-lg flex flex-col justify-center items-center">
        <h1 className="pb-2 text-2xl border-b border-zinc-400 w-full text-center relative">Turn on 2FA Verification<span className="hover:text-red-500 absolute right-0 text-xl cursor-pointer" onClick={handleClose}>X</span></h1>
        <h3 className="pb-2 text-xl">Scan the QR code</h3>
        <div className="w-40 pb-2">{qrCode && <img src={qrCode} alt="2FA QR CODE" />}</div>
          <h1>Enter QR code manually</h1>
        <div className="py-2 w-full">
          <Input className="p-2" readOnly onClick={copyClipBoard} value={qrSecret} />
        </div>
        <Button className="w-full rounded-t-md " onClick={handleVerification}>Continue to Verification</Button>
      </div>
    </div>
  );
};

export default QRCardComponent;
