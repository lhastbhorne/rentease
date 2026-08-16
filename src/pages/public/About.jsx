import AboutHero from "../../components/about/AboutHero";
import Story from "../../components/about/Story";
import MissionVision from "../../components/about/MissionVision";
import CoreValues from "../../components/about/CoreValues";
import WhyChooseUs from "../../components/about/WhyChooseUs";
import Team from "../../components/about/Team";
import CompanyStats from "../../components/about/CompanyStats";
import AboutCTA from "../../components/about/AboutCTA";

function About() {
  return (
    <>
      <AboutHero />
      <Story />
      <MissionVision />
      <CoreValues />
      <WhyChooseUs />
      <Team />
      <CompanyStats />
      <AboutCTA />
    </>
  );
}

export default About;