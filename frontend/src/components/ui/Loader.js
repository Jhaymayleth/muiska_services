const Loader = () => {
  const loader = document.createElement("div");
  loader.className = "flex items-center justify-center py-6";
  loader.innerHTML =
    '<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>';
  return loader;
};

export default Loader;
