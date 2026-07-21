const templateCache = new Map();

const templateModules = import.meta.glob('../templates/**/*.html', { query: '?raw', import: 'default', eager: true });

for (const [path, module] of Object.entries(templateModules)) {
  const name = path.match(/([^/]+)\.html$/)[1];
  const content = typeof module === 'string' ? module : (module.default || '');
  templateCache.set(name, content);
}

function processConditionals(template) {
  // Process {{#repeat N}}...{{/repeat}}
  template = template.replace(/\{\{#repeat (\d+)\}\}([\s\S]*?)\{\{\/repeat\}\}/g, (match, count, content) => {
    const n = parseInt(count, 10);
    return content.repeat(n);
  });

  // Process {{#if condition}}...{{else}}...{{/if}} and {{#if condition}}...{{/if}}
  template = template.replace(/\{\{#if ([\s\S]*?)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g, (match, condition, ifContent, elseContent) => {
    const cond = condition.trim();
    // Support simple boolean checks: variable name, or !variable
    const isNegated = cond.startsWith('!');
    const varName = isNegated ? cond.slice(1) : cond;
    const value = data?.[varName];
    const truthy = isNegated ? !value : !!value;
    return truthy ? ifContent : (elseContent || '');
  });

  return template;
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

  // First process conditionals with access to data
  template = template.replace(/\{\{#repeat (\d+)\}\}([\s\S]*?)\{\{\/repeat\}\}/g, (match, count, content) => {
    const n = parseInt(count, 10);
    return content.repeat(n);
  });

  template = template.replace(/\{\{#if ([\s\S]*?)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g, (match, condition, ifContent, elseContent) => {
    const cond = condition.trim();
    const isNegated = cond.startsWith('!');
    const varName = isNegated ? cond.slice(1) : cond;
    const value = data[varName];
    const truthy = isNegated ? !value : !!value;
    return truthy ? ifContent : (elseContent || '');
  });

  // Then process simple variable replacements {{key}}
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