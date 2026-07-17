const Input = () => {
  const wrapper = document.createElement("div");
  wrapper.className = "space-y-2";
  wrapper.innerHTML = `
    <label class="text-sm font-medium text-text">Campo</label>
    <input class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none" placeholder="Texto" />
  `;
  return wrapper;
};

export default Input;
