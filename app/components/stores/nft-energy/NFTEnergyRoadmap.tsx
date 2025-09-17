// app/components/stores/nft-energy/NFTEnergyRoadmap.tsx
"use client";

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';

interface RoadmapPhase {
  phase: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  details: string[];
  cta?: {
    text: string;
    action: string;
  };
}

const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 1,
    title: "Foundation – Drink Creation & Market Entry",
    status: 'completed',
    description: "Phase one is complete. We perfected the formula, secured production, and co-packed our cans. NFT Energy exists not just as a Web3 project, but as a real energy drink on shelves today. The journey of bridging the real world with Web3 is live.",
    details: [
      "Formula perfected and tested",
      "Production partnerships secured",
      "Physical cans manufactured",
      "Market entry successful"
    ],
    cta: {
      text: "Shop Now",
      action: "shop"
    }
  },
  {
    phase: 2,
    title: "NFT Collection – The Official NFT Drop",
    status: 'current',
    description: "Our 2,500-piece NFT collection featuring the Energy Wabbits, inspired by the legacy of the Energizer Bunny. We just keep going… and going… and going.",
    details: [
      "2,500 unique Energy Wabbits NFTs",
      "Official NFT collection representing Web3 presence",
      "Represents resilience, hustle, and community culture",
      "Proceeds fuel operations, development, and marketing",
      "Drives brand growth and expands distribution"
    ],
    cta: {
      text: "Join the Mint List",
      action: "mint"
    }
  },
  {
    phase: 3,
    title: "Token Launch – Building the Economy",
    status: 'upcoming',
    description: "With the community locked in and the collection live, we introduce the NFT Energy Token. A system designed to reward holders, artists, and ambassadors. This structured economy ties real-world product experiences to on-chain value, scaling NFT Energy into national distribution while fueling large-scale growth and rewards for our community.",
    details: [
      "NFT Energy Token launch",
      "Reward system for holders, artists, and ambassadors",
      "Real-world product integration with on-chain value",
      "National distribution scaling",
      "Community rewards and incentives"
    ]
  },
  {
    phase: 4,
    title: "Expansion – IRL & Lifestyle Integration",
    status: 'upcoming',
    description: "The final phase is all about culture. From IRL pop-ups and music events to creative community activations, this is where NFT Energy becomes more than a product – it becomes a lifestyle movement.",
    details: [
      "IRL pop-up events and activations",
      "Music events and cultural partnerships",
      "Creative community activations",
      "Lifestyle movement expansion",
      "Cultural brand integration"
    ]
  }
];

export function NFTEnergyRoadmap() {
  const handleCTAClick = (action: string) => {
    if (action === 'shop') {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'mint') {
      // For now, just scroll to contact or show coming soon message
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getPhaseStatusColor = (status: RoadmapPhase['status']) => {
    switch (status) {
      case 'completed':
        return 'from-green-400 to-emerald-400';
      case 'current':
        return 'from-fuchsia-400 to-pink-400';
      case 'upcoming':
        return 'from-purple-400 to-indigo-400';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getPhaseStatusText = (status: RoadmapPhase['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'current':
        return 'In Progress';
      case 'upcoming':
        return 'Coming Soon';
      default:
        return 'Unknown';
    }
  };

  return (
    <section id="roadmap" className="py-16 bg-black/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Roadmap</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Our journey from concept to culture. Follow our progress as we build the future of Web3-integrated beverages.
          </p>
        </div>

        <div className="space-y-8">
          {roadmapPhases.map((phase, index) => (
            <div
              key={phase.phase}
              className="relative flex items-start space-x-6"
            >
              {/* Timeline Line */}
              {index < roadmapPhases.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-full bg-white/20"></div>
              )}

              {/* Phase Number */}
              <div className={`
                relative z-10 w-12 h-12 rounded-full bg-gradient-to-r ${getPhaseStatusColor(phase.status)} 
                flex items-center justify-center flex-shrink-0
              `}>
                <span className="text-white font-bold text-lg">{phase.phase}</span>
              </div>

              {/* Phase Content */}
              <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">Phase {phase.phase}</h3>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPhaseStatusColor(phase.status)} text-white
                      `}>
                        {getPhaseStatusText(phase.status)}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-white/90 mb-3">{phase.title}</h4>
                  </div>
                  
                  {phase.cta && (
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCTAClick(phase.cta!.action)}
                        className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 border-0"
                        icon={<Icon name={phase.cta.action === 'shop' ? 'shopping-cart' : 'star'} size="sm" />}
                      >
                        {phase.cta.text}
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-white/70 mb-4 leading-relaxed">
                  {phase.description}
                </p>

                {phase.details.length > 0 && (
                  <ul className="space-y-2">
                    {phase.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-3">
                        <Icon 
                          name={phase.status === 'completed' ? 'check' : 'star'} 
                          size="sm" 
                          className={`mt-0.5 ${
                            phase.status === 'completed' ? 'text-green-400' : 'text-fuchsia-400'
                          }`} 
                        />
                        <span className="text-white/60 text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60 mb-4">Ready to be part of the journey?</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 border-0"
            icon={<Icon name="shopping-cart" size="sm" />}
          >
            Shop NFT Energy Now
          </Button>
        </div>
      </div>
    </section>
  );
}
