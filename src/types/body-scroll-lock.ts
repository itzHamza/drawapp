export const disableBodyScroll = (targetElement: HTMLElement | null): void => {
  if (!targetElement) return;

  // Save current scroll position
  const scrollY = window.scrollY;

  // Apply styles to body
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
};

export const clearAllBodyScrollLocks = (): void => {
  // Remove styles from body
  const scrollY = document.body.style.top;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  // Restore scroll position
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
};
