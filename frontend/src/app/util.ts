export function goTo(id: string, ev?: Event) {
  ev?.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
