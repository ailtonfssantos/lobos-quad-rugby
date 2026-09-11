// frontend/src/pages/About.jsx
import Hero from './About/Hero';
import WhoWeAre from './About/WhoWeAre';
import Numbers from './About/Numbers';
import Mission from './About/Mission';
import WhatWeDo from './About/WhatWeDo';
import History from './About/History';
import SpanishTeam from './About/SpanishTeam';
import Video from './About/Video';
import Gallery from './About/Gallery';
import Values from './About/Values';
import CTA from './About/CTA';

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