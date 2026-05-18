import HeroSection from "@/components/HeroSection"
import FeaturesBanner from "@/components/FeaturesBanner"
import HowItWorks from "@/components/HowItWorks"
import FeaturedSpaces from "@/components/FeaturedSpaces"
import CityGrid from "@/components/CityGrid"
import TestimonialsSection from "@/components/TestimonialsSection"
import MembershipCTA from "@/components/MembershipCTA"
import NewsletterSection from "@/components/NewsletterSection"

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesBanner />
      <HowItWorks />
      <FeaturedSpaces />
      <CityGrid />
      <TestimonialsSection />
      <MembershipCTA />
      <NewsletterSection />
    </>
  )
}
