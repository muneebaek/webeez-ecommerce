import CurrentPieces from "@/components/home/CurrentPieces";
import Directory from "@/components/home/Directory";
import MadeToMove from "@/components/home/MadeToMove";
import NewArrivals from "@/components/home/NewArrivals";
import Newsletter from "@/components/home/Newsletter";
import Hero from "@/components/home/Hero";
import Journal from "@/components/home/Journal";
import LookDossier from "@/components/home/LookDossier";
import Manifesto from "@/components/home/Manifesto";
import Portals from "@/components/home/Portals";
import QuietlyUnexpected from "@/components/home/QuietlyUnexpected";
import SeenInTheWild from "@/components/home/SeenInTheWild";
import SelectionStrip from "@/components/home/SelectionStrip";
import Testimonials from "@/components/home/Testimonials";
import TrendingNow from "@/components/home/TrendingNow";
import UnderPrice from "@/components/home/UnderPrice";

export default function Home() {
  return (
    <>
      <Hero />
      <SelectionStrip />
      <Portals />
      <Manifesto />
      <CurrentPieces />
      <QuietlyUnexpected />
      <Directory />
      <TrendingNow />
      <MadeToMove />
      <Journal />
      <NewArrivals />
      <UnderPrice />
      <LookDossier />
      <Testimonials />
      <SeenInTheWild />
      <Newsletter />
    </>
  );
}
