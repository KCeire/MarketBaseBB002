// app/components/stores/nft-energy/NFTEnergyFAQ.tsx
"use client";

import { useState } from 'react';
import { Icon } from '@/app/components/ui/Icon';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "When Mint?",
    answer: "Coming soon. Winter 2025 - sign up to get first access."
  },
  {
    question: "How Many NFT's In The Collection?",
    answer: "2,500 Energy Wabbits total. Limited supply."
  },
  {
    question: "What Are The NFT Holder Benefits?",
    answer: "• Voting rights (voting on future flavors and can designs)\n• Free 4-Pack of NFT Energy Drinks on initial mint not secondary market (shipping included)\n• Lifetime discounts on products\n• Brand ambassador perks & referral rewards\n• Airdrops"
  },
  {
    question: "How much?",
    answer: "Price will be revealed before launch. Whitelist spots get a better price."
  },
  {
    question: "What chain?",
    answer: "Base chain."
  },
  {
    question: "Why sign up?",
    answer: "You'll be whitelisted for early access + discounted mint pricing. Don't miss your spot."
  }
];

export function NFTEnergyFAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <section className="py-16 bg-black/20 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">F.A.Q</h2>
          <p className="text-white/70 text-lg">
            Everything you need to know about NFT Energy and our upcoming NFT collection.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <h3 className="text-white font-semibold text-lg pr-4">
                  {item.question}
                </h3>
                <div className={`transform transition-transform duration-200 ${
                  openItems.has(index) ? 'rotate-180' : ''
                }`}>
                  <Icon name="chevron-down" size="sm" className="text-white/60" />
                </div>
              </button>
              
              {openItems.has(index) && (
                <div className="px-6 pb-6">
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-white/70 leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div id="contact" className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h3>
            <p className="text-white/70 mb-6">
              Get in touch with the NFT Energy team for more information.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:info@nftenergydrinks.com"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 rounded-lg text-white font-medium transition-colors"
              >
                <Icon name="star" size="sm" />
                <span>Email Us</span>
              </a>
              
              <div className="flex items-center space-x-3">
                <a
                  href="https://x.com/nftenergydrinks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-xs font-bold">X</span>
                </a>
                <a
                  href="https://www.instagram.com/nftenergydrinks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-xs font-bold">IG</span>
                </a>
                <a
                  href="https://www.tiktok.com/@nftenergydrinks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-xs font-bold">TT</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
