'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * A single display sentence riding alongside each temple illustration.
 *
 * No card, no chrome - the drop shadow is what keeps the type legible over the artwork,
 * matching the treatment already used on the hero h1. Alignment is inherited from the
 * caller (centred on mobile, left or right beside the temple on desktop).
 */
function ScrollQuote({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`fixed z-40 px-4 pointer-events-none ${className ?? ''}`} style={style}>
      {/* h2 scale from the design system: text-3xl md:text-4xl lg:text-5xl, Playfair bold. */}
      <p className="font-serif text-3xl font-bold leading-snug tracking-tight md:text-4xl lg:text-5xl text-heritage-dark drop-shadow-lg">
        {children}
      </p>
    </div>
  );
}

/** Mobile pins the quote near the top of the viewport; desktop centres it beside the temple. */
const QUOTE_TOP_MOBILE =
  'inset-x-0 mx-auto max-w-sm md:max-w-md lg:max-w-lg text-center top-20';

/**
 * The keyframes below were authored against a ~1080px-tall viewport, where the hero's
 * scrollable range (400vh section - 100vh viewport = 300vh) is 3240px. Scroll position is
 * normalised onto that scale so the whole sequence always finishes within the hero,
 * whatever the viewport height. Without this, a short phone viewport (300vh = ~2530px)
 * leaves the temples still animating once the footer has scrolled into view.
 */
const TIMELINE_LENGTH = 3240;

/** Every illustration shares this 2245x1587 canvas. */
const ART_RATIO = 2245 / 1587;

/** Vertical space the stacked mobile statements occupy, top and bottom. */
const QUOTE_BAND_TOP = 240;
const QUOTE_BAND_BOTTOM = 186;

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Hero is h-[400vh], so it scrolls for 300vh before the next section reaches the viewport.
  const heroScrollRange = viewportHeight * 3;
  const progress = heroScrollRange > 0 ? Math.min(scrollY / heroScrollRange, 1) : 0;
  // Normalised scroll position driving every keyframe below.
  const t = progress * TIMELINE_LENGTH;

  // The brown/beige arcs drift with the scroll, then hold position instead of sliding
  // off-screen, and only fade out once the third temple arrives.
  const backdropOpacity = t < 2100 ? 1 : Math.max(0, 1 - (t - 2100) / 300);

  // On mobile Temple 2 sits between the two stacked statements, so size it to the gap
  // that is actually left over rather than to a fixed vh value - a fixed one overlaps the
  // statements on short viewports and wastes space on tall ones.
  const quoteGap = Math.max(0, viewportHeight - QUOTE_BAND_TOP - QUOTE_BAND_BOTTOM);
  const temple2Height = Math.min(quoteGap, viewportHeight * 0.46);
  const temple2Width = temple2Height * ART_RATIO;
  const temple2Rest =
    isMobile && viewportHeight > 0
      ? ((QUOTE_BAND_BOTTOM + (quoteGap - temple2Height) / 2) / viewportHeight) * 100
      : -5;
  const temple2Travel = temple2Rest + 100;

  // Temple 3 rested at -5%, which pushed its base below the fold and clipped the ground line.
  // On mobile it sits just clear of the bottom edge so the whole illustration is readable.
  const temple3Rest = isMobile ? 2 : -5;
  const temple3Travel = temple3Rest + 50;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Parallax Hero Section - Extended */}
        <section className="relative h-[400vh] overflow-hidden">
          {/* Background Layer - Behind (slowest) */}
          <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              transform: `translateY(${Math.min(t * 0.2, 140)}px)`,
              opacity: backdropOpacity,
              willChange: 'transform, opacity',
            }}
          >
            <img
              src="/pagesrc/background-behind.png"
              alt="Background"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Indian Map Layer */}
          <div
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              // The artwork is a landscape frame, so object-contain shrinks it hard on a
              // portrait phone. Scale it up so the map reads at mobile widths.
              transform: `translateY(${t * 0.1}px) scale(${isMobile ? 2.2 : 1})`,
              opacity:
                t < 400
                  ? 0.06 + (t / 400) * 0.09
                  : t < 2500
                    ? 0.15
                    : t < 3000
                      ? 0.15 - ((t - 2500) / 500) * 0.05
                      : Math.max(0, 0.1 - ((t - 3000) / 240) * 0.1),
              willChange: 'transform, opacity',
            }}
          >
            <img
              src="/pagesrc/map.png"
              alt="Indian Heritage Map"
              className="object-contain w-full h-full"
            />
          </div>

          {/* Foreground Background Layer */}
          <div
            className="fixed inset-0 z-20 pointer-events-none"
            style={{
              transform: `translateY(${Math.min(t * 0.15, 105)}px)`,
              opacity: backdropOpacity,
              willChange: 'transform, opacity',
            }}
          >
            <img
              src="/pagesrc/background-front.png"
              alt="Foreground"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Hero Text Content */}
          <div className="fixed inset-0 z-30 flex items-center justify-center px-4 pointer-events-none">
            <div
              className="max-w-4xl mx-auto"
              style={{
                transform: `translateY(${t * 0.3}px)`,
                opacity: Math.max(0, 1 - t / 400),
                willChange: 'transform, opacity',
              }}
            >
              <div className="space-y-6 text-center md:space-y-8">
                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight drop-shadow-lg md:text-6xl lg:text-7xl text-heritage-dark">
                  Discover Heritage,
                  <br />
                  Experience History
                </h1>
                <p className="max-w-2xl mx-auto text-lg leading-relaxed drop-shadow-md text-heritage-dark md:text-xl">
                  Explore cultural landmarks through immersive AR/VR technology. Journey through
                  time and space from anywhere.
                </p>
                <div className="flex flex-col justify-center gap-3 pt-4 pointer-events-auto sm:flex-row md:gap-4">
                  <Link href="/map">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      Explore Map
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="default" size="lg" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Temple 1 - Diagonal entrance from left to bottom-left.
              Explicit width: a fixed element with only `left` set shrink-to-fits against the
              remaining space, and Tailwind preflight's `img { max-width: 100% }` then caps the
              artwork well below its intended height. */}
          <div
            className="fixed z-40 pointer-events-none w-[110vw] md:w-[99vh]"
            style={{
              // Timeline: 100-400 entrance, 400-800 stay, 800-1100 exit
              left:
                t < 100
                  ? '-50%'
                  : t < 400
                    ? `${-50 + ((t - 100) / 300) * 40}%`
                    : t < 800
                      ? '-10%'
                      : t < 1100
                        ? `${-10 - ((t - 800) / 300) * 40}%`
                        : '-50%',
              bottom:
                t < 100
                  ? '-50%'
                  : t < 400
                    ? `${-50 + ((t - 100) / 300) * 45}%`
                    : t < 800
                      ? '-5%'
                      : t < 1100
                        ? `${-5 - ((t - 800) / 300) * 45}%`
                        : '-50%',
              opacity:
                t < 100
                  ? 0
                  : t < 300
                    ? (t - 100) / 200
                    : t < 800
                      ? 1
                      : t < 1100
                        ? 1 - (t - 800) / 300
                        : 0,
              willChange: 'left, bottom, opacity',
            }}
          >
            <img
              src="/pagesrc/temple-1.png"
              alt="Heritage Temple 1"
              className="object-contain w-full h-auto drop-shadow-2xl"
            />
          </div>

          {/* Statement 1 - accompanies Temple 1 */}
          <ScrollQuote
            className={`${QUOTE_TOP_MOBILE} md:inset-x-auto md:mx-0 md:right-16 md:top-1/2 md:-translate-y-1/2 md:text-right`}
            style={{
              opacity:
                t < 100
                  ? 0
                  : t < 300
                    ? (t - 100) / 200
                    : t < 800
                      ? 1
                      : t < 1100
                        ? 1 - (t - 800) / 300
                        : 0,
              willChange: 'opacity',
            }}
          >
            Stand inside history, from anywhere.
          </ScrollQuote>

          {/* Temple 2 - Fade from bottom center, rise to final position, stay, then sink back.
              Centred via left-1/2, which leaves only 50vw of shrink-to-fit space, so the width
              has to be explicit or the artwork collapses to a fraction of its intended size. */}
          <div
            className="fixed z-40 pointer-events-none left-1/2 -translate-x-1/2 md:w-[99vh]"
            style={{
              // Mobile width is derived from the gap between the quote cards; desktop keeps
              // the class-based 99vh (the natural width of a 70vh-tall frame).
              width: isMobile && temple2Width > 0 ? `${temple2Width}px` : undefined,
              // Timeline: 1100-1400 fade in and rise, 1400-1800 stay, 1800-2100 sink back and fade out
              bottom:
                t < 1100
                  ? '-100%'
                  : t < 1400
                    ? `${-100 + ((t - 1100) / 300) * temple2Travel}%`
                    : t < 1800
                      ? `${temple2Rest}%`
                      : t < 2100
                        ? `${temple2Rest - ((t - 1800) / 300) * temple2Travel}%`
                        : '-100%',
              opacity:
                t < 1100
                  ? 0
                  : t < 1300
                    ? (t - 1100) / 200
                    : t < 1800
                      ? 1
                      : t < 2100
                        ? 1 - (t - 1800) / 300
                        : 0,
              willChange: 'bottom, opacity',
            }}
          >
            <img
              src="/pagesrc/temple-2.png"
              alt="Heritage Temple 2"
              className="object-contain w-full h-auto drop-shadow-2xl"
            />
          </div>

          {/* Statement 2 - above Temple 2 on mobile, left of it on desktop */}
          <ScrollQuote            className={`${QUOTE_TOP_MOBILE} md:inset-x-auto md:mx-0 md:left-16 md:top-1/2 md:-translate-y-1/2 md:text-left`}
            style={{
              opacity:
                t < 1100
                  ? 0
                  : t < 1300
                    ? (t - 1100) / 200
                    : t < 1800
                      ? 1
                      : t < 2100
                        ? 1 - (t - 1800) / 300
                        : 0,
              willChange: 'opacity',
            }}
          >
            Every carving, preserved in three dimensions.
          </ScrollQuote>

          {/* Statement 3 - below Temple 2 on mobile, right of it on desktop */}
          <ScrollQuote            className="inset-x-0 mx-auto max-w-sm text-center bottom-6 md:inset-x-auto md:mx-0 md:bottom-auto md:right-16 md:top-1/2 md:-translate-y-1/2 md:text-right"
            style={{
              opacity:
                t < 1100
                  ? 0
                  : t < 1300
                    ? (t - 1100) / 200
                    : t < 1800
                      ? 1
                      : t < 2100
                        ? 1 - (t - 1800) / 300
                        : 0,
              willChange: 'opacity',
            }}
          >
            Heritage you walk through, not just read about.
          </ScrollQuote>

          {/* Temple 3 - Diagonal entrance from right to bottom-right (opposite of Temple 1).
              Sits below the quote layer so the copy stays legible over it. */}
          <div
            className="fixed z-30 pointer-events-none w-[110vw] md:w-[99vh]"
            style={{
              // Timeline: 2100-2350 entrance, 2350-3100 stay, 3100-3240 exit.
              // It holds at full opacity right up to the end of the hero (3240), which is the
              // exact point the next section reaches the viewport. Fading it earlier left a
              // stretch of empty white between the temple and the incoming content. The
              // section is z-50 against this layer's z-30, so it slides up over the temple.
              right:
                t < 2100
                  ? '-50%'
                  : t < 2350
                    ? `${-50 + ((t - 2100) / 250) * 40}%`
                    : t < 3100
                      ? '-10%'
                      : `${-10 - ((t - 3100) / 140) * 40}%`,
              bottom:
                t < 2100
                  ? '-50%'
                  : t < 2350
                    ? `${-50 + ((t - 2100) / 250) * temple3Travel}%`
                    : t < 3100
                      ? `${temple3Rest}%`
                      : `${temple3Rest - ((t - 3100) / 140) * temple3Travel}%`,
              opacity:
                t < 2100
                  ? 0
                  : t < 2280
                    ? (t - 2100) / 180
                    : t < 3100
                      ? 1
                      : Math.max(0, 1 - (t - 3100) / 140),
              willChange: 'right, bottom, opacity',
            }}
          >
            <img
              src="/pagesrc/temple-3.png"
              alt="Heritage Temple 3"
              className="object-contain w-full h-auto drop-shadow-2xl"
            />
          </div>

          {/* Statement 4 - accompanies Temple 3 */}
          <ScrollQuote            className={`${QUOTE_TOP_MOBILE} md:inset-x-auto md:mx-0 md:left-16 md:top-1/2 md:-translate-y-1/2 md:text-left`}
            style={{
              opacity:
                t < 2100
                  ? 0
                  : t < 2280
                    ? (t - 2100) / 180
                    : t < 3100
                      ? 1
                      : Math.max(0, 1 - (t - 3100) / 140),
              willChange: 'opacity',
            }}
          >
            A monument endures as long as it is seen.
          </ScrollQuote>

          {/* Scroll Indicator */}
          <div
            className="fixed z-50 transform -translate-x-1/2 pointer-events-none bottom-8 left-1/2"
            style={{
              opacity: Math.max(0, 1 - t / 200),
              willChange: 'opacity',
            }}
          >
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <span className="text-sm font-medium text-white">Scroll to explore</span>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Featured Site Section */}
        <section className="relative z-50 px-4 pt-8 pb-16 bg-white md:py-24 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-heritage-dark">
                Explore Heritage Sites
              </h2>
              <p className="max-w-2xl mx-auto text-base leading-relaxed text-heritage-dark/70 md:text-lg">
                Dive deep into the history and culture of heritage sites with detailed information,
                interactive 3D models, 360° panoramic views, and AR experiences.
              </p>
              <div className="flex justify-center pt-4">
                <Link href="/site/sonda-fort">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    View Site Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
