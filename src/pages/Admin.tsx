import { useEffect, useState } from 'react';
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
import {
  FileText,
  Layers3,
  Award,
  LayoutTemplate,
  Inbox,
  Users,
} from 'lucide-react';

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
  updatedAt: string;
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
  replied_at: string | null;
  createdAt: string;
  updatedAt: string;
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
  updatedAt: string;
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

  useEffect(() => {
    if (token && isLoggedIn) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoggedIn]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading();
    setError('');
    setSuccess('');

    try {
      await signInWithEmail(email, password);
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error('Login succeeded but user object is not available.');
      }

      const firebaseIdToken = await firebaseUser.getIdToken();

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
      } else {
        await logout();
        setError(data.message || 'Backend user sync failed.');
      }
    } catch (err: any) {
      setError(
        err.message || 'Firebase login failed. Please check your credentials.'
      );
      console.error('Login process error:', err);
    } finally {
      hideLoading();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken');
      setStats(null);
      setBlogs([]);
      setProjects([]);
      setContacts([]);
      setAchievements([]);
      setSections([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    showLoading();
    setError('');
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
        }),
      ]);

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
        setBlogs(blogsData.data);
      }

      if (projectsData.success) {
        const transformedProjects: Project[] = projectsData.data.map(
          (project: any) => ({
            ...project,
            isPublished: project.is_published,
            createdAt: project.created_at,
            updatedAt: project.updated_at,
          })
        );
        setProjects(transformedProjects);
      }

      if (contactsData.success) {
        const transformedContacts: Contact[] = contactsData.data.map(
          (contact: any) => ({
            ...contact,
            createdAt: contact.created_at,
            updatedAt: contact.updated_at,
          })
        );
        setContacts(transformedContacts);
      }

      if (achievementsData.success) {
        const transformedAchievements: Achievement[] =
          achievementsData.data.map((achievement: any) => ({
            ...achievement,
            isPublished: achievement.is_published,
            createdAt: achievement.created_at,
            updatedAt: achievement.updated_at,
          }));
        setAchievements(transformedAchievements);
      }

      if (sectionsData.success) {
        const transformedSections: Section[] = sectionsData.data.map(
          (section: any) => ({
            ...section,
            isPublished: section.is_published,
            createdAt: section.created_at,
            updatedAt: section.updated_at,
          })
        );
        setSections(transformedSections);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(
        'Failed to fetch dashboard data. Your session might be expired.'
      );
      handleLogout();
    } finally {
      hideLoading();
    }
  };

  const handleSaveBlog = async (formData: FormData) => {
    if (!token) return;

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
          errorData.message ||
            `Failed to ${isEditing ? 'update' : 'create'} blog`
        );
      }
    } catch {
      setError(`Failed to ${isEditing ? 'update' : 'create'} blog`);
    }
  };

  const handleSaveProject = async (formData: FormData) => {
    if (!token) return;

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
    } catch {
      setError(`Failed to ${isEditing ? 'update' : 'create'} project`);
    }
  };

  const handleSaveAchievement = async (achievement: Partial<Achievement>) => {
    if (!token) return;

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
    } catch {
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

    const { id, createdAt, updatedAt, isPublished, ...rest } = section;
    const payload = {
      ...rest,
      is_published: isPublished,
    };

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
        setSuccess(
          `Section ${isEditing ? 'updated' : 'created'} successfully!`
        );
        fetchDashboardData();
        setIsSectionEditorOpen(false);
        setEditingSection(null);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message ||
            `Failed to ${isEditing ? 'update' : 'create'} section`
        );
      }
    } catch {
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
    } catch {
      setError('Failed to send reply');
    }
  };

  const toggleBlogPublish = async (blogId: string, currentStatus: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/blogs/${blogId}`,
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
        setBlogs((prev) =>
          prev.map((blog) =>
            blog.id === blogId ? { ...blog, is_published: !currentStatus } : blog
          )
        );
        setSuccess('Blog status updated successfully!');
      }
    } catch {
      setError('Failed to update blog status');
    }
  };

  const toggleProjectPublish = async (
    projectId: string,
    currentStatus: boolean
  ) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
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
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? { ...project, isPublished: !currentStatus }
              : project
          )
        );
        setSuccess('Project status updated successfully!');
      }
    } catch {
      setError('Failed to update project status');
    }
  };

  const toggleAchievementPublish = async (
    achievementId: string,
    currentStatus: boolean
  ) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/achievements/${achievementId}`,
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
        setAchievements((prev) =>
          prev.map((achievement) =>
            achievement.id === achievementId
              ? { ...achievement, isPublished: !currentStatus }
              : achievement
          )
        );
        setSuccess('Achievement status updated successfully!');
      }
    } catch {
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
        setSections((prev) =>
          prev.map((section) =>
            section.id === sectionId
              ? { ...section, isPublished: !currentStatus }
              : section
          )
        );
        setSuccess('Section status updated successfully!');
      } else {
        setError('Failed to update section status');
      }
    } catch {
      setError('Failed to update section status');
    }
  };

  const markContactAsRead = async (
    contactId: string,
    currentStatus: boolean
  ) => {
    if (!token) return;

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
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === contactId
              ? { ...contact, is_read: !currentStatus }
              : contact
          )
        );
        setSuccess('Contact status updated successfully!');
      }
    } catch {
      setError('Failed to update contact status');
    }
  };

  const handleDelete = async (resource: string, id: string) => {
    if (!token) return;

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
    } catch {
      setError(`Failed to delete ${resource}`);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/sections/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Section deleted successfully!');
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete section');
      }
    } catch {
      setError('Failed to delete section');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
        <Navigation
          onHireMeClick={() => setIsHireMePopupOpen(true)}
          isAdminPage={true}
        />

        <motion.div
          className="pt-32 pb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-6 max-w-md">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-accent via-amber-400 to-accent/70 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className="text-muted-foreground">
                Access the admin panel to manage your portfolio content.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-border/70 bg-card/95 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your admin credentials to continue.
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
                        name="email"
                        type="email"
                        autoComplete="email"
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
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || authLoading}
                    >
                      {isLoading || authLoading ? 'Logging in...' : 'Login'}
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <Navigation
        onHireMeClick={() => setIsHireMePopupOpen(true)}
        isAdminPage={true}
      />

      <motion.div
        className="pt-32 pb-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent via-amber-400 to-accent/70 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your portfolio content and monitor activity.
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </motion.div>

          {/* Alerts */}
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

          {/* Stats */}
          {stats && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-border/70 bg-card/95 backdrop-blur-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/95 backdrop-blur-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Published Blogs
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.publishedBlogs}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/95 backdrop-blur-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Published Projects
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Layers3 className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.publishedProjects}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/95 backdrop-blur-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Published Achievements
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.publishedAchievements}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/95 backdrop-blur-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Unread Messages
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Inbox className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.unreadContacts}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="blogs" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="blogs">Blogs</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            {/* Blogs */}
            <TabsContent value="blogs" className="space-y-4 mt-4">
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
                  <Card key={blog.id} className="border-border/70 bg-card/95">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {blog.title}
                          </CardTitle>
                          <CardDescription>{blog.excerpt}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Badge
                            variant={blog.is_published ? 'default' : 'secondary'}
                          >
                            {blog.is_published ? 'Published' : 'Draft'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleBlogPublish(blog.id, blog.is_published)
                            }
                          >
                            {blog.is_published ? 'Unpublish' : 'Publish'}
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
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Projects */}
            <TabsContent value="projects" className="space-y-4 mt-4">
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
                  <Card
                    key={project.id}
                    className="border-border/70 bg-card/95"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {project.title}
                          </CardTitle>
                          <CardDescription>
                            {project.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
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
                            onClick={() => handleDelete('projects', project.id)}
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

            {/* Achievements */}
            <TabsContent value="achievements" className="space-y-4 mt-4">
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
                  <Card
                    key={achievement.id}
                    className="border-border/70 bg-card/95"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {achievement.title}
                          </CardTitle>
                          <CardDescription>
                            {achievement.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
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

            {/* Sections */}
            <TabsContent value="sections" className="space-y-4 mt-4">
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
                  <Card
                    key={section.id}
                    className="border-border/70 bg-card/95"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {section.name} ({section.page})
                          </CardTitle>
                          <CardDescription>{section.title}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
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
                          {section.createdAt &&
                            new Date(section.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Contacts */}
            <TabsContent value="contacts" className="space-y-4 mt-4">
              <h2 className="text-2xl font-semibold">Contact Messages</h2>
              <div className="grid gap-4">
                {contacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className="border-border/70 bg-card/95"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {contact.subject}
                          </CardTitle>
                          <CardDescription>
                            From: {contact.name} ({contact.email})
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
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
