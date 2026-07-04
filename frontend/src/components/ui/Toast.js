const Toast = () => {
  const toast = document.createElement("div");
  toast.className =
    "rounded-lg border border-border bg-white px-4 py-3 text-sm";
  toast.textContent = "Toast placeholder";
  return toast;
};

export default Toast;
