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
      <div className="card card-hover flex flex-col justify-between h-full group-hover:border-[#CBC3AE]">
        <div>
          {/* Header Tag and Status */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF7F0] text-[#17254A] border border-[#E5DFD0]">
              <CategoryIcon className="w-3.5 h-3.5 text-[#17254A]" />
              <span>{categoryLabel}</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <ApprovalStatusPill status={problem.approvalStatus} />
              <StatusPill status={problem.status} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-[#1C1B18] leading-snug mb-2 line-clamp-2 group-hover:text-[#2E7D4F] transition-colors">
            {problem.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-[#5E5C54] mb-4">
            <MapPin size={13} className="text-[#5E5C54] shrink-0" />
            <span className="truncate">{problem.location}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-between text-xs text-[#5E5C54]">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-[#1C1B18] font-semibold bg-[#FAF7F0] px-2 py-0.5 rounded-full border border-[#E5DFD0]">
              <ThumbsUp size={12} className="text-[#2E7D4F]" />
              <span>{problem.upvoteCount}</span>
            </span>

            {problem._count && problem._count.solutions > 0 && (
              <span className="flex items-center gap-1 text-[#17254A] bg-[#E4E9F5] px-2 py-0.5 rounded-full font-semibold border border-[#E5DFD0]">
                <Lightbulb size={12} />
                <span>{problem._count.solutions} sol</span>
              </span>
            )}
          </div>

          <span className="text-[#5E5C54]">{timeAgo(problem.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
