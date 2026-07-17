const SearchBar = () => {
  const wrapper = document.createElement("div");
  wrapper.className = "rounded-lg border border-border bg-white px-3 py-2";
  wrapper.innerHTML =
    '<input class="w-full bg-transparent outline-none" placeholder="Buscar" />';
  return wrapper;
};

export default SearchBar;
