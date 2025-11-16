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

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const Index = () => {
  const [isHireMePopupOpen, setIsHireMePopupOpen] = useState(false);
  const [visionSectionData, setVisionSectionData] =
    useState<SectionContent | null>(null);
  const location = useLocation();

  // Scroll to section when navigated with state.scrollTo
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const element = document.getElementById(state.scrollTo);
      if (element) {
        const yOffset = -80; // navbar height offset
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [location]);

  // Fetch vision section content
  useEffect(() => {
    const fetchVisionSection = async () => {
      try {
        const sectionResponse = await fetch(
          `${API_BASE_URL}/api/sections/vision-section`
        );

        if (!sectionResponse.ok) {
          throw new Error(`HTTP error! status: ${sectionResponse.status}`);
        }

        const data = await sectionResponse.json();
        // Assuming backend already returns shape matching SectionContent
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

        {/* If you want blogs on the home page, uncomment this: */}
        {/* <section id="blogs">
          <BlogsSection />
        </section> */}

        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 RanStack Solutions. All Rights Reserverd.</p>
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
