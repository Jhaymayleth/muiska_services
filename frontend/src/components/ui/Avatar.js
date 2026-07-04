const Avatar = () => {
  const avatar = document.createElement("div");
  avatar.className =
    "flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary";
  avatar.textContent = "U";
  return avatar;
};

export default Avatar;
