
import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/$/, "");

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "search" : "login"
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("general");
  const [currentPage, setCurrentPage] = useState(1);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const token = localStorage.getItem("token");

  const loadUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!response.ok) throw new Error("Unable to load user");
      setUser(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!response.ok) throw new Error("Unable to load history");
      setHistory(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (page === "search" && token) {
      loadUser();
      loadHistory();
    }
  }, [page]);

  const performSearch = async (
    searchQuery,
    selectedCategory,
    pageNumber
  ) => {
    if (!searchQuery.trim() || loading) return;

    setQuery(searchQuery);
    setCategory(selectedCategory);
    setCurrentPage(pageNumber);
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: selectedCategory,
        page: String(pageNumber)
      });

      const response = await fetch(
        `${API_URL}/search?${params.toString()}`,
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(data.results || []);
      await loadHistory();
    } catch (error) {
      console.error(error);
      setError("Unable to load search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const newSearch = () => {
    performSearch(query, category, 1);
  };

  const nextPage = () => {
    performSearch(query, category, currentPage + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) {
      performSearch(query, category, currentPage - 1);
    }
  };

  const changeCategory = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1);

    if (query.trim()) {
      performSearch(query, newCategory, 1);
    } else {
      setResults([]);
      setError("");
    }
  };

  const clearHistory = async () => {
    if (clearingHistory) return;

    setClearingHistory(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/history`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!response.ok) throw new Error("Unable to clear history");
      setHistory([]);
    } catch (error) {
      console.error(error);
      setError("Unable to clear search history.");
    } finally {
      setClearingHistory(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    if (deletingId !== null) return;

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!response.ok) {
        throw new Error("Unable to delete search history item");
      }

      setHistory((previousHistory) =>
        previousHistory.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);
      setError("Unable to delete this search history item.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") newSearch();
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setPage("login");
    setResults([]);
    setHistory([]);
    setUser(null);
    setQuery("");
    setCurrentPage(1);
    setError("");
  };

  if (page === "login") {
    return (
      <Login
        onLogin={() => setPage("search")}
        onRegister={() => setPage("register")}
      />
    );
  }

  if (page === "register") {
    return <Register onRegister={() => setPage("login")} />;
  }

  const categories = [
    { label: "All", value: "general" },
    { label: "News", value: "news" },
    { label: "Images", value: "images" },
    { label: "Videos", value: "videos" },
    { label: "Maps", value: "map" },
    { label: "IT", value: "it" }
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-dot"></span>
          Private Search
        </div>

        <div className="header-right">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          )}

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        <div className="search-hero">
          <p className="hero-small">THE WEB, WITHOUT THE PROFILE</p>
          <h1>Search privately.</h1>
          <p className="hero-description">
            Explore the web without building a profile around you.
          </p>
        </div>

        <div className="search-filters">
          {categories.map((filter) => (
            <button
              key={filter.value}
              className={
                category === filter.value ? "filter active" : "filter"
              }
              onClick={() => changeCategory(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="search-box">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search the web..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          {query && (
            <button
              className="clear-button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setError("");
                setCurrentPage(1);
              }}
            >
              ×
            </button>
          )}

          <button
            className="search-button"
            onClick={newSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {history.length > 0 && (
          <div className="history">
            <div className="section-heading">
              <h2>Recent searches</h2>

              <div className="history-heading-right">
                <span>{history.length}</span>
                <button
                  className="clear-history-button"
                  onClick={clearHistory}
                  disabled={clearingHistory}
                >
                  {clearingHistory ? "Clearing..." : "Clear history"}
                </button>
              </div>
            </div>

            <div className="history-list">
              {history
                .slice()
                .reverse()
                .slice(0, 8)
                .map((item) => (
                  <div className="history-item" key={item.id}>
                    <button
                      className="history-search-button"
                      onClick={() => performSearch(item.query, category, 1)}
                      disabled={loading}
                    >
                      <span className="history-search-icon">⌕</span>
                      <span className="history-query">{item.query}</span>

                      {item.searchedAt && (
                        <span className="history-time">
                          {formatDate(item.searchedAt)}
                        </span>
                      )}
                    </button>

                    <button
                      className="delete-history-button"
                      onClick={() => deleteHistoryItem(item.id)}
                      disabled={deletingId !== null}
                      aria-label={`Delete search ${item.query}`}
                      title="Delete this search"
                    >
                      {deletingId === item.id ? "..." : "×"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="search-status">
            <div className="loader"></div>
            <span>Searching the web...</span>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && results.length > 0 && (
          <div className="results">
            <div className="section-heading">
              <h2>Search results</h2>
              <span>{results.length}</span>
            </div>

            {results.map((result, index) => (
              <article className="result" key={result.url || index}>
                <div className="result-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="result-content">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="result-title"
                  >
                    {result.title || "Untitled result"}
                  </a>

                  <div className="result-url">{result.url}</div>

                  <p>
                    {result.content || "No description available."}
                  </p>

                  {result.engine && (
                    <div className="result-engine">
                      Source: {result.engine}
                    </div>
                  )}
                </div>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="result-arrow"
                  aria-label="Open result"
                >
                  ↗
                </a>
              </article>
            ))}

            <div className="pagination">
              <button
                className="pagination-button"
                onClick={previousPage}
                disabled={currentPage === 1 || loading}
              >
                ← Previous
              </button>

              <span className="page-number">Page {currentPage}</span>

              <button
                className="pagination-button"
                onClick={nextPage}
                disabled={loading || results.length === 0}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="no-results">
            <h2>No results found</h2>
            <p>Try searching with a different keyword.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>PRIVATE SEARCH ENGINE</span>
        <span>Powered by SearXNG</span>
      </footer>
    </div>
  );
}

export default App;