import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import AdminPortal from './components/AdminPortal';
import { BookOpen, Shield, ShieldCheck, ArrowRight, ArrowLeft, Loader } from 'lucide-react';
import { getTerms, getPrivacy, getBlogs } from './services/contentService';

const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n\n').map((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-2 font-display">{trimmed.replace('## ', '')}</h2>;
    }
    if (trimmed.startsWith('# ')) {
      return <h1 key={idx} className="text-2xl font-extrabold text-white mt-8 mb-4 font-display">{trimmed.replace('# ', '')}</h1>;
    }
    return <p key={idx} className="text-slate-300 text-sm leading-relaxed mb-4">{trimmed}</p>;
  });
};

function AppContent() {
  const { user, loading, login } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeBlog, setActiveBlog] = useState(null);
  
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [blogsList, setBlogsList] = useState([]);
  const [fetchingContent, setFetchingContent] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const fetchPublicContent = async () => {
      if (currentPath === '/legal/terms') {
        setFetchingContent(true);
        try {
          const t = await getTerms();
          setTerms(t);
        } catch (err) {
          console.error('Failed to load terms:', err);
        } finally {
          setFetchingContent(false);
        }
      } else if (currentPath === '/legal/privacy') {
        setFetchingContent(true);
        try {
          const p = await getPrivacy();
          setPrivacy(p);
        } catch (err) {
          console.error('Failed to load privacy:', err);
        } finally {
          setFetchingContent(false);
        }
      } else if (currentPath === '/blog' || currentPath === '/blogs') {
        setFetchingContent(true);
        try {
          const b = await getBlogs();
          setBlogsList(b);
        } catch (err) {
          console.error('Failed to load blogs:', err);
        } finally {
          setFetchingContent(false);
        }
      }
    };
    fetchPublicContent();
  }, [currentPath]);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleDemoLogin = async (email, password) => {
    try {
      await login(email, password);
    } catch (err) {
      alert(err);
    }
  };

  // Render Public Page Viewports
  if (currentPath === '/legal/terms') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12 text-left">
        <div className="max-w-3xl mx-auto space-y-6">
          <button 
            onClick={() => navigateTo('/')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-primary-500 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portal</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-extrabold font-display text-white">Terms and Conditions</h1>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Last updated: June 2026</p>

          <hr className="border-slate-800" />

          {fetchingContent ? (
            <div className="flex justify-center items-center py-12 text-slate-500 space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading latest terms...</span>
            </div>
          ) : (
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed animate-fade-in">
              {renderMarkdown(terms)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPath === '/legal/privacy') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12 text-left">
        <div className="max-w-3xl mx-auto space-y-6">
          <button 
            onClick={() => navigateTo('/')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-primary-500 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portal</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-extrabold font-display text-white">Privacy Policy</h1>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Last updated: June 2026</p>

          <hr className="border-slate-800" />

          {fetchingContent ? (
            <div className="flex justify-center items-center py-12 text-slate-500 space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading latest privacy policy...</span>
            </div>
          ) : (
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed animate-fade-in">
              {renderMarkdown(privacy)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPath === '/blog' || currentPath === '/blogs') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12 text-left">
        <div className="max-w-4xl mx-auto space-y-6">
          <button 
            onClick={() => navigateTo('/')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-primary-500 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portal</span>
          </button>

          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-extrabold font-display text-white">Service Insight Blog</h1>
          </div>

          <hr className="border-slate-800" />

          {fetchingContent ? (
            <div className="flex justify-center items-center py-12 text-slate-500 space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading latest blog insights...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {blogsList.length === 0 ? (
                <div className="col-span-3 text-center text-slate-500 py-12">No articles published yet. Check back later!</div>
              ) : (
                blogsList.map((blog) => (
                  <div 
                    key={blog._id} 
                    className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">{new Date(blog.date).toLocaleDateString()}</span>
                      <h3 className="text-sm font-bold text-white leading-tight mb-2">{blog.title}</h3>
                      <p className="text-xs text-slate-400 leading-normal line-clamp-3">{blog.excerpt}</p>
                    </div>
                    <button
                      onClick={() => setActiveBlog(blog)}
                      className="mt-4 inline-flex items-center text-xs font-bold text-primary-500 hover:text-primary-400 hover:underline cursor-pointer text-left"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Blog Detail Overlay */}
          {activeBlog && (
            <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-xl shadow-2xl relative text-left">
                <button
                  onClick={() => setActiveBlog(null)}
                  className="absolute right-4 top-4 text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Close
                </button>
                <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">{new Date(activeBlog.date).toLocaleDateString()} &bull; By {activeBlog.author}</span>
                <h2 className="text-lg font-bold text-white mb-3">{activeBlog.title}</h2>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto pr-2">
                  {activeBlog.content}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // App core view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-sm font-bold font-display tracking-widest uppercase text-slate-400">Connecting Fix-Connect Management...</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative select-none">
      {!user ? (
        <div className="w-full flex flex-col items-center justify-center min-h-screen py-12">
          <AuthScreen onDemoLogin={handleDemoLogin} />
          
          {/* Public links on Login Screen footer */}
          <div className="flex space-x-4 mt-8 text-xs font-semibold text-slate-500">
            <button onClick={() => navigateTo('/legal/terms')} className="hover:text-primary-500 cursor-pointer">Terms & Conditions</button>
            <span>&bull;</span>
            <button onClick={() => navigateTo('/legal/privacy')} className="hover:text-primary-500 cursor-pointer">Privacy Policy</button>
            <span>&bull;</span>
            <button onClick={() => navigateTo('/blog')} className="hover:text-primary-500 cursor-pointer">Blogs Insights</button>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen">
          <AdminPortal />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
