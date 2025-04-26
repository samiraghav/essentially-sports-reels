import { useEffect, useRef, useState } from 'react';
import { FiHeart, FiMessageCircle, FiShare2, FiPlus } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import defaultPlayer from '../../public/default-player.svg'

type Reel = {
  id: string;
  key: string;
  celebrity: string;
  generated_on: string;
  duration: string;
  sport: string;
  thumbnail: string;
};

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [likedReels, setLikedReels] = useState<{ [id: string]: boolean }>({});
  const [followed, setFollowed] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    async function fetchReels() {
      const res = await fetch('/api/reels');
      const data = await res.json();
  
      const sortedReels = (data.reels || [])
        .filter((r: Reel) => !!r.generated_on)
        .sort((a: Reel, b: Reel) => {
          return new Date(b.generated_on).getTime() - new Date(a.generated_on).getTime();
        });
  
      setReels(sortedReels);

      const urlsMap: { [key: string]: string } = {};
      for (const reel of sortedReels) {
        const res = await fetch(`/api/reels/${reel.id}`);
        const { url } = await res.json();
        urlsMap[reel.id] = url;
      }

      setUrls(urlsMap);
    }

    fetchReels();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video') as HTMLVideoElement | null;
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (video.paused) {
              video.muted = false;
              video.play().catch((e) => {
                if (e.name !== 'AbortError') console.warn('Play error:', e);
              });
            }
          } else {
            if (!video.paused) video.pause();
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

  useEffect(() => {
    const firstVideo = videoRefs.current[0];
    if (firstVideo && urls[reels[0]?.id]) {
      firstVideo.muted = false;
      firstVideo
        .play()
        .catch((e) => {
          if (e.name !== 'AbortError') {
            console.warn('Autoplay error:', e);
          }
        });
    }
  }, [urls, reels]);

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
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            height: '100%',
          }}
        >
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
      
          <div
            style={{
              position: 'absolute',
              right: '0.5rem',
              bottom: '5%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => {
                setLikedReels((prev) => ({
                  ...prev,
                  [reel.id]: !prev[reel.id],
                }));
              }}
              className="animated-button"
              style={{
                color: likedReels[reel.id] ? 'red' : 'white',
                transition: 'transform 0.2s ease',
                transform: likedReels[reel.id] ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              {likedReels[reel.id] ? <AiFillHeart size={30} /> : <FiHeart size={30} />}
            </button>
      
            <button
              className="animated-button"
              onClick={() => {}}
            >
              <FiMessageCircle size={30} />
            </button>
      
            <button
              className="animated-button"
              onClick={() => {
                const shareUrl = window.location.origin;
                if (navigator.share) {
                  navigator
                    .share({ title: 'Check out reels', url: shareUrl })
                    .catch((err) => {
                      if (err.name !== 'AbortError') console.error('Share failed:', err);
                    });
                } else {
                  alert('Sharing not supported on this browser');
                }
              }}
            >
              <FiShare2 size={30} />
            </button>
      
            <button
              className="animated-button"
              onClick={() => {
                window.location.href = '/admin';
              }}
            >
              <FiPlus size={30} />
            </button>
          </div>

          <div className="absolute bottom-[6%] left-5 text-white z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img
                src={reel.thumbnail?.trim() ? reel.thumbnail : defaultPlayer.src}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-white"
              />
              <span className="font-bold text-base">
                {reel.celebrity.length > 15
                  ? reel.celebrity.slice(0, 15) + '...'
                  : reel.celebrity}
              </span>
              <button
                onClick={() =>
                  setFollowed((prev) => ({
                    ...prev,
                    [reel.id]: !prev[reel.id],
                  }))
                }
                className={`font-bold text-sm px-4 py-1 rounded-full border ${
                  followed[reel.id]
                    ? 'border-white bg-white text-black'
                    : 'border-white text-white'
                } transition duration-200`}
              >
                {followed[reel.id] ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

        </div>
      </div>
      ))}
    </div>
  );
}
