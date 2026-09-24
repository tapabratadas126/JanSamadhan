"use client";

import { useState } from "react";
import { MapPin, ChevronDown, ChevronRight, Layers } from "lucide-react";
import ProblemCard from "@/components/problems/ProblemCard";

interface Problem {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  upvoteCount: number;
  createdAt: string | Date;
  postedBy: { name: string };
  _count?: { solutions: number };
}

interface LocationGroupedFeedProps {
  problems: Problem[];
}

export default function LocationGroupedFeed({ problems }: LocationGroupedFeedProps) {
  // Helper to extract district/area name (e.g., "Doranda, Ranchi" -> "Ranchi")
  const getDistrictName = (locStr: string) => {
    if (!locStr) return "Unspecified Location";
    const parts = locStr.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : locStr.trim();
  };

  // Group problems by district
  const groupedProblems: Record<string, Problem[]> = {};
  problems.forEach((problem) => {
    const district = getDistrictName(problem.location);
    if (!groupedProblems[district]) {
      groupedProblems[district] = [];
    }
    groupedProblems[district].push(problem);
  });

  // Sort district names alphabetically (A-Z)
  const sortedDistricts = Object.keys(groupedProblems).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  // Keep track of collapsed sections (default: all expanded)
  const [collapsedDistricts, setCollapsedDistricts] = useState<Record<string, boolean>>({});

  const toggleDistrict = (district: string) => {
    setCollapsedDistricts((prev) => ({
      ...prev,
      [district]: !prev[district],
    }));
  };

  if (sortedDistricts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 animate-feed-enter">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="text-indigo-600 w-5 h-5" />
          <h2 className="text-lg font-extrabold text-[#1F2933]">
            Problems Grouped by Location / Area ({sortedDistricts.length} {sortedDistricts.length === 1 ? "Area" : "Areas"})
          </h2>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {problems.length} total problems
        </span>
      </div>

      {sortedDistricts.map((district) => {
        const districtProblems = groupedProblems[district];
        const isCollapsed = collapsedDistricts[district];

        return (
          <div
            key={district}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-all"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleDistrict(district)}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/40 hover:bg-gray-100/60 transition-colors text-left border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1F2933] flex items-center gap-2">
                    <span>{district}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {districtProblems.length} {districtProblems.length === 1 ? "problem" : "problems"} reported in this district
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                  {districtProblems.length}
                </span>
                <div className="text-gray-400 p-1 rounded-md hover:bg-gray-200/50">
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </button>

            {/* Section Content Grid */}
            {!isCollapsed && (
              <div className="p-4 sm:p-6 bg-[#FAFAF9]/40">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {districtProblems.map((problem) => (
                    <ProblemCard key={problem.id} problem={problem} href={`/problems/${problem.id}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
