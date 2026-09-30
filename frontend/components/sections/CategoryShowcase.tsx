"use client";

import React from "react";
import { CategoryType } from "@/types";
import { useApp } from "@/context/AppContext";
import { Sparkles, ArrowRight, Music, Laptop, Palette, Utensils, Shirt, GraduationCap } from "lucide-react";

interface CategoryShowcaseProps {
  onSelectCategory: (cat: CategoryType) => void;
  selectedCategory: CategoryType | "All";
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const { events } = useApp();

  const categoryCards: {
    type: CategoryType;
    title: string;
    description: string;
    image: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
  }[] = [
    {
      type: "Fashion",
      title: "Fashion & Style",
      description: "Runway galas, streetwear drops & bespoke couture expos",
      image: "/Fashion1.jpeg",
      icon: <Shirt className="h-5 w-5 text-pink-400" />,
      color: "from-pink-600 via-hibiscus-600 to-hibiscus-700",
      borderColor: "hover:border-pink-500",
    },
    {
      type: "Tech",
      title: "Tech & Innovation",
      description: "AI summits, dev hackathons & tech product showcases",
      image: "/Tech1.jpeg",
      icon: <Laptop className="h-5 w-5 text-blue-400" />,
      color: "from-blue-600 via-cyan-600 to-indigo-700",
      borderColor: "hover:border-cyan-500",
    },
    {
      type: "Arts",
      title: "Arts & Culture",
      description: "Visual art biennales, sculpture galleries & film fests",
      image: "/ART1.jpeg",
      icon: <Palette className="h-5 w-5 text-hibiscus-400" />,
      color: "from-hibiscus-600 via-fuchsia-600 to-pink-700",
      borderColor: "hover:border-hibiscus-500",
    },
    {
      type: "Food",
      title: "Food & Gastronomy",
      description: "Culinary festivals, craft beer tastings & grill master showdowns",
      image: "/FOOD1.jpeg",
      icon: <Utensils className="h-5 w-5 text-marigold-400" />,
      color: "from-marigold-600 via-marigold-600 to-hibiscus-700",
      borderColor: "hover:border-marigold-500",
    },
    {
      type: "Concerts",
      title: "Concerts & Music",
      description: "Live afrobeat festivals, acoustic sessions & sunset rooftop vibes",
      image: "/Concert1.jpeg",
      icon: <Music className="h-5 w-5 text-marigold-400" />,
      color: "from-marigold-600 via-hibiscus-600 to-marigold-600",
      borderColor: "hover:border-marigold-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-marigold-600">
            <Sparkles className="h-4 w-4 text-marigold-500 animate-spin" />
            Curated Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink-900 dark:text-white mt-1">
            Explore by Experience Type
          </h2>
        </div>
        <p className="text-xs text-ink-500 max-w-md">
          Click any category below to instantly filter the live marketplace and discover upcoming events near you.
        </p>
      </div>

      {/* 5-Card Interactive Grid with Real Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categoryCards.map((cat) => {
          const count = events.filter((e) => e.category === cat.type).length;
          const isSelected = selectedCategory === cat.type;

          return (
            <div
              key={cat.type}
              onClick={() => onSelectCategory(cat.type)}
              className={`group relative h-72 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border border-ink-200 dark:border-ink-800 shadow-md hover:shadow-2xl hover:-translate-y-2 ${cat.borderColor} ${
                isSelected ? "ring-4 ring-marigold-500 scale-[1.02]" : ""
              }`}
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlays */}
              <div className={`absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity`} />
              <div className={`absolute inset-0 bg-gradient-to-b ${cat.color} opacity-20 group-hover:opacity-40 transition-opacity`} />

              {/* Badge for Event Count */}
              <div className="absolute top-4 left-4 z-10">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                  {cat.icon}
                  {count} Events
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-white space-y-2">
                <h3 className="text-lg font-black tracking-tight leading-snug group-hover:text-marigold-300 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-ink-300 line-clamp-2 font-normal leading-relaxed opacity-90">
                  {cat.description}
                </p>

                <div className="pt-2 flex items-center text-xs font-bold text-marigold-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore {cat.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
