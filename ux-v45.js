(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("v45-ux-ready");

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    const body = document.body;
    if (!body || !body.classList.contains("v28-final")) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
    const header = document.querySelector(".header");
    const menuButton = document.querySelector(".menu-btn");
    const mobileMenu = document.querySelector(".mobile-menu");
    const menuPanel = mobileMenu?.querySelector(".menu-panel");
    const main = document.querySelector("main");
    const footer = document.querySelector(".footer");

    /*
     * Header height is controlled only by CSS breakpoints.
     * Do not measure the header and write that value back into --v45-header-h:
     * on Safari iOS, during image/font loading, a temporary oversized layout
     * could be captured and then become permanent on only some pages.
     */

    /* Thin page progress: visible but never in the way. */
    if (header && !header.querySelector(".v45-scroll-progress")) {
      const progress = document.createElement("div");
      progress.className = "v45-scroll-progress";
      progress.setAttribute("aria-hidden", "true");
      progress.innerHTML = "<i></i>";
      header.appendChild(progress);
    }

    let scrollFrame = 0;
    const updateScrollUI = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const value = Math.min(1, Math.max(0, window.scrollY / max));
      root.style.setProperty("--v45-scroll-progress", value.toFixed(4));

      const hero = document.querySelector(".premium-hero");
      if (hero && !reducedMotion) {
        const offset = Math.min(42, Math.max(0, window.scrollY * 0.055));
        hero.style.setProperty("--v45-hero-scroll", `${offset}px`);
      }
      scrollFrame = 0;
    };
    const requestScrollUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollUI);
    };
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    updateScrollUI();

    /* Replace the text glyph with a controlled, animated hamburger. */
    if (menuButton && !menuButton.querySelector(".v45-menu-lines")) {
      menuButton.innerHTML = '<span class="v45-menu-lines" aria-hidden="true"><i></i><i></i><i></i></span>';
    }

    let lastFocusedElement = null;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])'
    ].join(",");

    const setPageInert = (open) => {
      if (!("inert" in HTMLElement.prototype)) return;
      [main, footer].forEach((element) => {
        if (element) element.inert = open;
      });
    };

    const setMenuInteractive = (open) => {
      if (!mobileMenu || !menuPanel) return;
      if ("inert" in mobileMenu) mobileMenu.inert = !open;
      menuPanel.querySelectorAll(focusableSelector).forEach((element) => {
        if (!(element instanceof HTMLElement)) return;
        if (!open) {
          if (element.hasAttribute("tabindex")) element.dataset.v45Tabindex = element.getAttribute("tabindex") || "";
          element.setAttribute("tabindex", "-1");
        } else if (Object.prototype.hasOwnProperty.call(element.dataset, "v45Tabindex")) {
          const previous = element.dataset.v45Tabindex;
          if (previous === "") element.removeAttribute("tabindex"); else element.setAttribute("tabindex", previous);
          delete element.dataset.v45Tabindex;
        } else {
          element.removeAttribute("tabindex");
        }
      });
    };

    const closeMenu = ({ restoreFocus = true } = {}) => {
      if (!mobileMenu || !menuButton) return;
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Apri menu");
      body.classList.remove("menu-open");
      setPageInert(false);
      setMenuInteractive(false);
      if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({ preventScroll: true });
      }
    };

    const openMenu = () => {
      if (!mobileMenu || !menuButton || !menuPanel) return;
      lastFocusedElement = document.activeElement;
      mobileMenu.classList.add("open");
      mobileMenu.setAttribute("aria-hidden", "false");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Chiudi menu");
      body.classList.add("menu-open");
      setPageInert(true);
      setMenuInteractive(true);
      window.setTimeout(() => {
        const first = menuPanel.querySelector(focusableSelector);
        if (first instanceof HTMLElement) first.focus({ preventScroll: true });
      }, 80);
    };

    if (menuButton && mobileMenu && menuPanel) {
      setMenuInteractive(false);
      menuButton.addEventListener("click", () => {
        if (mobileMenu.classList.contains("open")) closeMenu();
        else openMenu();
      });

      document.addEventListener("keydown", (event) => {
        if (!mobileMenu.classList.contains("open")) return;

        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu();
          return;
        }

        if (event.key !== "Tab") return;
        const focusable = [...menuPanel.querySelectorAll(focusableSelector)].filter((element) => {
          return element instanceof HTMLElement && element.offsetParent !== null;
        });
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });

      menuPanel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
      });

      mobileMenu.addEventListener("click", (event) => {
        if (event.target === mobileMenu) closeMenu();
      });

      new MutationObserver(() => {
        const open = mobileMenu.classList.contains("open");
        setPageInert(open);
        setMenuInteractive(open);
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        menuButton.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
        mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
        body.classList.toggle("menu-open", open);
      }).observe(mobileMenu, { attributes: true, attributeFilter: ["class"] });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 1100 && mobileMenu.classList.contains("open")) {
          closeMenu({ restoreFocus: false });
        }
      }, { passive: true });
    }

    /* Make current navigation state reliable on every page. */
    const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const currentHash = window.location.hash.toLowerCase();
    const navigationLinks = [...document.querySelectorAll(".desktop-links a, .menu-panel a")];

    /* Rimuove gli active scritti nell'HTML prima di calcolare lo stato reale: una sola voce attiva. */
    navigationLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });

    navigationLinks.forEach((link) => {
      const fullHref = (link.getAttribute("href") || "").trim();
      if (!fullHref || /^(https?:|tel:|mailto:)/i.test(fullHref)) return;
      const [pathPart, hashPart = ""] = fullHref.split("#");
      const file = (pathPart.split("/").pop() || "index.html").toLowerCase();
      const linkHash = hashPart ? `#${hashPart.toLowerCase()}` : "";
      const isCurrentFile = file === currentFile;
      const isCurrentHash = linkHash && currentHash === linkHash;
      const isPlainPage = isCurrentFile && !linkHash && !(currentFile === "index.html" && currentHash);
      if (isCurrentHash || isPlainPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", isCurrentHash ? "location" : "page");
      }
    });

    /* Hero depth follows the pointer by only a few pixels. */
    const hero = document.querySelector(".premium-hero");
    if (hero && finePointer && !reducedMotion) {
      let heroFrame = 0;
      let targetX = 0;
      let targetY = 0;
      const paintHero = () => {
        hero.style.setProperty("--v45-pointer-x", `${targetX * 0.7}px`);
        hero.style.setProperty("--v45-pointer-y", `${targetY * 0.7}px`);
        hero.style.setProperty("--v45-hero-x", `${targetX}px`);
        hero.style.setProperty("--v45-hero-y", `${targetY}px`);
        heroFrame = 0;
      };
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
        if (!heroFrame) heroFrame = window.requestAnimationFrame(paintHero);
      }, { passive: true });
      hero.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
        if (!heroFrame) heroFrame = window.requestAnimationFrame(paintHero);
      }, { passive: true });
    }

    /* Local pointer light on cards, without continuous animation loops. */
    if (finePointer && !reducedMotion) {
      const cards = document.querySelectorAll([
        ".simple-card",
        ".trust-card",
        ".page-card",
        ".info-card",
        ".stock-card",
        ".review-proof-card",
        ".contact-action",
        ".page-side-card",
        ".hard-action-grid article",
        ".v28-steps-grid article",
        ".v28-store-card",
        ".commercial-proof-card"
      ].join(","));

      cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--v45-card-x", `${x.toFixed(1)}%`);
          card.style.setProperty("--v45-card-y", `${y.toFixed(1)}%`);
        }, { passive: true });
      });
    }

    /* Small tactile ripple on the main action controls. */
    if (!reducedMotion) {
      document.addEventListener("pointerdown", (event) => {
        if (!(event.target instanceof Element)) return;
        const control = event.target.closest([
          ".btn",
          ".wa",
          ".call-btn",
          ".menu-btn",
          ".phone-book",
          ".solution-card a"
        ].join(","));
        if (!(control instanceof HTMLElement)) return;
        const rect = control.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "v45-ripple";
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        control.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 620);
      }, { passive: true });
    }

    /* Repair estimator: keyboard support and explicit current step. */
    const pricingLab = document.querySelector(".pricing-lab");
    const labSteps = [...document.querySelectorAll(".lab-step")];
    let labLive = null;

    if (pricingLab && labSteps.length) {
      labLive = document.createElement("p");
      labLive.className = "sr-only";
      labLive.setAttribute("aria-live", "polite");
      pricingLab.appendChild(labLive);

      labSteps.forEach((step) => {
        step.setAttribute("role", "button");
        step.addEventListener("keydown", (event) => {
          if ((event.key === "Enter" || event.key === " ") && step.getAttribute("aria-disabled") !== "true") {
            event.preventDefault();
            step.click();
          }
        });
      });

      const syncLabSteps = () => {
        const activeStep = Number(pricingLab.dataset.flowStep || 1);
        labSteps.forEach((step) => {
          const number = Number(step.dataset.labStep || 0);
          const available = number === 1 || number <= activeStep;
          step.tabIndex = available ? 0 : -1;
          step.setAttribute("aria-disabled", available ? "false" : "true");
          if (number === activeStep) {
            step.setAttribute("aria-current", "step");
          } else {
            step.removeAttribute("aria-current");
          }
        });
        const label = labSteps.find((step) => Number(step.dataset.labStep) === activeStep)?.textContent?.trim();
        if (labLive && label) labLive.textContent = `Passaggio ${activeStep}: ${label}`;
      };

      new MutationObserver(syncLabSteps).observe(pricingLab, {
        attributes: true,
        attributeFilter: ["data-flow-step"]
      });
      syncLabSteps();
    }

    /* Choice controls expose their state to screen readers. */
    const syncPressedGroup = (group, selected) => {
      group.querySelectorAll("button").forEach((button) => {
        button.setAttribute("aria-pressed", button === selected ? "true" : "false");
      });
    };

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const choice = event.target.closest([
        ".model-card",
        ".problem-grid-v16 button",
        ".trade-v34-choice-grid button",
        ".trade-v34-test-answers button",
        ".trade-v34-condition-grid button",
        ".trade-v34-battery-grid button",
        ".trade-v34-account-grid button"
      ].join(","));
      if (!(choice instanceof HTMLButtonElement)) return;
      const group = choice.parentElement;
      if (group) window.setTimeout(() => syncPressedGroup(group, choice), 0);
    });

    document.querySelectorAll([
      ".model-cards",
      ".problem-grid-v16",
      ".trade-v34-choice-grid",
      ".trade-v34-test-answers",
      ".trade-v34-condition-grid",
      ".trade-v34-battery-grid",
      ".trade-v34-account-grid"
    ].join(",")).forEach((group) => {
      group.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", "false"));
    });

    /* FAQ state should match the visual state, even though the legacy script owns opening. */
    document.querySelectorAll(".faq-btn").forEach((button) => {
      button.setAttribute("aria-expanded", button.classList.contains("open") ? "true" : "false");
      const content = button.nextElementSibling;
      if (content && !content.id) {
        content.id = `faq-${Math.random().toString(36).slice(2, 9)}`;
      }
      if (content?.id) button.setAttribute("aria-controls", content.id);
      const syncFaqState = () => {
        button.setAttribute("aria-expanded", button.classList.contains("open") ? "true" : "false");
      };
      button.addEventListener("click", () => window.setTimeout(syncFaqState, 0));
      new MutationObserver(syncFaqState).observe(button, { attributes: true, attributeFilter: ["class"] });
    });

    /* Stop accidental horizontal wheel movement inside chip rows from moving the page. */
    document.querySelectorAll(".model-quick").forEach((row) => {
      row.addEventListener("wheel", (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        if (row.scrollWidth <= row.clientWidth) return;
        row.scrollLeft += event.deltaY;
        event.preventDefault();
      }, { passive: false });
    });
  });
})();
