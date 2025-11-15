import supabase from '../config/supabase.js';

const defaultSections = {
  'hero-section': {
    name: 'hero-section',
    page: 'home',
    title: 'Building Digital Products',
    subtitle: '',
    content:
      'From concept to deployment - I craft high-performance web apps, Android applications, and SEO-optimized websites that drive real business results.',
    images: [],
    videos: [],
    links: [],
    order: 1,
    is_published: true,
    metadata: {
      tagline: 'Startup Founder & Full-Stack Developer',
    },
  },
  'vision-section': {
    name: 'vision-section',
    page: 'home',
    title:
      "Great products aren't built in isolation they're crafted through code, strategy, and relentless iteration.",
    subtitle: '',
    content: `As a founder who codes, I bridge the gap between vision and
              execution. At my company RanStack Solutions, I don't just manage development I build it. From writing the
              first line of code to deploying at scale, I'm hands-on in
              creating products that solve real problems and drive measurable
              growth.`,
    images: [],
    videos: [],
    links: [],
    order: 2,
    is_published: true,
    metadata: {
      projectsCount: 50,
      codeCount: 100000,
      startupsCount: 3,
      companyName: 'RanStack Solutions',
      companyUrl: 'http://www.ranstacksolutions.com',
    },
  },
  'expertise-section': {
    name: 'expertise-section',
    page: 'home',
    title: 'Technical Expertise',
    subtitle: '',
    content:
      'From ideation to deployment, I handle every aspect of building digital products that scale and perform.',
    images: [],
    videos: [],
    links: [],
    order: 3,
    is_published: true,
    metadata: {
      expertiseAreas: [
        {
          iconName: 'Globe',
          title: 'Web Development',
          description:
            'Full-stack web applications using modern frameworks like React, Node.js, and cloud platforms.',
        },
        {
          iconName: 'Smartphone',
          title: 'Mobile Development',
          description:
            'Native Android applications and cross-platform solutions with React Native.',
        },
        {
          iconName: 'TrendingUp',
          title: 'SEO & Performance',
          description:
            'Search engine optimization and performance tuning for maximum visibility and speed.',
        },
        {
          iconName: 'Code',
          title: 'Custom Solutions',
          description:
            'Tailored software solutions designed to meet specific business requirements.',
        },
      ],
    },
  },
  'projects-section': {
    name: 'projects-section',
    page: 'home',
    title: 'Featured Projects',
    subtitle: '',
    content:
      'Real-world applications and successful campaigns - from MVPs to production-ready platforms serving thousands of users.',
    images: [],
    videos: [],
    links: [],
    order: 4,
    is_published: true,
    metadata: {},
  },
  'achievements-section': {
    name: 'achievements-section',
    page: 'home',
    title: 'Skills & Technologies',
    subtitle: '',
    content:
      'Modern tech stack and proven methodologies for building scalable digital products.',
    images: [],
    videos: [],
    links: [],
    order: 5,
    is_published: true,
    metadata: {},
  },
  'blogs-section': {
    name: 'blogs-section',
    page: 'home',
    title: 'Latest Blogs',
    subtitle: '',
    content:
      'Insights, tutorials, and thoughts on web development, technology, and software engineering.',
    images: [],
    videos: [],
    links: [],
    order: 6,
    is_published: true,
    metadata: {},
  },
  'contact-section': {
    name: 'contact-section',
    page: 'home',
    title: "Let's Build Together",
    subtitle: '',
    content: `Have a project in mind...?
      Need a technical co-founder or full-stack developer...?
      Let's discuss how we can bring your vision to life from
              initial concept to live deployment.`,
    images: [],
    videos: [],
    links: [],
    order: 7,
    is_published: true,
    metadata: {
      email: 'manjuhallegowda@gmail.com',
      additionalInfo: `On-Site/Remote, global availability
              Open for freelance & equity partnerships`,
      socialLinks: [
        {
          platform: 'LinkedIn',
          url: 'https://www.linkedin.com/in/manjuhallegowda/',
          iconName: 'Linkedin',
        },
        {
          platform: 'Twitter',
          url: 'https://www.twitter.com/in/manjuhallegowda/',
          iconName: 'Twitter',
        },
        {
          platform: 'Instagram',
          url: 'https://www.instagram.com/manju_halleygowda/',
          iconName: 'Instagram',
        },
      ],
    },
  },
};

const seedDefaultSections = async () => {
  try {
    // Fetch the first user to act as the author for the sections.
    // This assumes you have at least one user in your 'users' table.
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError) {
      console.error('Error fetching user for seeding:', userError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No users found in the database. Skipping section seeding.');
      return;
    }

    const authorId = users[0].id;

    const sectionsToSeed = Object.values(defaultSections);

    for (const section of sectionsToSeed) {
      const { data: existingSection, error: selectError } = await supabase
        .from('sections')
        .select('name')
        .eq('name', section.name)
        .limit(1);

      if (selectError) {
        console.error(
          `Error checking for section ${section.name}:`,
          selectError.message
        );
        continue; // Skip to the next section
      }

      if (!existingSection || existingSection.length === 0) {
        // Section does not exist, so insert it
        const { error: insertError } = await supabase.from('sections').insert([
          {
            name: section.name,
            page: section.page,
            title: section.title,
            subtitle: section.subtitle,
            content: section.content,
            images: section.images,
            videos: section.videos,
            links: section.links,
            order: section.order,
            is_published: section.is_published,
            metadata: section.metadata,
            author_id: authorId,
          },
        ]);

        if (insertError) {
          console.error(
            `Error inserting section ${section.name}:`,
            insertError.message
          );
        } else {
          console.log(`Successfully seeded section: ${section.name}`);
        }
      } else {
        console.log(`Section ${section.name} already exists. Skipping.`);
      }
    }
  } catch (err) {
    console.error('An unexpected error occurred during seeding:', err.message);
  }
};

export default seedDefaultSections;

