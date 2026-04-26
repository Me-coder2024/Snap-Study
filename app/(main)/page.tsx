import Hero from "@/components/landing/Hero";
import SemesterSection from "@/components/landing/SemesterSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SemesterSection />
      <FeaturesSection />
      <HowItWorks />
    </>
  );
}
