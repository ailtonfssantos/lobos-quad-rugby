// src/pages/About/index.jsx
import Hero from './Hero';
import WhoWeAre from './WhoWeAre';
import Numbers from './Numbers';
import Mission from './Mission';
import WhatWeDo from './WhatWeDo';
import History from './History';
import SpanishTeam from './SpanishTeam';
import Video from './Video';
import Gallery from './Gallery';
import Values from './Values';
import CTA from './CTA';

export default function About() {
  return (
    <main className="bg-black text-white overflow-hidden">
      <Hero />
      <WhoWeAre />
      <Numbers />
      <Mission />
      <WhatWeDo />
      <History />
      <SpanishTeam />
      <Video />
      <Gallery />
      <Values />
      <CTA />
    </main>
  );
}