/** Shared by the server layout (inline boot script) and the client intro. */
export const INTRO_STORAGE_KEY = "norm-intro-seen";

/** Inline script (runs before first paint): marks JS as available and decides whether the intro plays this session. */
export const INTRO_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{if(!sessionStorage.getItem('${INTRO_STORAGE_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='playing'}}catch(e){}})();`;
