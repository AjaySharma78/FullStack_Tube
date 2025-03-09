import CryptoJS from "crypto-js";
import config from "../env/config";

export const truncateTitle = (title: string, length?: number) => {
  const words = title.split(" ");
  if (words.length > 3) {
    return words.slice(0, length ? length : 6).join(" ") + "...";
  }
  return title;
};

export const formatCount = (views: number) => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

export const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.round(duration) % 60;
  return `${hours > 0 ? `${hours}:` : ""}${
    minutes < 10 && hours > 0 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

export const formatWhenPosted = (date: string) => {
  const postDate = new Date(date);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - postDate.getTime();
  const hoursDifference = Math.floor(timeDifference / (1000 * 3600));
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  if (daysDifference > 0) {
    return `${daysDifference} days ago`;
  } else if (hoursDifference > 0) {
    return `${hoursDifference} hours ago`;
  } else {
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    return `${minutesDifference} minutes ago`;
  }
};

export const addComman = (count: number) => {
  return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const shuffleArray = (array: any) => {
  let shuffled = array.slice(1);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return [array[0], ...shuffled];
};

export const formatViews = (views: number) => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

export const encryptData = (data: any) => {
  if (data === null || data === undefined) return "null";
  return encodeURIComponent(
    CryptoJS.AES.encrypt(JSON.stringify(data), config.cryptoSecrete).toString()
  );
};

export const decryptData = (data: any) => {
  if (!data || data === "null") return null;
  try {
    var bytes = CryptoJS.AES.decrypt(decodeURIComponent(data), config.cryptoSecrete);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
