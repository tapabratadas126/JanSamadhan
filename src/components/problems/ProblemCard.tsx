import {
  ThumbsUp,
  MapPin,
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  FolderOpen,
  Handshake,
  Award,
  Search,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/components/problems/CategoryPicker";

export const CATEGORY_DATA: Record<
  string,
  { label: string; emoji: string; color: string; bgColor: string; borderColor: string }
> = {
  EDUCATION: { label: "Education & Literacy", emoji: "🎓", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  HEALTHCARE: { label: "Healthcare & Sanitation", emoji: "🏥", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  AGRICULTURE: { label: "Agriculture & Rural", emoji: "🌾", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  WATER_SANITATION: { label: "Water & Sanitation", emoji: "💧", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  ENERGY_ENVIRONMENT: { label: "Energy & Power", emoji: "⚡", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  ENVIRONMENT: { label: "Environment & Climate", emoji: "🌱", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  EMPLOYMENT: { label: "Employment & Livelihood", emoji: "💼", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  ACCESSIBILITY: { label: "Accessibility & Inclusion", emoji: "♿", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  INFRASTRUCTURE: { label: "Infrastructure & Roads", emoji: "🏗️", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
  GOVERNANCE: { label: "Governance & Civic", emoji: "🏛️", color: "#17254A", bgColor: "#FAF7F0", borderColor: "#E5DFD0" },
};

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

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string; icon: LucideIcon }> = {
    OPEN: { className: "status-open", label: "Open", icon: FolderOpen },
    SOLUTION_PROPOSED: { className: "status-solution", label: "Solution Proposed", icon: Lightbulb },
    PARTNERSHIP_APPROVED: { className: "status-partnership", label: "Partnership Approved", icon: Handshake },
    RESOLVED: { className: "status-resolved", label: "Resolved", icon: CheckCircle2 },
    PROPOSED: { className: "status-proposed", label: "Proposed", icon: Clock },
    APPROVED: { className: "status-approved", label: "Approved", icon: CheckCircle2 },
    REJECTED: { className: "status-rejected", label: "Rejected", icon: XCircle },
    COMPLETED: { className: "status-completed", label: "Completed", icon: Award },
  };

  const s = map[status] || map.OPEN;
  const IconComponent = s.icon;

  return (
    <span className={`badge ${s.className}`}>
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{s.label}</span>
    </span>
  );
}

export function ApprovalStatusPill({ status }: { status?: string }) {
  if (!status || status === "APPROVED") return null;

  const map: Record<string, { className: string; label: string; icon: LucideIcon }> = {
    PENDING: { className: "status-pending", label: "Pending Approval", icon: Clock },
    UNDER_REVIEW: { className: "status-open", label: "Under Review", icon: Search },
    REJECTED: { className: "status-rejected", label: "Rejected", icon: XCircle },
  };

  const s = map[status] || map.PENDING;
  const IconComponent = s.icon;

  return (
    <span className={`badge ${s.className}`}>
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{s.label}</span>
    </span>
  );
}

interface ProblemCardProps {
  problem: Problem & { approvalStatus?: string };
  href: string;
}

export default function ProblemCard({ problem, href }: ProblemCardProps) {
  const timeAgo = (dateStr: string | Date) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const foundCat = CATEGORIES.find((c) => c.value === problem.category);
  const CategoryIcon = foundCat ? foundCat.icon : FolderOpen;
  const categoryLabel = foundCat ? foundCat.label : problem.category;

  return (
    <Link href={href} className="no-underline block group h-full">
      <div className="bg-[#FFFFFF] border-2 border-[#171e19] shadow-[5px_5px_0_0_#171e19] rounded-xl p-5 flex flex-col justify-between h-full transition-all duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[7px_7px_0_0_#171e19]">
        <div>
          {/* Header Tag and Status */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#faf9f6] text-[#171e19] border-2 border-[#171e19]">
              <CategoryIcon className="w-3.5 h-3.5 text-[#171e19]" />
              <span>{categoryLabel}</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <ApprovalStatusPill status={problem.approvalStatus} />
              <StatusPill status={problem.status} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-[#171e19] leading-snug mb-2 line-clamp-2 group-hover:text-[#a07800] transition-colors">
            {problem.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-[#525e59] mb-4 font-medium">
            <MapPin size={13} className="text-[#171e19] shrink-0" />
            <span className="truncate">{problem.location}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t-2 border-[#171e19] flex items-center justify-between text-xs text-[#525e59] font-mono">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#171e19] font-bold bg-[#ffe17c] px-2 py-0.5 rounded border-2 border-[#171e19] shadow-[1px_1px_0_0_#171e19]">
              <ThumbsUp size={12} className="text-[#171e19]" />
              <span>{problem.upvoteCount}</span>
            </span>

            {problem._count && problem._count.solutions > 0 && (
              <span className="flex items-center gap-1 text-[#171e19] bg-[#b7c6c2] px-2 py-0.5 rounded font-bold border-2 border-[#171e19] shadow-[1px_1px_0_0_#171e19]">
                <Lightbulb size={12} />
                <span>{problem._count.solutions} sol</span>
              </span>
            )}
          </div>

          <span className="text-[#525e59] text-[11px] font-bold uppercase tracking-wider">{timeAgo(problem.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
