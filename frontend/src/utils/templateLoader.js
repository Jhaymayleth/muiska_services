const templateCache = new Map();

const templateModules = import.meta.glob('../templates/**/*.html', { as: 'raw', eager: true });

for (const [path, content] of Object.entries(templateModules)) {
  const name = path.match(/([^/]+)\.html$/)[1];
  templateCache.set(name, content);
}

export function loadTemplate(name) {
  const template = templateCache.get(name);
  if (!template) {
    throw new Error(`Template "${name}" not found. Available: ${Array.from(templateCache.keys()).join(', ')}`);
  }
  return template;
}

export function renderTemplate(name, data = {}) {
  let template = loadTemplate(name);
  
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    template = template.replace(regex, value);
  }
  
  return template;
}

export function clearTemplateCache() {
  templateCache.clear();
}

export function getAvailableTemplates() {
  return Array.from(templateCache.keys());
}