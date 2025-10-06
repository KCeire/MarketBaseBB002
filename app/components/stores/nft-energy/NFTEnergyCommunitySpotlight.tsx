// app/components/stores/nft-energy/NFTEnergyCommunitySpotlight.tsx
"use client";

import { useState } from 'react';
import { Icon } from '@/app/components/ui/Icon';
import Image from 'next/image';

interface CommunityProject {
  id: string;
  name: string;
  description: string;
  image: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

// Placeholder community projects - will be populated later
const communityProjects: CommunityProject[] = [
  {
    id: 'pigeons-ny',
    name: 'Pigeons of New York',
    description: 'Beyond the art, Pigeons of New York have held events all around the USA creating true value to members of their community. Join the COOP!',
    image: 'https://nftenergydrinks.com/wp-content/uploads/2024/03/12.png',
    socialLinks: {
      twitter: 'https://twitter.com/pigeonsofny_nft',
      discord: 'https://discord.gg/BUMXRpegZm',
      website: 'https://pigeonsofnewyork.io/'
    }
  },
  // More projects will be added later
];

export function NFTEnergyCommunitySpotlight() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasProjects = communityProjects.length > 0;

  const nextSlide = () => {
    if (hasProjects) {
      setCurrentSlide((prev) => (prev + 1) % (communityProjects.length + 1)); // +1 for info slide
    }
  };

  const prevSlide = () => {
    if (hasProjects) {
      setCurrentSlide((prev) => (prev - 1 + communityProjects.length + 1) % (communityProjects.length + 1));
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id="community" className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Community Spotlight</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Discover the vibrant communities we proudly feature on our cans. We invite you to explore their unique stories, passions, and contributions.
          </p>
        </div>

        {/* Community Spotlight Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <div className="aspect-[4/3] md:aspect-[4/3] min-h-[500px] md:min-h-0 relative">
              {/* Info Slide */}
              {currentSlide === 0 && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-purple-900 to-fuchsia-800 flex items-center justify-center p-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl mx-auto flex items-center justify-center p-3">
                      <Image
                        src="/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png"
                        alt="NFT Energy Logo"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">01</span>
                        <span className="text-white/60 text-sm">-06</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                        WHAT IS COMMUNITY<br />SPOTLIGHT?
                      </h3>
                      <p className="text-white/80 leading-relaxed max-w-md mx-auto">
                        Discover the vibrant communities we proudly feature on our cans. We invite you to explore their unique stories, passions, and contributions, and see for yourself what makes them truly stand out.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Community Project Slides */}
              {hasProjects && currentSlide > 0 && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-purple-900 to-fuchsia-800 flex items-center justify-center p-4 md:p-8">
                  {(() => {
                    const project = communityProjects[currentSlide - 1];
                    if (!project) return null;

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-center w-full max-w-4xl h-full">
                        {/* Project Info */}
                        <div className="space-y-4 md:space-y-6 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">
                              0{currentSlide + 1}
                            </span>
                            <span className="text-white/60 text-sm">
                              -0{communityProjects.length + 1}
                            </span>
                          </div>
                          
                          <div className="w-20 h-20 bg-gradient-to-r from-fuchsia-400 to-pink-400 rounded-full mx-auto lg:mx-0 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {project.id === 'pigeons-ny' ? 'PoNY' : project.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          
                          <div className="text-center lg:text-left">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 md:mb-4">
                              {project.name.toUpperCase()}
                            </h3>
                            <p className="text-white/80 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                              {project.description}
                            </p>
                            
                            {/* Social Links */}
                            <div className="flex justify-center lg:justify-start space-x-4">
                              {project.socialLinks.twitter && (
                                <a
                                  href={project.socialLinks.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                  <span className="text-white text-xs font-bold">X</span>
                                </a>
                              )}
                              {project.socialLinks.website && (
                                <a
                                  href={project.socialLinks.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                  <Icon name="home" size="sm" className="text-white" />
                                </a>
                              )}
                              {project.socialLinks.discord && (
                                <a
                                  href={project.socialLinks.discord}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                  <Icon name="discord" size="sm" className="text-white" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Product Image */}
                        <div className="flex justify-center lg:order-2">
                          <div className="w-48 h-60 md:w-64 md:h-80 rounded-lg overflow-hidden">
                            <Image
                              src={project.image}
                              alt={`NFT Energy Can featuring ${project.name}`}
                              width={256}
                              height={320}
                              className="w-full h-full object-contain bg-gradient-to-br from-blue-400/20 to-purple-400/20"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute right-20 bottom-6 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Icon name="arrow-left" size="sm" className="text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-6 bottom-6 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Icon name="arrow-right" size="sm" className="text-white" />
              </button>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: communityProjects.length + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-fuchsia-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h4 className="text-white font-semibold mb-3">Disclaimer:</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              The Community Spotlight section cans serve as a platform to feature and promote select NFT projects. While we strive to showcase reputable and innovative projects, we want to emphasize that NFT ENERGY is not responsible for the actions, behaviors, or outcomes of these featured NFT projects. The inclusion of a project in the Community Spotlight does not constitute an endorsement or guarantee of its longevity, financial performance, or ethical practices. We strongly advise individuals to conduct their own due diligence and research before engaging in any transactions or investments related to the featured NFT projects. We encourage our community members to exercise caution and make informed decisions when interacting with the NFT ecosystem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
