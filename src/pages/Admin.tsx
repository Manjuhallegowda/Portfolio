import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navigation from '@/components/Navigation';
import HireMePopup from '@/components/HireMePopup';
import { signInWithEmail, logout, auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useLoading } from '@/hooks/useLoading';
import BlogEditor from '@/components/BlogEditor';
import ProjectEditor from '@/components/ProjectEditor';
import AchievementEditor from '@/components/AchievementEditor';
import SectionEditor from '@/components/SectionEditor';
import ContactEditor from '@/components/ContactEditor';

import { Blog } from '@/interfaces/Blog';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  technologies: string[];
  category: string;
  images: string[];
  featured_image_url: string;
  demo_url: string;
  source_url: string;
  status: string;
  is_featured: boolean;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  reply_message: string;
  replied_at: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalBlogs: number;
  publishedBlogs: number;
  totalProjects: number;
  publishedProjects: number;
  totalContacts: number;
  unreadContacts: number;
  totalAchievements: number;
  publishedAchievements: number;
  totalSections: number;
  publishedSections: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  items: string[];
  icon: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

interface Section {
  id?: string;
  name: string;
  page: string;
  title?: string;
  subtitle?: string;
  content?: string;
  images?: { public_id?: string; url: string; alt?: string }[];
  videos?: { url: string; alt?: string }[];
  links?: { text: string; url: string; target?: '_self' | '_blank' }[];
  order?: number;
  isPublished?: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

const Admin = () => {
  const [isHireMePopupOpen, setIsHireMePopupOpen] = useState(false);
  const { user, token, loading: authLoading } = useAuth();
  const { isLoading, showLoading, hideLoading } = useLoading();
  const isLoggedIn = !!user;

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token && isLoggedIn) {
      fetchDashboardData();
    }
  }, [token, isLoggedIn]);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Modal states
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);
  const [isProjectEditorOpen, setIsProjectEditorOpen] = useState(false);
  const [isAchievementEditorOpen, setIsAchievementEditorOpen] = useState(false);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [isContactEditorOpen, setIsContactEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);





  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading();
    setError('');
    setSuccess('');

    try {
      // Step 1: Sign in with Firebase
      await signInWithEmail(email, password);
      const firebaseUser = auth.currentUser; // More reliable way to get user

      if (!firebaseUser) {
        throw new Error('Login succeeded but user object is not available.');
      }

      // Step 2: Get the Firebase ID token
      const firebaseIdToken = await firebaseUser.getIdToken();

      // Step 3: Send the Firebase ID token to the backend's /login endpoint for user syncing
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: firebaseIdToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Login successful!');
        // The useAuth hook will handle setting the token and isLoggedIn state
        // We can now fetch dashboard data directly, as the token will be available via useAuth
        // fetchDashboardData(token); // This will be handled by a new useEffect
      } else {
        // If the backend fails, logout from Firebase to be safe
        await logout();
        setError(data.message || 'Backend user sync failed.');
      }
    } catch (error: any) {
      setError(error.message || 'Firebase login failed. Please check your credentials.');
      console.error('Login process error:', error);
    } finally {
      hideLoading();
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // Sign out from Firebase
      // The useAuth hook will handle clearing the token and isLoggedIn state
      localStorage.removeItem('authToken'); // Ensure the Firebase ID token is cleared
      // Clear all fetched data
      setStats(null);
      setBlogs([]);
      setProjects([]);
      setContacts([]);
      setAchievements([]); // Clear achievements as well
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return; // Use the token from useAuth hook
    showLoading();
    try {
      const [
        statsRes,
        blogsRes,
        projectsRes,
        contactsRes,
        achievementsRes,
        sectionsRes,
      ] = await Promise.all([
                            fetch('http://localhost:5000/api/admin/dashboard', {
                              headers: { Authorization: `Bearer ${token}` },
                            }),
                            fetch('http://localhost:5000/api/blogs/admin/all?limit=10', {
                              headers: { Authorization: `Bearer ${token}` },
                            }),
                            fetch('http://localhost:5000/api/projects/admin/all?limit=10', {
                              headers: { Authorization: `Bearer ${token}` },
                            }),
                            fetch('http://localhost:5000/api/contact?limit=10', {
                              headers: { Authorization: `Bearer ${token}` },
                            }),
                            fetch('http://localhost:5000/api/achievements/admin/all', {
                              headers: { Authorization: `Bearer ${token}` },
                            }),
                            fetch('http://localhost:5000/api/sections', {
                              headers: { Authorization: `Bearer ${token}` },
                            }),      ]);

      const [
        statsData,
        blogsData,
        projectsData,
        contactsData,
        achievementsData,
        sectionsData,
      ] = await Promise.all([
        statsRes.json(),
        blogsRes.json(),
        projectsRes.json(),
        contactsRes.json(),
        achievementsRes.json(),
        sectionsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data.stats);
      if (blogsData.success) {
        const transformedBlogs = blogsData.data.map((blog: any) => ({
          ...blog,
          createdAt: blog.created_at,
          updatedAt: blog.updated_at,
        }));
        setBlogs(transformedBlogs);
      }
      if (projectsData.success) {
        console.log('Fetched projects data:', projectsData.data); // Add this line
        const transformedProjects = projectsData.data.map((project: any) => ({
          ...project,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        }));
        setProjects(transformedProjects);
      }
      if (contactsData.success) {
        const transformedContacts = contactsData.data.map((contact: any) => ({
          ...contact,
          createdAt: contact.created_at,
          updatedAt: contact.updated_at,
        }));
        setContacts(transformedContacts);
      }
      if (achievementsData.success) {
        const transformedAchievements = achievementsData.data.map((achievement: any) => ({
          ...achievement,
          createdAt: achievement.created_at,
          updatedAt: achievement.updated_at,
        }));
        setAchievements(transformedAchievements);
      }
      if (sectionsData.success) {
        const transformedSections = sectionsData.data.map((section: any) => ({
          ...section,
          isPublished: section.is_published,
          createdAt: section.created_at,
          updatedAt: section.updated_at,
        }));
        setSections(transformedSections);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Your session might be expired.');
      handleLogout(); // Log out if the token is invalid
    } finally {
      hideLoading();
    }
  };

  const handleSaveBlog = async (formData: FormData) => {
    if (!token) return; // Use the token from useAuth hook

    const isEditing = !!editingBlog;
    const url = isEditing
      ? `http://localhost:5000/api/blogs/${editingBlog?.id}`
      : 'http://localhost:5000/api/blogs';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccess(`Blog ${isEditing ? 'updated' : 'created'} successfully!`);
        fetchDashboardData();
        setIsBlogEditorOpen(false);
        setEditingBlog(null);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || `Failed to ${isEditing ? 'update' : 'create'} blog`
        );
      }
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} blog`);
    }
  };

  const handleSaveProject = async (formData: FormData) => {
    if (!token) return; // Use the token from useAuth hook

    const isEditing = !!editingProject;
    const url = isEditing
      ? `http://localhost:5000/api/projects/${editingProject?.id}`
      : 'http://localhost:5000/api/projects';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccess(
          `Project ${isEditing ? 'updated' : 'created'} successfully!`
        );
        fetchDashboardData();
        setIsProjectEditorOpen(false);
        setEditingProject(null);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message ||
            `Failed to ${isEditing ? 'update' : 'create'} project`
        );
      }
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} project`);
    }
  };

  const handleSaveAchievement = async (achievement: Partial<Achievement>) => {
    if (!token) return; // Use the token from useAuth hook

    const isEditing = !!editingAchievement;
    const url = isEditing
      ? `http://localhost:5000/api/achievements/${editingAchievement?.id}`
      : 'http://localhost:5000/api/achievements';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(achievement),
      });

      if (response.ok) {
        setSuccess(
          `Achievement ${isEditing ? 'updated' : 'created'} successfully!`
        );
        fetchDashboardData();
        setIsAchievementEditorOpen(false);
        setEditingAchievement(null);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message ||
            `Failed to ${isEditing ? 'update' : 'create'} achievement`
        );
      }
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} achievement`);
    }
  };

  const handleSaveSection = async (section: Section) => {
    if (!token) return;

    const isEditing = !!section.id;
    const url = isEditing
      ? `http://localhost:5000/api/sections/${section.id}`
      : 'http://localhost:5000/api/sections';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      ...section,
      is_published: section.isPublished,
    };
    // @ts-ignore
    delete payload.isPublished; // remove the frontend-only property

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(`Section ${isEditing ? 'updated' : 'created'} successfully!`);
        fetchDashboardData();
        setIsSectionEditorOpen(false);
        setEditingSection(null);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || `Failed to ${isEditing ? 'update' : 'create'} section`
        );
      }
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} section`);
    }
  };

  const handleSaveContactReply = async (reply: { reply_message: string }) => {
    if (!token || !editingContact) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/contact/${editingContact.id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reply),
        }
      );

      if (response.ok) {
        setSuccess('Reply sent successfully!');
        fetchDashboardData();
        setIsContactEditorOpen(false);
        setEditingContact(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send reply');
      }
    } catch (error) {
      setError('Failed to send reply');
    }
  };

  const toggleBlogPublish = async (blogId: string, currentStatus: boolean) => {
    if (!token) return; // Use the token from useAuth hook

    try {
      const response = await fetch(
        `http://localhost:5000/api/blogs/${blogId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPublished: !currentStatus }),
        }
      );

      if (response.ok) {
        setBlogs(
          blogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, isPublished: !currentStatus }
              : blog
          )
        );
        setSuccess('Blog status updated successfully!');
      }
    } catch (error) {
      setError('Failed to update blog status');
    }
  };

  const toggleProjectPublish = async (
    projectId: string,
    currentStatus: boolean
  ) => {
    if (!token) return; // Use the token from useAuth hook

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPublished: !currentStatus }),
        }
      );

      if (response.ok) {
        setProjects(
          projects.map((project) =>
            project.id === projectId
              ? { ...project, isPublished: !currentStatus }
              : project
          )
        );
        setSuccess('Project status updated successfully!');
      }
    } catch (error) {
      setError('Failed to update project status');
    }
  };

  const toggleAchievementPublish = async (
    achievementId: string,
    currentStatus: boolean
  ) => {
    if (!token) return; // Use the token from useAuth hook

    try {
      const response = await fetch(
        `http://localhost:5000/api/achievements/${achievementId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPublished: !currentStatus }),
        }
      );

      if (response.ok) {
        setAchievements(
          achievements.map((achievement) =>
            achievement.id === achievementId
              ? { ...achievement, isPublished: !currentStatus }
              : achievement
          )
        );
        setSuccess('Achievement status updated successfully!');
      }
    } catch (error) {
      setError('Failed to update achievement status');
    }
  };

  const toggleSectionPublish = async (
    sectionId: string,
    currentStatus: boolean
  ) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/sections/${sectionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_published: !currentStatus }),
        }
      );

      if (response.ok) {
        setSections(
          sections.map((section) =>
            section.id === sectionId
              ? { ...section, isPublished: !currentStatus }
              : section
          )
        );
        setSuccess('Section status updated successfully!');
      } else {
        setError('Failed to update section status');
      }
    } catch (error) {
      setError('Failed to update section status');
    }
  };

  const markContactAsRead = async (
    contactId: string,
    currentStatus: boolean
  ) => {
    if (!token) return; // Use the token from useAuth hook

    try {
      const response = await fetch(
        `http://localhost:5000/api/contact/${contactId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_read: !currentStatus }),
        }
      );

      if (response.ok) {
        setContacts(
          contacts.map((contact) =>
            contact.id === contactId
              ? { ...contact, is_read: !currentStatus }
              : contact
          )
        );
        setSuccess('Contact status updated successfully!');
      }
    } catch (error) {
      setError('Failed to update contact status');
    }
  };

  const handleDelete = async (resource: string, id: string) => {
    if (!token) return; // Use the token from useAuth hook

    try {
      const response = await fetch(
        `http://localhost:5000/api/${resource}/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSuccess(`${resource} deleted successfully!`);
        fetchDashboardData();
      }
    } catch (error) {
      setError(`Failed to delete ${resource}`);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/sections/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSuccess('Section deleted successfully!');
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete section');
      }
    } catch (error) {
      setError('Failed to delete section');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onHireMeClick={() => setIsHireMePopupOpen(true)} isAdminPage={true} />

        <motion.div
          className="pt-32 pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-6 max-w-md">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className="text-muted-foreground">
                Access the admin panel to manage your portfolio content
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your admin credentials to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        <HireMePopup
          open={isHireMePopupOpen}
          onOpenChange={setIsHireMePopupOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onHireMeClick={() => setIsHireMePopupOpen(true)} isAdminPage={true} />

      <motion.div
        className="pt-32 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your portfolio content and monitor activity
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </motion.div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {stats && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Published Blogs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.publishedBlogs}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Published Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.publishedProjects}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Published Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.publishedAchievements}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unread Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.unreadContacts}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Tabs defaultValue="blogs" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="blogs">Blogs</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="blogs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Blog Management</h2>
                <Button
                  onClick={() => {
                    setEditingBlog(null);
                    setIsBlogEditorOpen(true);
                  }}
                >
                  Add New Blog
                </Button>
              </div>
              <div className="grid gap-4">
                {blogs.map((blog) => (
                  <Card key={blog.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {blog.title}
                          </CardTitle>
                          <CardDescription>{blog.excerpt}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={blog.isPublished ? 'default' : 'secondary'}
                          >
                            {blog.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleBlogPublish(blog.id, blog.isPublished)
                            }
                          >
                            {blog.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingBlog(blog);
                              setIsBlogEditorOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete('blogs', blog.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Views: {blog.views}</span>
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Project Management</h2>
                <Button
                  onClick={() => {
                    setEditingProject(null);
                    setIsProjectEditorOpen(true);
                  }}
                >
                  Add New Project
                </Button>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {project.title}
                          </CardTitle>
                          <CardDescription>
                            {project.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              project.isPublished ? 'default' : 'secondary'
                            }
                          >
                            {project.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleProjectPublish(
                                project.id,
                                project.isPublished
                              )
                            }
                          >
                            {project.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingProject(project);
                              setIsProjectEditorOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDelete('projects', project.id)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{project.category}</span>
                        <span>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                  Achievement Management
                </h2>
                <Button
                  onClick={() => {
                    setEditingAchievement(null);
                    setIsAchievementEditorOpen(true);
                  }}
                >
                  Add New Achievement
                </Button>
              </div>
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {achievement.title}
                          </CardTitle>
                          <CardDescription>
                            {achievement.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              achievement.isPublished ? 'default' : 'secondary'
                            }
                          >
                            {achievement.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleAchievementPublish(
                                achievement.id,
                                achievement.isPublished
                              )
                            }
                          >
                            {achievement.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingAchievement(achievement);
                              setIsAchievementEditorOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDelete('achievements', achievement.id)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{achievement.category}</span>
                        <span>
                          {new Date(achievement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Section Management</h2>
                <Button
                  onClick={() => {
                    setEditingSection(null);
                    setIsSectionEditorOpen(true);
                  }}
                >
                  Add New Section
                </Button>
              </div>
              <div className="grid gap-4">
                {sections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {section.name} ({section.page})
                          </CardTitle>
                          <CardDescription>{section.title}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              section.isPublished ? 'default' : 'secondary'
                            }
                          >
                            {section.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleSectionPublish(
                                section.id!,
                                section.isPublished!
                              )
                            }
                          >
                            {section.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingSection(section);
                              setIsSectionEditorOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSection(section.id!)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Order: {section.order}</span>
                        <span>
                          {new Date(section.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact Messages</h2>
              <div className="grid gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {contact.subject}
                          </CardTitle>
                          <CardDescription>
                            From: {contact.name} ({contact.email})
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={contact.is_read ? 'secondary' : 'default'}
                          >
                            {contact.is_read ? 'Read' : 'Unread'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              markContactAsRead(contact.id, contact.is_read)
                            }
                          >
                            {contact.is_read ? 'Mark Unread' : 'Mark Read'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingContact(contact);
                              setIsContactEditorOpen(true);
                            }}
                          >
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete('contact', contact.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      <HireMePopup
        open={isHireMePopupOpen}
        onOpenChange={setIsHireMePopupOpen}
      />

      <BlogEditor
        open={isBlogEditorOpen}
        onOpenChange={setIsBlogEditorOpen}
        blog={editingBlog}
        onSave={handleSaveBlog}
      />

      <ProjectEditor
        open={isProjectEditorOpen}
        onOpenChange={setIsProjectEditorOpen}
        project={editingProject}
        onSave={handleSaveProject}
      />

      <AchievementEditor
        open={isAchievementEditorOpen}
        onOpenChange={setIsAchievementEditorOpen}
        achievement={editingAchievement}
        onSave={handleSaveAchievement}
      />

      <SectionEditor
        open={isSectionEditorOpen}
        onOpenChange={setIsSectionEditorOpen}
        section={editingSection}
        onSave={handleSaveSection}
      />

      <ContactEditor
        open={isContactEditorOpen}
        onOpenChange={setIsContactEditorOpen}
        contact={editingContact}
        onSave={handleSaveContactReply}
      />
    </div>
  );
};

export default Admin;
