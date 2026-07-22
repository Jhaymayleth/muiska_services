export function createRadioSelector({ defaultRadius = 3, onRadiusChange = () => {} } = {}) {
  const container = document.createElement("div");
  container.className = "flex flex-wrap items-center gap-2";

  const options = [
    { value: 1, label: "1 km" },
    { value: 3, label: "3 km" },
    { value: 5, label: "5 km" },
    { value: 10, label: "10 km" },
  ];

  container.innerHTML = `
    <span class="text-sm text-gray-600">Search radius:</span>
    ${options
      .map(
        (opt) => `
      <label class="flex items-center gap-2">
        <input
          type="radio"
          name="radius"
          value="${opt.value}"
          ${opt.value === defaultRadius ? "checked" : ""}
          class="h-4 w-4 text-primary focus:ring-primary"
        />
        <span class="text-sm text-gray-700">${opt.label}</span>
      </label>
    `
      )
      .join("")}
    <label class="flex items-center gap-2">
      <input
        type="radio"
        name="radius"
        value="my-location"
        class="h-4 w-4 text-primary focus:ring-primary"
      />
      <span class="text-sm text-gray-700">Usar mi ubicación</span>
    </label>
  `;

  const radios = container.querySelectorAll('input[name="radius"]');
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      onRadiusChange(radio.value);
    });
  });

  return {
    element: container,
    getValue: () => {
      const checked = container.querySelector('input[name="radius"]:checked');
      return checked ? checked.value : String(defaultRadius);
    },
    setValue: (value) => {
      const radio = container.querySelector(`input[name="radius"][value="${value}"]`);
      if (radio) radio.checked = true;
    },
  };
}
