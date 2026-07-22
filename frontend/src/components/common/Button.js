const Button = () => {
  const button = document.createElement("button");
  button.className =
    "rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover";
  button.textContent = "Button";
  return button;
};

export default Button;
