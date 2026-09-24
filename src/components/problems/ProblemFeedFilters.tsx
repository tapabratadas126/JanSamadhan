"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, ArrowUpDown, Layers, X, Filter } from "lucide-react";
import { CATEGORIES } from "@/components/problems/CategoryPicker";
import { useState, useTransition } from "react";

interface ProblemFeedFiltersProps {
  availableLocations: string[];
  currentCategory?: string;
  currentSearch?: string;
  currentLocation?: string;
  currentSort?: string;
  currentGroup?: string;
}

export default function ProblemFeedFilters({
  availableLocations,
  currentCategory = "",
  currentSearch = "",
  currentLocation = "",
  currentSort = "newest",
  currentGroup = "none",
}: ProblemFeedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [location, setLocation] = useState(currentLocation);
  const [sort, setSort] = useState(currentSort);
  const [group, setGroup] = useState(currentGroup);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/problems?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: search.trim() || null });
  };

  const clearLocation = () => {
    setLocation("");
    updateFilters({ location: null });
  };

  const clearAllFilters = () => {
    setSearch("");
    setLocation("");
    setSort("newest");
    setGroup("none");
    startTransition(() => {
      router.push("/problems");
    });
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentLocation || currentSearch || currentSort !== "newest" || currentGroup !== "none"
  );

  return (
    <div className="card bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
      {/* Top Bar: Search & Location & Sort & Group */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
        {/* Keyword Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by keyword or location..."
            className="input pl-10 pr-4 text-sm w-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateFilters({ search: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Location Dropdown Filter */}
        <div className="relative w-full md:w-56 shrink-0">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 w-4.5 h-4.5 pointer-events-none" />
          <select
            value={location}
            onChange={(e) => {
              const val = e.target.value;
              setLocation(val);
              updateFilters({ location: val || null });
            }}
            className="input pl-10 pr-8 text-sm font-medium bg-white appearance-none cursor-pointer border-gray-200 focus:border-indigo-500 w-full"
          >
            <option value="">All Locations / Areas</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                📍 {loc}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
            ▼
          </div>
        </div>

        {/* Sort Control Dropdown */}
        <div className="relative w-full md:w-48 shrink-0">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 w-4 h-4 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => {
              const val = e.target.value;
              setSort(val);
              updateFilters({ sort: val, sort_by: val });
            }}
            className="input pl-10 pr-8 text-sm font-medium bg-white appearance-none cursor-pointer border-gray-200 focus:border-teal-500 w-full"
          >
            <option value="newest">Newest (Recency)</option>
            <option value="most_upvoted">Most Upvoted (Priority)</option>
            <option value="location">Location (A-Z)</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
            ▼
          </div>
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary text-sm py-2.5 px-5 w-full md:w-auto shrink-0 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Filter size={16} />
          )}
          <span>Filter</span>
        </button>
      </form>

      {/* Middle Bar: Category Pills & Grouping Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          <button
            onClick={() => updateFilters({ category: null })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              !currentCategory
                ? "bg-gradient-to-r from-[#14B8A6] to-[#6366F1] text-white border-transparent shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                updateFilters({
                  category: currentCategory === cat.value ? null : cat.value,
                })
              }
              style={{
                backgroundColor: currentCategory === cat.value ? cat.color : undefined,
                color: currentCategory === cat.value ? "#FFFFFF" : undefined,
                borderColor: currentCategory === cat.value ? cat.color : undefined,
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border ${
                currentCategory === cat.value
                  ? "shadow-sm border-transparent"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Group By Location Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextGroup = group === "location" ? "none" : "location";
              setGroup(nextGroup);
              updateFilters({ group: nextGroup === "none" ? null : "location" });
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              group === "location"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
            title="Group feed by district/location"
          >
            <Layers size={14} className={group === "location" ? "text-indigo-600" : "text-gray-400"} />
            <span>Group by Area</span>
            {group === "location" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-red-600 font-medium transition-colors px-2 py-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {(currentLocation || currentCategory || currentSearch || currentSort === "location") && (
        <div className="flex items-center gap-2 flex-wrap pt-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-400">Active filters:</span>

          {currentLocation && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
              <MapPin size={12} />
              <span>Location: {currentLocation}</span>
              <button onClick={clearLocation} className="hover:text-indigo-900 ml-0.5">
                <X size={12} />
              </button>
            </span>
          )}

          {currentCategory && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 font-semibold px-2.5 py-1 rounded-full border border-teal-100">
              <span>Category: {currentCategory}</span>
              <button onClick={() => updateFilters({ category: null })} className="hover:text-teal-900 ml-0.5">
                <X size={12} />
              </button>
            </span>
          )}

          {currentSearch && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-100">
              <span>Search: "{currentSearch}"</span>
              <button onClick={() => { setSearch(""); updateFilters({ search: null }); }} className="hover:text-amber-900 ml-0.5">
                <X size={12} />
              </button>
            </span>
          )}

          {currentSort === "location" && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full border border-purple-100">
              <span>Sorted by Location (A-Z)</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
