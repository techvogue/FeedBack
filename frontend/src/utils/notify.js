import { toast } from "react-toastify";

const DEFAULT_OPTIONS = {
  position: "top-right",
  autoClose: 3500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const notifySuccess = (message, options = {}) =>
  toast.success(message, { ...DEFAULT_OPTIONS, ...options });

export const notifyError = (message, options = {}) =>
  toast.error(message, { ...DEFAULT_OPTIONS, ...options });

export const notifyInfo = (message, options = {}) =>
  toast.info(message, { ...DEFAULT_OPTIONS, ...options });
