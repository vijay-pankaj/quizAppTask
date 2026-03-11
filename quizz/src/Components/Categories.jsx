import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";
import usePagination from "../Hooks/usePagination";
import useDebounce from "../Hooks/useDebounce";
import { useNavigate } from "react-router-dom";

const CATEGORIES_URL = `${API_BASE_URL}/categories`;
const emptyForm = { name: "", description: "" };

export default function Categories() {
  const { t } = useTheme();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(search, 500);
  // const {
  //   data: categories,
  //   loading,
  //   currentPage,
  //   totalPages,
  //   totalItems,
  //   pageNumbers,
  //   hasPrev,
  //   hasNext,
  //   fetchData,
  //   goToPage,
  // } = usePagination(CATEGORIES_URL, { itemsPerPage: 6 });

  // ── Fetch on page or search change 
  // useEffect(() => {
  //   fetchData({ page: currentPage, search: debouncedSearch });
  // }, [currentPage, debouncedSearch]);

  // // ── Reset to page 1 on new search 
  // useEffect(() => {
  //   goToPage(1);
  // }, [debouncedSearch]);


  const dummyCategories = [
    {
      _id: "1",
      name: "SSC CGL",
      description: "Staff Selection Commission Combined Graduate Level",
      createdAt: "2024-01-10"
    },
    {
      _id: "2",
      name: "SSC CHSL",
      description: "Combined Higher Secondary Level",
      createdAt: "2024-02-15"
    },
    {
      _id: "3",
      name: "GATE",
      description: "Graduate Aptitude Test in Engineering",
      createdAt: "2024-03-05"
    },
    {
      _id: "4",
      name: "TECH",
      description: "Programming and technical questions",
      createdAt: "2024-03-20"
    },
    {
      _id: "5",
      name: "UPSC",
      description: "Union Public Service Commission exam",
      createdAt: "2024-04-10"
    },
    {
      _id: "6",
      name: "BANK",
      description: "Banking exam preparation",
      createdAt: "2024-04-18"
    },
    {
      _id: "7",
      name: "RAILWAY",
      description: "Railway recruitment exams",
      createdAt: "2024-05-01"
    },
    {
      _id: "8",
      name: "DEFENCE",
      description: "NDA, CDS and defence exams",
      createdAt: "2024-05-12"
    }
  ];
 
  const categories = dummyCategories;
const loading = false;

const currentPage = 1;
const totalPages = 1;
const totalItems = categories.length;
const pageNumbers = [1];
const hasPrev = false;
const hasNext = false;

const fetchData = () => {};
const goToPage = () => {};

  // ── Modal helpers 
  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit   = (cat) => { setForm({ name: cat.name, description: cat.description }); setEditId(cat._id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  // ── Create / Update 
  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editId) {
        await axios.put(`${CATEGORIES_URL}/${editId}`, form);
      } else {
        await axios.post(CATEGORIES_URL, form);
      }
      closeModal();
      fetchData({ page: currentPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete
  const confirmDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await axios.delete(`${CATEGORIES_URL}/${deleteTarget._id}`);
      setDeleteTarget(null);
      const targetPage = categories.length === 1 && currentPage > 1
        ? currentPage - 1
        : currentPage;
      goToPage(targetPage);
      fetchData({ page: targetPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 p-6`}>
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-black ${t.text}`}>Categories</h1>
            <p className={`text-sm ${t.textMuted} mt-1`}>
              {totalItems} {totalItems === 1 ? "category" : "categories"} total
            </p>
          </div>
          <button
            onClick={openCreate}
            className={`${t.accentBg} ${t.accentBgHover} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all`}
          >
            + New Category
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-bold">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative w-full sm:w-80">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-4 h-4 border-2 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className={`w-8 h-8 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
          </div>
        ) : categories.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-24 gap-3 ${t.textMuted}`}>
            <span className="text-5xl">🗂️</span>
            <p className="font-semibold text-lg">No categories found</p>
            <p className="text-sm">
              {search ? "Try a different search term" : `Click "+ New Category" to get started`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => navigate(`/categories/${cat._id}/sets`)}
                className={`${t.bgCard} border ${t.border} cursor-pointer rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all`}
              >
                {/* Card top */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl ${t.accentLight} ${t.accentText} flex items-center justify-center text-lg font-black shrink-0`}>
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(cat)}
                      className={`w-8 h-8 rounded-lg border ${t.border} ${t.bgCardHover} ${t.textSecondary} flex items-center justify-center text-sm transition-all`}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm transition-all"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Card content */}
                <div>
                  <h3 className={`font-bold text-base ${t.text} leading-tight`}>{cat.name}</h3>
                  <p className={`text-sm ${t.textMuted} mt-1 line-clamp-2 leading-relaxed`}>
                    {cat.description || "No description provided."}
                  </p>
                </div>

                {/* Card footer */}
                <div className={`flex items-center justify-between pt-2 border-t ${t.borderSubtle}`}>
                  <span className={`text-xs ${t.textMuted}`}>
                    {new Date(cat.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${t.badge}`}>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrev || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}
            >
              ← Prev
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className={`px-2 text-sm ${t.textMuted}`}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all
                    ${currentPage === p
                      ? `${t.accentBg} text-white border-transparent shadow-md`
                      : `${t.bgCard} ${t.border} ${t.textSecondary} ${t.bgCardHover}`
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNext || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}
            >
              Next →
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <p className={`text-center text-xs ${t.textMuted} mt-3`}>
            Page {currentPage} of {totalPages} · {totalItems} total
          </p>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
          <div className={`relative w-full max-w-md ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10`}>
            <h2 className={`text-xl font-black ${t.text} mb-1`}>
              {editId ? "Edit Category" : "New Category"}
            </h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              {editId ? "Update the category details below." : "Fill in the details to create a new category."}
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Science, History…"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this category…"
                  rows={3}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted} resize-none`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={closeModal}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.name.trim()}
                className={`flex-1 ${t.accentBg} ${t.accentBgHover} text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all`}
              >
                {submitting ? "Saving…" : editId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative w-full max-w-sm ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10 text-center`}>
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className={`text-xl font-black ${t.text} mb-2`}>Delete Category?</h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              Are you sure you want to delete{" "}
              <span className={`font-bold ${t.text}`}>"{deleteTarget.name}"</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={submitting}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all"
              >
                {submitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}