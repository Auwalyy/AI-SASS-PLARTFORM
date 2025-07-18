"use client";

import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { Button } from "./ui/button";

const LandingHero = () => {
  return (
    <div className="text-white font-bold py-36 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold">
        <h1>The Best AI Tool for</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <TypewriterComponent
            options={{
              strings: [
                "Code Generation",
                "Text Generation",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>

      <div className="text-sm md:text-2xl font-light text-zinc-400">
        Create content using AI 100x faster.
      </div>

      <div>
        <Link href="/dashboard"> {/* Always goes to dashboard */}
          <Button variant="default" className="md:text-lg p-4 md:p-6 rounded-full font-semibold">
            Start Generating for Free
          </Button>
        </Link>
      </div>

      <div className="text-zinc-400 text-xs md:text-sm font-normal">
        No credit card required. No hidden fees.
      </div>
    </div>
  );
};

export default LandingHero;