'use client';

import { useEffect } from 'react';

/**
 * Motion layer (§11.8) — Lenis smooth scroll + a small GSAP vocabulary driven by data attributes.
 *
 *   data-anim="up|fade|scale|clip"   element animates in on scroll
 *   data-anim-delay="0.15"           seconds
 *   data-stagger                     container: its [data-anim] children animate in sequence
 *   data-parallax="0.12"             element drifts against the scroll (fraction of viewport)
 *   data-hero                        animates immediately on load rather than on scroll
 *   data-count="350" data-count-suffix="+"
 *
 * Everything is dynamically imported so the marketing bundle stays small and the admin panel
 * never loads it, and the whole layer is skipped under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // with motion off, reveal everything immediately and never load the libraries
    if (reduced) {
      document.documentElement.classList.add('motion-off');
      return;
    }

    let lenis: import('lenis').default | null = null;
    let frame = 0;
    let cleanupTriggers: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add('motion-ready');

      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);

      const ease = 'power3.out';

      /** Resting state for each animation kind. */
      const from = (kind: string) => {
        switch (kind) {
          case 'fade':
            return { opacity: 0 };
          case 'scale':
            return { opacity: 0, scale: 0.94 };
          case 'clip':
            return { opacity: 0, clipPath: 'inset(0 0 100% 0)', y: 12 };
          default:
            return { opacity: 0, y: 28 };
        }
      };
      const to = (kind: string) =>
        kind === 'clip'
          ? { opacity: 1, clipPath: 'inset(0 0 0% 0)', y: 0 }
          : { opacity: 1, y: 0, scale: 1 };

      const ctx = gsap.context(() => {
        // ---- hero: plays on load, no scroll trigger ----
        const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero] [data-anim]');
        if (heroItems.length) {
          const tl = gsap.timeline({ defaults: { duration: 0.95, ease } });
          heroItems.forEach((el, i) => {
            const kind = el.dataset.anim || 'up';
            tl.fromTo(el, from(kind), { ...to(kind), duration: 0.95 }, i === 0 ? 0 : `-=${0.78}`);
          });
        }

        // ---- staggered groups ----
        gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
          const children = gsap.utils.toArray<HTMLElement>('[data-anim]', group);
          if (!children.length) return;
          gsap.fromTo(
            children,
            from(children[0].dataset.anim || 'up'),
            {
              ...to(children[0].dataset.anim || 'up'),
              duration: 0.85,
              ease,
              stagger: 0.075,
              scrollTrigger: { trigger: group, start: 'top 85%', once: true },
            },
          );
        });

        // ---- individual elements (skip ones already handled above) ----
        gsap.utils.toArray<HTMLElement>('[data-anim]').forEach((el) => {
          if (el.closest('[data-stagger]') || el.closest('[data-hero]')) return;
          const kind = el.dataset.anim || 'up';
          gsap.fromTo(el, from(kind), {
            ...to(kind),
            duration: 0.9,
            ease,
            delay: Number(el.dataset.animDelay ?? 0),
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });

        // ---- parallax drift ----
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const strength = Number(el.dataset.parallax || 0.12);
          gsap.fromTo(
            el,
            { yPercent: -strength * 50 },
            {
              yPercent: strength * 50,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        // ---- count-up numerals ----
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count);
          if (!Number.isFinite(target)) return;
          const suffix = el.dataset.countSuffix ?? '';
          const state = { n: 0 };
          gsap.to(state, {
            n: target,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => {
              el.textContent = `${Math.round(state.n)}${suffix}`;
            },
          });
        });
      });

      ScrollTrigger.refresh();
      cleanupTriggers = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanupTriggers?.();
      lenis?.destroy();
    };
  }, []);

  return null;
}
