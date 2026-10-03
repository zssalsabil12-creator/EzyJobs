export type NavItem = { to: string; label: string };

export function parseNavItems(value: string | undefined, fallback: NavItem[]): NavItem[] {
  const rows = (value ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = rows.map((line) => {
    const [to, ...rest] = line.split('||').map((part) => part.trim());
    return { to: to || '', label: rest.join('||').trim() };
  }).filter((item) => item.to && item.label);
  return parsed.length ? parsed : fallback;
}
