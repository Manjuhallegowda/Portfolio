import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import VisionSection from '@/components/VisionSection';
import ProjectsSection from '@/components/ProjectsSection';
import AchievementsSection from '@/components/AchievementsSection';
import ContactSection from '@/components/ContactSection';
import BlogsSection from '@/components/BlogsSection';
import HireMePopup from '@/components/HireMePopup';

interface SectionContent {
  title?: string;
  content?: string;
  images?: { url: string; alt?: string }[];
  links?: { text: string; url: string; target?: '_self' | '_blank' }[];
  metadata?: {
    projectsCount?: number;
    codeCount?: number;
    startupsCount?: number;
    companyName?: string;
    companyUrl?: string;
  };
}

const Index = () => {
  const [isHireMePopupOpen, setIsHireMePopupOpen] = useState(false);
  const [visionSectionData, setVisionSectionData] =
    useState<SectionContent | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        const yOffset = -80; // Adjust this value to match your navigation bar's height
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [location]);

  useEffect(() => {
    const fetchVisionSection = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/sections/vision-section'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVisionSectionData(data);
      } catch (err: any) {
        console.error('Failed to fetch vision section:', err);
      }
    };

    fetchVisionSection();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onHireMeClick={() => setIsHireMePopupOpen(true)} />
      <div>
        <HeroSection />
      </div>
      <div>
        {' '}
        {/* Added a parent div here */}
        <VisionSection sectionData={visionSectionData} />
        <section id="expertise">
          <ExpertiseSection />
        </section>
        <section id="projects">
          <ProjectsSection />
        </section>
        <section id="achievements">
          <AchievementsSection />
        </section>
        <ContactSection />
      </div>{' '}
      {/* Closing the parent div */}
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 RanStack Solutions. All Rights Reserverd. </p>
          <p className="mt-2">
            Proudly built by{' '}
            <a
              href="http://www.ranstacksolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              RanStack Solutions
            </a>
          </p>
        </div>
      </footer>
      <HireMePopup
        open={isHireMePopupOpen}
        onOpenChange={setIsHireMePopupOpen}
      />
    </div>
  );
};

export default Index;
