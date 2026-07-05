"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN" | "SPAM";

type ReviewItem = {
  id: string;
  storeId: string;
  productId: string;
  userId?: string | null;
  customerId?: string | null;

  rating: number;
  title?: string | null;
  comment: string;
  status: ReviewStatus;

  isVerifiedPurchase: boolean;
  orderId?: string | null;

  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;

  merchantReply?: string | null;
  merchantReplyAt?: string | null;

  product: {
    id: string;
    name: string;
    imageUrl?: string | null;
    ratingAverage: number;
    ratingCount: number;
  };

  createdAt: string;
  updatedAt: string;
};

type StoreInfo = {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
};

type ReviewStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  spam: number;
  averageRating: number;
  approvedAverageRating: number;
};

type IconName =
  | "reviews"
  | "star"
  | "refresh"
  | "external"
  | "search"
  | "chevron"
  | "store"
  | "product"
  | "customer"
  | "phone"
  | "mail"
  | "calendar"
  | "status"
  | "check"
  | "warning"
  | "close"
  | "trash"
  | "reply"
  | "verified"
  | "rating"
  | "eye"
  | "empty"
  | "info"
  | "order";

const defaultStats: ReviewStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  hidden: 0,
  spam: 0,
  averageRating: 0,
  approvedAverageRating: 0,
};

const statusOptions: { value: ReviewStatus | ""; label: string }[] = [
  { value: "", label: "كل الحالات" },
  { value: "PENDING", label: "بانتظار المراجعة" },
  { value: "APPROVED", label: "معتمد" },
  { value: "REJECTED", label: "مرفوض" },
  { value: "HIDDEN", label: "مخفي" },
  { value: "SPAM", label: "Spam" },
];

const ratingOptions = [
  { value: "", label: "كل التقييمات" },
  { value: "5", label: "5 نجوم" },
  { value: "4", label: "4 نجوم" },
  { value: "3", label: "3 نجوم" },
  { value: "2", label: "2 نجوم" },
  { value: "1", label: "1 نجمة" },
];

const reviewsPageStyles = `
.reviews-page {
  color: var(--text-main);
}

.reviews-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 34px rgba(24, 33, 63, 0.055);
}

.reviews-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 24px;
  background:
    radial-gradient(circle at 12% 10%, rgba(46, 217, 179, 0.16), transparent 30%),
    radial-gradient(circle at 92% 20%, rgba(245, 158, 11, 0.08), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 14px 44px rgba(24, 33, 63, 0.06);
}

.reviews-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border: 1px solid rgba(46, 217, 179, 0.22);
  border-radius: 999px;
  background: rgba(216, 255, 245, 0.74);
  color: var(--mint-hover);
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 700;
}

.reviews-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.11);
}

.reviews-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 42px;
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 180ms var(--ease-premium),
    border-color 180ms var(--ease-premium),
    background 180ms var(--ease-premium),
    color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium);
}

.reviews-action:hover {
  transform: translateY(-1px);
}

.reviews-action.primary {
  border: 1px solid rgba(46, 217, 179, 0.48);
  background: var(--mint);
  color: var(--primary);
  box-shadow: 0 9px 20px rgba(46, 217, 179, 0.18);
}

.reviews-action.primary:hover {
  background: var(--mint-hover);
  color: #ffffff;
}

.reviews-action.secondary {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  color: var(--text-main);
}

.reviews-action.secondary:hover {
  border-color: rgba(46, 217, 179, 0.42);
  color: var(--mint-hover);
  box-shadow: 0 10px 24px rgba(24, 33, 63, 0.055);
}

.reviews-action.danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
}

.reviews-action.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.reviews-action.success {
  border: 1px solid rgba(16, 185, 129, 0.20);
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
}

.reviews-action.success:hover {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
}

.reviews-action.warning {
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.reviews-action.warning:hover {
  background: rgba(245, 158, 11, 0.15);
  color: #92400e;
}

.reviews-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(216, 255, 245, 0.72);
  color: var(--mint-hover);
}

.reviews-icon.navy {
  background: rgba(24, 33, 63, 0.08);
  color: var(--primary);
}

.reviews-icon.gold {
  background: rgba(245, 158, 11, 0.10);
  color: #b45309;
}

.reviews-icon.red {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.reviews-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #2563eb;
}

.reviews-icon.purple {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
}

.reviews-stat-value {
  color: var(--text-main);
  font-family: var(--font-en);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}

.reviews-input,
.reviews-select,
.reviews-textarea {
  width: 100%;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  background: #ffffff;
  color: var(--foreground);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  transition:
    border-color 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium),
    background 180ms var(--ease-premium);
}

.reviews-input,
.reviews-select {
  min-height: 44px;
  padding: 10px 13px;
}

.reviews-textarea {
  min-height: 118px;
  resize: vertical;
  padding: 12px 13px;
  line-height: 1.8;
}

.reviews-input:focus,
.reviews-select:focus,
.reviews-textarea:focus {
  border-color: rgba(46, 217, 179, 0.52);
  box-shadow: 0 0 0 4px rgba(46, 217, 179, 0.10);
}

.reviews-search-wrap {
  position: relative;
}

.reviews-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(100, 116, 139, 0.72);
}

.reviews-search-input {
  padding-right: 44px;
  padding-left: 14px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 36%),
    #ffffff;
}

.reviews-search-input::placeholder {
  color: rgba(100, 116, 139, 0.7);
  font-size: 13px;
  font-weight: 600;
}

.reviews-modern-select-wrap {
  position: relative;
}

.reviews-modern-select-wrap::before {
  content: "";
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  width: 22px;
  height: 22px;
  border-radius: 9px;
  transform: translateY(-50%);
  background:
    radial-gradient(circle at 40% 35%, rgba(46, 217, 179, 0.9), rgba(46, 217, 179, 0.18));
  box-shadow: 0 0 0 5px rgba(46, 217, 179, 0.08);
}

.reviews-modern-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 48px;
  padding-left: 42px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--foreground);
  box-shadow: 0 8px 20px rgba(24, 33, 63, 0.035);
}

.reviews-modern-select:hover {
  border-color: rgba(46, 217, 179, 0.38);
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.12), transparent 34%),
    #ffffff;
}

.reviews-select-chevron {
  pointer-events: none;
  position: absolute;
  left: 14px;
  top: 50%;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 10px;
  transform: translateY(-50%);
  color: rgba(24, 33, 63, 0.72);
  background: rgba(24, 33, 63, 0.045);
}

.reviews-modern-select option {
  color: #18213f;
  background: #ffffff;
  font-weight: 700;
}

.reviews-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid transparent;
}

.reviews-status.pending {
  background: rgba(245, 158, 11, 0.11);
  border-color: rgba(245, 158, 11, 0.22);
  color: #b45309;
}

.reviews-status.approved {
  background: rgba(16, 185, 129, 0.10);
  border-color: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.reviews-status.rejected,
.reviews-status.spam {
  background: rgba(239, 68, 68, 0.10);
  border-color: rgba(239, 68, 68, 0.18);
  color: #dc2626;
}

.reviews-status.hidden {
  background: rgba(100, 116, 139, 0.10);
  border-color: rgba(100, 116, 139, 0.18);
  color: #475569;
}

.reviews-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.reviews-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: var(--muted-foreground);
}

.reviews-badge.verified {
  border-color: rgba(16, 185, 129, 0.18);
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
}

.reviews-thumb {
  width: 74px;
  height: 74px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 20px;
  background: #f8fafc;
}

.reviews-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviews-mini-card {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.reviews-comment-box {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 20px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 217, 179, 0.06), transparent 34%),
    rgba(248, 250, 252, 0.72);
  padding: 16px;
}

.reviews-reply-box {
  border: 1px solid rgba(46, 217, 179, 0.18);
  border-radius: 20px;
  background: rgba(216, 255, 245, 0.45);
  padding: 14px;
}

.reviews-row {
  transition:
    background 180ms var(--ease-premium),
    transform 180ms var(--ease-premium);
}

.reviews-row:hover {
  background: rgba(248, 250, 252, 0.78);
}

.reviews-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #eaf0f7;
}

.reviews-skeleton::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: -45%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent);
  animation: reviews-skeleton-shimmer 1.25s infinite;
}

@keyframes reviews-skeleton-shimmer {
  100% {
    inset-inline-start: 110%;
  }
}

@media (max-width: 768px) {
  .reviews-card,
  .reviews-hero {
    border-radius: 18px;
  }

  .reviews-action {
    width: 100%;
  }

  .reviews-stat-value {
    font-size: 24px;
  }
}
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value: number | string | null | undefined) {
  return toNumber(value, 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function formatRating(value: number | string | null | undefined) {
  return toNumber(value, 0).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatDate(value?: string | null) {
  if (!value) return "غير متوفر";

  return new Date(value).toLocaleString("ar-EG-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "بانتظار المراجعة",
    APPROVED: "معتمد",
    REJECTED: "مرفوض",
    HIDDEN: "مخفي",
    SPAM: "Spam",
  };

  return labels[status] || status;
}

function getStatusClass(status: string) {
  if (status === "PENDING") return "pending";
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  if (status === "HIDDEN") return "hidden";
  if (status === "SPAM") return "spam";
  return "hidden";
}

function getReviewCustomerName(review: ReviewItem) {
  return review.customerName || "عميل";
}

function getReviewCustomerContact(review: ReviewItem) {
  return review.customerEmail || review.customerPhone || "غير متوفر";
}

function getReviewProductLink(storeSlug: string | undefined, productId: string) {
  if (!storeSlug) return "";

  return `/store/${storeSlug}/product/${productId}`;
}

function getPendingReviews(reviews: ReviewItem[]) {
  return reviews.filter((review) => review.status === "PENDING");
}

function getVerifiedReviews(reviews: ReviewItem[]) {
  return reviews.filter((review) => review.isVerifiedPurchase);
}

function getRepliedReviews(reviews: ReviewItem[]) {
  return reviews.filter((review) => String(review.merchantReply || "").trim());
}

function getAverageFromReviews(reviews: ReviewItem[]) {
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + toNumber(review.rating, 0), 0);

  return total / reviews.length;
}

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const props = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  if (name === "reviews") {
    return (
      <svg {...props}>
        <path d="M4 5h16v11H7l-3 3V5Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }

  if (name === "star" || name === "rating") {
    return (
      <svg {...props}>
        <path d="m12 2 2.8 6 6.2.8-4.6 4.4 1.2 6.1L12 16.2 6.4 19.3l1.2-6.1L3 8.8 9.2 8 12 2Z" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...props}>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M6.2 9a7 7 0 0 1 11.6-2.6L20 11" />
        <path d="M17.8 15a7 7 0 0 1-11.6 2.6L4 13" />
      </svg>
    );
  }

  if (name === "external") {
    return (
      <svg {...props}>
        <path d="M14 4h6v6" />
        <path d="M10 14L20 4" />
        <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...props}>
        <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...props}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    );
  }

  if (name === "store") {
    return (
      <svg {...props}>
        <path d="M4 10h16" />
        <path d="M5 10l1-5h12l1 5" />
        <path d="M6 10v9h12v-9" />
        <path d="M9 19v-5h6v5" />
      </svg>
    );
  }

  if (name === "product") {
    return (
      <svg {...props}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "customer") {
    return (
      <svg {...props}>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...props}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...props}>
        <path d="M4 5h16v14H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...props}>
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  if (name === "status") {
    return (
      <svg {...props}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    );
  }

  if (name === "check" || name === "verified") {
    return (
      <svg {...props}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...props}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg {...props}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M6 6l1 15h10l1-15" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    );
  }

  if (name === "reply") {
    return (
      <svg {...props}>
        <path d="M10 9 5 14l5 5" />
        <path d="M5 14h9a5 5 0 0 0 5-5V5" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg {...props}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    );
  }

  if (name === "order") {
    return (
      <svg {...props}>
        <path d="M7 7h10" />
        <path d="M7 12h10" />
        <path d="M7 17h6" />
        <path d="M5 3h14a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 17h.01" />
      <path d="M12 13v-2" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  const safeRating = Math.min(5, Math.max(0, Math.round(Number(rating || 0))));

  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg leading-none ${
            star <= safeRating ? "text-amber-500" : "text-slate-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function DashboardReviewsPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>(defaultStats);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const derivedStats = useMemo(() => {
    const pending = getPendingReviews(reviews).length;
    const verified = getVerifiedReviews(reviews).length;
    const replied = getRepliedReviews(reviews).length;
    const average = getAverageFromReviews(reviews);

    return {
      pending,
      verified,
      replied,
      average,
    };
  }, [reviews]);

  async function loadReviews() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (ratingFilter) params.set("rating", ratingFilter);
      params.set("t", String(Date.now()));

      const response = await fetch(`/api/dashboard/reviews?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/merchant/login?next=/dashboard/reviews";
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل التقييمات");
      }

      const nextReviews = Array.isArray(data.reviews) ? data.reviews : [];

      setStore(data.store || null);
      setReviews(nextReviews);
      setStats(data.stats || defaultStats);

      const nextReplies: Record<string, string> = {};

      for (const review of nextReviews) {
        nextReplies[review.id] = review.merchantReply || "";
      }

      setReplyDrafts(nextReplies);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل التقييمات"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
    setSavingId(reviewId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/dashboard/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحديث حالة التقييم");
      }

      setSuccessMessage(data.message || "تم تحديث التقييم بنجاح");
      await loadReviews();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث التقييم"
      );
    } finally {
      setSavingId("");
    }
  }

  async function saveReply(reviewId: string) {
    setSavingId(reviewId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/dashboard/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          merchantReply: replyDrafts[reviewId] || "",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل حفظ رد التاجر");
      }

      setSuccessMessage("تم حفظ رد التاجر بنجاح");
      await loadReviews();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الرد"
      );
    } finally {
      setSavingId("");
    }
  }

  async function deleteReview(reviewId: string) {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا التقييم نهائيًا؟");

    if (!confirmed) return;

    setSavingId(reviewId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/dashboard/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل حذف التقييم");
      }

      setSuccessMessage(data.message || "تم حذف التقييم بنجاح");
      await loadReviews();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء حذف التقييم"
      );
    } finally {
      setSavingId("");
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading && reviews.length === 0) {
    return (
      <main className="reviews-page space-y-5" dir="rtl">
        <style>{reviewsPageStyles}</style>
        <ReviewsSkeleton />
      </main>
    );
  }

  return (
    <main className="reviews-page space-y-5" dir="rtl">
      <style>{reviewsPageStyles}</style>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="reviews-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div>
            <span className="reviews-pill">إدارة التقييمات</span>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-[var(--foreground)] md:text-3xl">
              تقييمات {store?.displayName || store?.name || "المتجر"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              راجع تقييمات العملاء، اعتمد المناسب منها، اخفِ أو ارفض غير المناسب،
              وأضف رد التاجر على كل تقييم.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] ring-1 ring-[var(--border)]">
                {formatNumber(derivedStats.pending)} بانتظار المراجعة
              </span>

              {store?.slug && (
                <span
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
                  dir="ltr"
                >
                  /store/{store.slug}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button type="button" onClick={loadReviews} className="reviews-action primary">
              <Icon name="refresh" />
              تحديث التقييمات
            </button>

            {store?.slug && (
              <Link
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="reviews-action secondary"
              >
                <Icon name="external" />
                معاينة المتجر
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="إجمالي التقييمات"
          value={formatNumber(stats.total)}
          note="كل التقييمات"
          icon="reviews"
        />

        <StatCard
          title="بانتظار المراجعة"
          value={formatNumber(stats.pending)}
          note="تحتاج قرار"
          icon="warning"
          tone="gold"
        />

        <StatCard
          title="المعتمدة"
          value={formatNumber(stats.approved)}
          note="تظهر للعملاء"
          icon="check"
        />

        <StatCard
          title="متوسط المعتمد"
          value={`${formatRating(stats.approvedAverageRating)} / 5`}
          note="متوسط تقييمات المنتجات"
          icon="star"
          tone="gold"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="متوسط الكل"
          value={`${formatRating(stats.averageRating || derivedStats.average)} / 5`}
          note="كل الحالات"
          icon="rating"
          tone="blue"
        />

        <StatCard
          title="شراء موثق"
          value={formatNumber(derivedStats.verified)}
          note="تقييمات من طلبات فعلية"
          icon="verified"
        />

        <StatCard
          title="تم الرد عليها"
          value={formatNumber(derivedStats.replied)}
          note="ردود التاجر"
          icon="reply"
          tone="purple"
        />

        <StatCard
          title="مرفوض / Spam"
          value={formatNumber(stats.rejected + stats.spam)}
          note="غير معروضة"
          icon="close"
          tone="red"
        />
      </section>

      <section className="reviews-card overflow-hidden">
        <div className="border-b border-[var(--border-soft)] p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                قائمة التقييمات
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                ابحث باسم المنتج أو العميل أو نص التقييم، وفلتر حسب الحالة أو عدد النجوم.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,320px)_190px_170px_110px]">
              <div className="reviews-search-wrap">
                <Icon name="search" className="reviews-search-icon h-4 w-4" />

                <input
                  className="reviews-input reviews-search-input"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث باسم المنتج أو العميل..."
                />
              </div>

              <div className="reviews-modern-select-wrap">
                <select
                  className="reviews-select reviews-modern-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <span className="reviews-select-chevron">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </div>

              <div className="reviews-modern-select-wrap">
                <select
                  className="reviews-select reviews-modern-select"
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value)}
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <span className="reviews-select-chevron">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </div>

              <button type="button" onClick={loadReviews} className="reviews-action primary">
                تطبيق
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-5">
            <ReviewsListSkeleton />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            title="لا توجد تقييمات"
            description="عند إضافة العملاء تقييمات على المنتجات، ستظهر هنا للمراجعة والاعتماد."
          />
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {reviews.map((review) => {
              const productLink = getReviewProductLink(store?.slug, review.productId);

              return (
                <article key={review.id} className="reviews-row p-5">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                    <div className="min-w-0">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="reviews-thumb shrink-0">
                          {review.product.imageUrl ? (
                            <img
                              src={review.product.imageUrl}
                              alt={review.product.name}
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[var(--muted-foreground)]">
                              <Icon name="product" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {productLink ? (
                              <Link
                                href={productLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-lg font-semibold text-[var(--foreground)] transition hover:text-[var(--mint-hover)]"
                              >
                                {review.product.name}
                              </Link>
                            ) : (
                              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                {review.product.name}
                              </h3>
                            )}

                            <span className={`reviews-status ${getStatusClass(review.status)}`}>
                              <span className="reviews-status-dot" />
                              {getStatusLabel(review.status)}
                            </span>

                            {review.isVerifiedPurchase && (
                              <span className="reviews-badge verified">
                                <Icon name="verified" className="h-3.5 w-3.5" />
                                شراء موثق
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Stars rating={review.rating} />

                            <span className="font-[var(--font-en)] text-sm font-bold text-[var(--foreground)]">
                              {formatRating(review.rating)} / 5
                            </span>

                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)]">
                              <Icon name="calendar" className="h-3.5 w-3.5" />
                              {formatDate(review.createdAt)}
                            </span>
                          </div>

                          <div className="reviews-comment-box mt-4">
                            {review.title && (
                              <h4 className="text-base font-semibold text-[var(--foreground)]">
                                {review.title}
                              </h4>
                            )}

                            <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-7 text-[var(--foreground)]">
                              {review.comment}
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <InfoBox
                              icon="customer"
                              label="العميل"
                              value={getReviewCustomerName(review)}
                            />

                            <InfoBox
                              icon="phone"
                              label="الهاتف"
                              value={review.customerPhone || "غير متوفر"}
                              dir="ltr"
                            />

                            <InfoBox
                              icon="mail"
                              label="البريد"
                              value={getReviewCustomerContact(review)}
                              dir="ltr"
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {review.orderId && (
                              <span className="reviews-badge" dir="ltr">
                                <Icon name="order" className="h-3.5 w-3.5" />
                                Order: {review.orderId}
                              </span>
                            )}

                            <span className="reviews-badge">
                              تقييم المنتج الحالي: {formatRating(review.product.ratingAverage)} / 5
                            </span>

                            <span className="reviews-badge">
                              {formatNumber(review.product.ratingCount)} تقييم على المنتج
                            </span>
                          </div>

                          {review.merchantReply && (
                            <div className="reviews-reply-box mt-4">
                              <div className="flex items-center gap-2">
                                <Icon name="reply" className="h-4 w-4 text-[var(--mint-hover)]" />

                                <p className="text-sm font-semibold text-[var(--foreground)]">
                                  رد التاجر
                                </p>
                              </div>

                              <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-7 text-[var(--foreground)]">
                                {review.merchantReply}
                              </p>

                              {review.merchantReplyAt && (
                                <p className="mt-2 text-xs font-semibold text-[var(--muted-foreground)]">
                                  {formatDate(review.merchantReplyAt)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <aside className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateReviewStatus(review.id, "APPROVED")}
                          disabled={savingId === review.id}
                          className="reviews-action success disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon name="check" />
                          اعتماد
                        </button>

                        <button
                          type="button"
                          onClick={() => updateReviewStatus(review.id, "HIDDEN")}
                          disabled={savingId === review.id}
                          className="reviews-action secondary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon name="eye" />
                          إخفاء
                        </button>

                        <button
                          type="button"
                          onClick={() => updateReviewStatus(review.id, "REJECTED")}
                          disabled={savingId === review.id}
                          className="reviews-action danger disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon name="close" />
                          رفض
                        </button>

                        <button
                          type="button"
                          onClick={() => updateReviewStatus(review.id, "SPAM")}
                          disabled={savingId === review.id}
                          className="reviews-action danger disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon name="warning" />
                          Spam
                        </button>
                      </div>

                      <div className="reviews-mini-card">
                        <div className="flex items-center gap-2">
                          <Icon name="reply" className="h-4 w-4 text-[var(--mint-hover)]" />

                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            رد التاجر
                          </p>
                        </div>

                        <textarea
                          className="reviews-textarea mt-3"
                          value={replyDrafts[review.id] || ""}
                          onChange={(event) =>
                            setReplyDrafts((current) => ({
                              ...current,
                              [review.id]: event.target.value,
                            }))
                          }
                          placeholder="اكتب رد التاجر على التقييم..."
                        />

                        <button
                          type="button"
                          onClick={() => saveReply(review.id)}
                          disabled={savingId === review.id}
                          className="reviews-action primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon name="reply" />
                          {savingId === review.id ? "جاري الحفظ..." : "حفظ الرد"}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteReview(review.id)}
                        disabled={savingId === review.id}
                        className="reviews-action danger w-full disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Icon name="trash" />
                        حذف نهائي
                      </button>
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: IconName;
  tone?: "gold" | "red" | "blue" | "purple";
}) {
  const iconClass =
    tone === "red"
      ? "reviews-icon red"
      : tone === "gold"
        ? "reviews-icon gold"
        : tone === "blue"
          ? "reviews-icon blue"
          : tone === "purple"
            ? "reviews-icon purple"
            : "reviews-icon";

  return (
    <article className="reviews-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="reviews-stat-value mt-4" dir="ltr">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {note}
          </p>
        </div>

        <span className={iconClass}>
          <Icon name={icon} />
        </span>
      </div>
    </article>
  );
}

function InfoBox({
  icon,
  label,
  value,
  dir = "rtl",
}: {
  icon: IconName;
  label: string;
  value: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="reviews-mini-card">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="h-4 w-4 text-[var(--mint-hover)]" />

        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 text-center">
      <div className="reviews-icon navy mx-auto">
        <Icon name="empty" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h3>

      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <>
      <section className="reviews-hero p-5 md:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div>
            <div className="reviews-skeleton h-8 w-36" />
            <div className="reviews-skeleton mt-5 h-9 w-72 max-w-full" />
            <div className="reviews-skeleton mt-4 h-4 w-[560px] max-w-full" />
            <div className="reviews-skeleton mt-3 h-4 w-[440px] max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="reviews-skeleton h-11 w-full" />
            <div className="reviews-skeleton h-11 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="reviews-card p-5">
            <div className="reviews-skeleton h-4 w-28" />
            <div className="reviews-skeleton mt-4 h-8 w-20" />
            <div className="reviews-skeleton mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="reviews-card p-5">
        <ReviewsListSkeleton />
      </section>
    </>
  );
}

function ReviewsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3">
            <div className="reviews-skeleton h-[74px] w-[74px] rounded-[20px]" />

            <div className="flex-1">
              <div className="reviews-skeleton h-5 w-52 max-w-full" />
              <div className="reviews-skeleton mt-3 h-4 w-44 max-w-full" />
              <div className="reviews-skeleton mt-4 h-20 w-full" />
            </div>
          </div>

          <div className="hidden w-64 space-y-3 xl:block">
            <div className="reviews-skeleton h-11 w-full" />
            <div className="reviews-skeleton h-28 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}