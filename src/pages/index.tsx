import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [reels, setReels] = useState<any[]>([]);
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    async function fetchReels() {
      const res = await fetch('/api/reels');
      const data = await res.json();

      const sortedReels = (data.reels || []).sort(
        (a: any, b: any) => new Date(b.generated_on).getTime() - new Date(a.generated_on).getTime()
      );

      setReels(sortedReels);

      const urlsMap: { [key: string]: string } = {};

      for (const reel of data.reels) {
        const res = await fetch(`/api/reels/${reel.id}`);
        const { url } = await res.json();
        urlsMap[reel.id] = url;
      }

      setUrls(urlsMap);
    }

    fetchReels();
  }, []);

  // Auto play/pause logic based on viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video') as HTMLVideoElement | null;
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.muted = false;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.muted = true;
          }
        });
      },
      {
        threshold: [0.6],
        root: containerRef.current,
      }
    );

    const children = containerRef.current.querySelectorAll('.reel');
    children.forEach((child) => observer.observe(child));

    return () => {
      children.forEach((child) => observer.unobserve(child));
    };
  }, [urls]);

  // Swipe up/down gestures
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const diffY = startY - endY;

      if (Math.abs(diffY) > 50) {
        container.scrollBy({
          top: diffY > 0 ? window.innerHeight : -window.innerHeight,
          behavior: 'smooth',
        });
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        background: 'black',
      }}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className="reel"
          style={{
            height: '100vh',
            scrollSnapAlign: 'start',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {urls[reel.id] && (
            <>
              <video
                ref={(el) => {
                  if (el) videoRefs.current[index] = el;
                }}
                src={urls[reel.id]}
                muted
                playsInline
                loop
                controls={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  const video = e.currentTarget;
                  video.paused ? video.play() : video.pause();
                }}
              />

              {/* Overlay Buttons */}
              <div
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  bottom: '8%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <button
                  onClick={(e) => {
                    const target = e.currentTarget;
                    target.classList.add('animate');
                    setTimeout(() => target.classList.remove('animate'), 300);
                  }}
                  className="animated-button"
                  style={{ color: 'white', fontSize: '1.8rem' }}
                >
                  ❤️
                </button>

                <button
                  onClick={(e) => {
                    const target = e.currentTarget;
                    target.classList.add('animate');
                    setTimeout(() => target.classList.remove('animate'), 300);
                  }}
                  className="animated-button"
                  style={{ color: 'white', fontSize: '1.8rem' }}
                >
                  💬
                </button>

                <button
                  style={{ color: 'white', fontSize: '1.8rem' }}
                  onClick={() => {
                    const shareUrl = window.location.origin;
                    if (navigator.share) {
                      navigator
                        .share({
                          title: 'Check out reels',
                          // text: `Watch this sports reels on ${reel.celebrity}`,
                          url: shareUrl,
                        })
                        .catch((error) => console.error('Share failed:', error));
                    } else {
                      alert('Sharing not supported on this browser');
                    }
                  }}
                >
                  🔗
                </button>

                <button
                  style={{ color: 'white', fontSize: '1.8rem' }}
                  onClick={() => {
                    window.location.href = '/admin';
                  }}
                >
                  ➕
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
