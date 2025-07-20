import { useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import MDEditor from '@uiw/react-md-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';

function getSystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Placeholder components for each page
function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = 'http://localhost:8080/books';
    const params: string[] = [];
    if (search) {
      params.push(`title=${encodeURIComponent(search)}`);
    }
    if (filter !== 'All') {
      params.push(`tags=${encodeURIComponent(filter.toLowerCase())}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch books');
        return res.json();
      })
      .then(data => setBooks(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, filter]);

  const tagOptions = ['All', ...Array.from(new Set(books.flatMap(b => b.tags || []))).map((tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1))];

  return (
    <div className="w-full px-0 py-0 lg:pl-0">
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-200">Books</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none"
        />
        <div className="flex gap-2 flex-wrap">
          {tagOptions.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-3 py-1 rounded text-sm ${filter === tag ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-300">Loading books...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="mb-4 text-blue-300 dark:text-blue-900"><path fill="currentColor" d="M4 19V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm2 0h10V5H6v14Zm2-2h6v-2H8v2Z"/></svg>
          <div className="text-lg text-gray-500 dark:text-gray-300 mb-2">No books found.</div>
          <Link to="/books/new" className="mt-2 px-6 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-400">Add your first book</Link>
        </div>
      ) : (
        <div
          className="grid gap-6 w-full"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {books.map(book => (
            <Link
              to={`/books/${book._id}`}
              key={book._id}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-100">{book.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-1">by {book.author}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(book.tags || []).map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8080/books/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch book');
        return res.json();
      })
      .then(data => setBook(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`http://localhost:8080/books/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete book');
      navigate('/');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-300">Loading book...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!book) return <div className="text-center text-gray-500 dark:text-gray-300">Book not found.</div>;

  return (
    <div className="w-full px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-200 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">by {book.author}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {(book.tags || []).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/books/${book._id}/edit`)}
            className="px-4 py-2 rounded bg-yellow-400 text-yellow-900 font-semibold hover:bg-yellow-300"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-200">Chapters</h2>
        <button
          onClick={() => navigate(`/books/${book._id}/chapters/new`)}
          className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-400"
        >
          Add Chapter
        </button>
      </div>
      {(!book.chapters || book.chapters.length === 0) ? (
        <div className="text-gray-500 dark:text-gray-300">No chapters yet.</div>
      ) : (
        <div className="space-y-4">
          {book.chapters.map((chapter: any) => (
            <div key={chapter._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-100">Chapter {chapter.chapterNumber}: {chapter.chapterTitle}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{chapter.date ? new Date(chapter.date).toLocaleDateString() : ''}</p>
                </div>
                <button
                  onClick={() => navigate(`/books/${book._id}/chapters/${chapter._id}/edit`)}
                  className="px-3 py-1 rounded bg-yellow-400 text-yellow-900 font-semibold hover:bg-yellow-300 text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="mt-2 text-gray-700 dark:text-gray-200">
                <div className="prose max-w-none dark:prose-invert text-left">
                  <MarkdownPreview source={chapter.content} className="p-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`http://localhost:8080/books/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch book');
          return res.json();
        })
        .then(data => {
          setTitle(data.title || '');
          setAuthor(data.author || '');
          setTags((data.tags || []).join(', '));
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const bookData = {
      title,
      author,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      const res = await fetch(isEdit ? `http://localhost:8080/books/${id}` : 'http://localhost:8080/books', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      if (!res.ok) throw new Error('Failed to save book');
      const data = await res.json();
      navigate(isEdit ? `/books/${id}` : `/books/${data._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200">{isEdit ? 'Edit Book' : 'Add Book'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Author</label>
          <input
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            required
            className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none"
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-400 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
        </button>
      </form>
    </div>
  );
}

function ChapterEdit() {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(chapterId);
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id && chapterId) {
      setLoading(true);
      fetch(`http://localhost:8080/books/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch book');
          return res.json();
        })
        .then(data => {
          const chapter = (data.chapters || []).find((c: any) => c._id === chapterId);
          if (chapter) {
            setChapterNumber(chapter.chapterNumber);
            setChapterTitle(chapter.chapterTitle);
            setDate(chapter.date ? new Date(chapter.date).toISOString().slice(0, 10) : '');
            setContent(chapter.content || '');
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, chapterId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const chapterData = {
      chapterNumber: Number(chapterNumber),
      chapterTitle,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      content,
    };
    try {
      const res = await fetch(
        isEdit
          ? `http://localhost:8080/books/${id}/chapters/${chapterId}`
          : `http://localhost:8080/books/${id}/chapters`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chapterData),
        }
      );
      if (!res.ok) throw new Error('Failed to save chapter');
      navigate(`/books/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200">{isEdit ? 'Edit Chapter' : 'Add Chapter'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Chapter Number</label>
          <input
            type="number"
            value={chapterNumber}
            onChange={e => setChapterNumber(e.target.value)}
            required
            className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Chapter Title</label>
          <input
            type="text"
            value={chapterTitle}
            onChange={e => setChapterTitle(e.target.value)}
            required
            className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Content (Markdown)</label>
          <MDEditor
            value={content}
            onChange={v => setContent(v || '')}
            height={200}
            previewOptions={{ className: 'dark:bg-gray-900 dark:text-gray-100' }}
          />
          <div className="mt-2">
            <label className="block mb-1 font-semibold">Live Preview</label>
            <div className="border rounded p-2 bg-gray-50 dark:bg-gray-900">
              <MarkdownPreview source={content} />
            </div>
          </div>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-400 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Chapter' : 'Add Chapter'}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || getSystemTheme();
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-full w-full bg-blue-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/90 dark:bg-gray-800/90 border-r border-gray-200 dark:border-gray-700 min-h-full py-8 px-6 space-y-8 sticky top-0 backdrop-blur">
        <Link to="/" className="text-3xl font-bold text-blue-700 dark:text-blue-200 mb-8">📚 BookLog</Link>
        <nav className="flex flex-col gap-4">
          <Link to="/" className="text-lg text-blue-700 dark:text-blue-200 hover:underline font-medium">Home</Link>
          <Link to="/books/new" className="text-lg text-blue-700 dark:text-blue-200 hover:underline font-medium">Add Book</Link>
        </nav>
        <div className="mt-auto">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow w-full"
            title="Toggle theme"
          >
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </aside>
      {/* Topbar for mobile */}
      <header className="w-full bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 flex lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between w-full">
          <Link to="/" className="text-2xl font-bold text-blue-700 dark:text-blue-200 tracking-tight">📚 BookLog</Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-blue-700 dark:text-blue-200 hover:underline font-medium">Home</Link>
            <Link to="/books/new" className="text-blue-700 dark:text-blue-200 hover:underline font-medium">Add Book</Link>
            <button
              onClick={toggleTheme}
              className="ml-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow"
              title="Toggle theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col grow w-full min-h-full px-0 py-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books/new" element={<BookEdit />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<BookEdit />} />
          <Route path="/books/:id/chapters/new" element={<ChapterEdit />} />
          <Route path="/books/:id/chapters/:chapterId/edit" element={<ChapterEdit />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
