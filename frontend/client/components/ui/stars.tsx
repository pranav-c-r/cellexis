import React, { useEffect, useState, useMemo } from 'react';

const SpaceBackground = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Generate stars with different properties
    const generateStars = (count, sizeRange, opacityRange) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 500 - 100, // Changed: allows stars from -100vh to 400vh
        size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
        twinkleDelay: Math.random() * 5,
    }));
};

    const distantStars = useMemo(()=> generateStars(200, [0.5, 1], [0.3, 0.6]),[])
    const mediumStars = useMemo(()=> generateStars(100, [1, 2], [0.5, 0.8]),[])
    const closeStars = useMemo(()=> generateStars(50, [1.5, 3], [0.7, 1]),[])
    const brightStars = useMemo(()=> generateStars(20, [2, 4], [0.8, 1]),[])

    return (
        <div className="absolute -z-10  min-h-screen">
            {/* Space background with gradient */}
            <div
                className="fixed inset-0 w-full h-full"
                style={{
                    background: `linear-gradient(135deg, #000000 0%, #080d1a 50%, #000000 100%)`
                }}
            />
            {/*             linear-gradient(135deg, #000000 0%, #0a1125 50%, #000000 100%)*/}
            {/* Distant stars layer (slowest parallax) */}
            <div
                className="fixed inset-0 w-full"
                style={{
                    transform: `translateY(${scrollY * 0.1}px)`,
                    height: '300vh'
                }}
            >
                {distantStars.map(star => (
                    <div
                        key={`distant-${star.id}`}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}vh`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animationDelay: `${star.twinkleDelay}s`,
                            animationDuration: '4s',
                            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.5})`
                        }}
                    />
                ))}
            </div>

            {/* Medium stars layer */}
            <div
                className="fixed inset-0 w-full"
                style={{
                    transform: `translateY(${scrollY * 0.2}px)`,
                    height: '300vh'
                }}
            >
                {mediumStars.map(star => (
                    <div
                        key={`medium-${star.id}`}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}vh`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animationDelay: `${star.twinkleDelay}s`,
                            animationDuration: '3s',
                            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.6})`
                        }}
                    />
                ))}
            </div>

            {/* Close stars layer */}
            <div
                className="fixed inset-0 w-full"
                style={{
                    transform: `translateY(${scrollY * 0.3}px)`,
                    height: '300vh'
                }}
            >
                {closeStars.map(star => (
                    <div
                        key={`close-${star.id}`}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}vh`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animationDelay: `${star.twinkleDelay}s`,
                            animationDuration: '2s',
                            boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, ${star.opacity * 0.7})`
                        }}
                    />
                ))}
            </div>

            {/* Bright stars layer (fastest parallax) */}
            <div
                className="fixed inset-0 w-full"
                style={{
                    transform: `translateY(${scrollY * 0.4}px)`,
                    height: '300vh'
                }}
            >
                {brightStars.map(star => (
                    <div
                        key={`bright-${star.id}`}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}vh`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animationDelay: `${star.twinkleDelay}s`,
                            animationDuration: '1.5s',
                            boxShadow: `0 0 ${star.size * 4}px rgba(255, 255, 255, ${star.opacity})`
                        }}
                    />
                ))}
            </div>

            {/* Shooting stars */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                    style={{
                        top: '20%',
                        left: '10%',
                        animation: 'shooting-star 8s linear infinite',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                    }}
                />
                <div
                    className="absolute w-1 h-1 bg-blue-200 rounded-full opacity-70"
                    style={{
                        top: '60%',
                        left: '70%',
                        animation: 'shooting-star 12s linear infinite',
                        animationDelay: '4s',
                        boxShadow: '0 0 8px rgba(200, 220, 255, 0.7)'
                    }}
                />
            </div>

            {/* Content area - your page content goes here */}
            {/* <div className="relative z-10 min-h-screen bg-transparent">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center text-white space-y-8">
                        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Welcome to Space
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            This is your scrollable content area. The stars will move with beautiful parallax effects as you scroll.
                        </p> */}

            {/* Demo content for scrolling */}
            {/*   {[...Array(10)].map((_, i) => (
                            // <div key={i} className="my-16 p-8 bg-black bg-opacity-30 backdrop-blur-sm rounded-lg border border-white border-opacity-20">
                            //     <h2 className="text-3xl font-semibold mb-4 text-blue-300">Section {i + 1}</h2>
                            //     <p className="text-gray-300 leading-relaxed">
                            //         Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            //         Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            //         Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            //     </p>
                            // </div>
                        ))} */}
            {/* </div>
                </div>
            </div> */}

            <style>{`
        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px) rotate(-45deg);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default SpaceBackground;