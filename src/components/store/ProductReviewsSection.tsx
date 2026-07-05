"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "SUPER_ADMIN" | "MERCHANT" | "CUSTOMER";
  customerStoreId?: string | null;
  customerStore?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type ReviewItem = {
  id: string;
  storeId: string;
  productId: string;
  userId?: string | null;
  customerId?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  status: string;
  isVerifiedPurchase?: boolean;
  orderId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  merchantReply?: string | null;
  merchantReplyAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

type RatingDistributionItem = {
  rating: number;
  count: number;
};

type ProductReviewsResponse = {
  success: boolean;
  message?: string;
  product?: {
    id: string;
    name: string;
    ratingAverage: number;
    ratingCount: number;
  };
  ratingDistribution?: RatingDistributionItem[];
  reviews?: ReviewItem[];
};

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 1,
  });
}

function formatDate(value?: string | null) {
  if (!value) return "غير متوفر";

  return new Date(value).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Stars({ rating, size = "text-xl" }: { rating: number; size?: string }) {
  const roundedRating = Math.round(Number(rating || 0));

  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} ${
            star <= roundedRating ? "text-amber-500" : "text-[var(--muted-foreground)]/40"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductReviewsSection({
  productId,
  productName,
  storeSlug,
  customerUser,
  loginPath,
  registerPath,
}: {
  productId: string;
  productName: string;
  storeSlug: string;
  customerUser: AuthUser | null;
  loginPath: string;
  registerPath: string;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistributionItem[]>([]);
  const [ratingAverage, setRatingAverage] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canReview = customerUser?.role === "CUSTOMER";

  const distributionTotal = useMemo(() => {
    return ratingDistribution.reduce((sum, item) => sum + Number(item.count || 0), 0);
  }, [ratingDistribution]);

  async function loadReviews() {
    if (!productId) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/products/${productId}/reviews?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = (await response.json().catch(() => null)) as ProductReviewsResponse | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل تحميل تقييمات المنتج");
      }

      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setRatingDistribution(
        Array.isArray(data.ratingDistribution) ? data.ratingDistribution : []
      );
      setRatingAverage(Number(data.product?.ratingAverage || 0));
      setRatingCount(Number(data.product?.ratingCount || 0));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل تقييمات المنتج"
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canReview) {
      setErrorMessage("يجب تسجيل الدخول كعميل لإضافة تقييم");
      return;
    }

    if (!comment.trim() || comment.trim().length < 3) {
      setErrorMessage("اكتب تعليق مناسب للتقييم");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          title,
          comment,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "فشل إرسال التقييم");
      }

      setSuccessMessage(data.message || "تم إرسال تقييمك بنجاح");
      setRating(5);
      setTitle("");
      setComment("");
      await loadReviews();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "حدث خطأ أثناء إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [productId]);

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" id="reviews">
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-[var(--foreground)]">
              تقييمات المنتج
            </h2>
            <p className="mt-2 text-sm font-bold text-[var(--muted-foreground)]">
              تقييمات العملاء المعتمدة من التاجر.
            </p>
          </div>

          <div className="rounded-3xl bg-[var(--muted)] px-5 py-4 text-center">
            <p className="text-4xl font-black text-[var(--foreground)]">
              {formatNumber(ratingAverage)}
            </p>
            <Stars rating={ratingAverage} />
            <p className="mt-1 text-xs font-black text-[var(--muted-foreground)]">
              {formatNumber(ratingCount)} تقييم
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const item = ratingDistribution.find((current) => current.rating === star);
            const count = Number(item?.count || 0);
            const percent = distributionTotal > 0 ? (count / distributionTotal) * 100 : 0;

            return (
              <div key={star} className="grid grid-cols-[70px_1fr_45px] items-center gap-3">
                <div className="flex items-center gap-1 text-sm font-black text-[var(--foreground)]" dir="ltr">
                  <span>{star}</span>
                  <span className="text-amber-500">★</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="text-sm font-black text-[var(--muted-foreground)]">
                  {formatNumber(count)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--muted)] p-5">
          <h3 className="text-xl font-black text-[var(--foreground)]">
            اكتب تقييمك عن {productName}
          </h3>

          {!canReview ? (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
              <p className="text-sm font-bold leading-7 text-[var(--muted-foreground)]">
                يجب تسجيل الدخول كعميل داخل هذا المتجر حتى تتمكن من إضافة تقييم.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href={loginPath} className="btn-primary text-center">
                  تسجيل الدخول
                </Link>
                <Link href={registerPath} className="btn-secondary text-center">
                  إنشاء حساب
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submitReview} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-[var(--foreground)]">
                  عدد النجوم
                </label>
                <select
                  className="input"
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                >
                  <option value={5}>5 نجوم</option>
                  <option value={4}>4 نجوم</option>
                  <option value={3}>3 نجوم</option>
                  <option value={2}>2 نجوم</option>
                  <option value={1}>1 نجمة</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-[var(--foreground)]">
                  عنوان التقييم اختياري
                </label>
                <input
                  className="input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="مثال: منتج ممتاز"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-[var(--foreground)]">
                  تعليقك
                </label>
                <textarea
                  className="input min-h-[130px] resize-y"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="اكتب رأيك في المنتج..."
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-black text-red-600">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-black text-emerald-600">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "جاري إرسال التقييم..." : "إرسال التقييم"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black text-[var(--foreground)]">
              آراء العملاء
            </h3>
            <p className="mt-1 text-sm font-bold text-[var(--muted-foreground)]">
              تظهر هنا التقييمات المعتمدة فقط.
            </p>
          </div>

          <button type="button" onClick={loadReviews} className="btn-secondary">
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-[var(--muted)] p-6 text-sm font-bold text-[var(--muted-foreground)]">
            جاري تحميل التقييمات...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl bg-[var(--muted)] p-8 text-center">
            <h4 className="text-xl font-black text-[var(--foreground)]">
              لا توجد تقييمات معتمدة بعد
            </h4>
            <p className="mt-2 text-sm font-bold leading-7 text-[var(--muted-foreground)]">
              كن أول من يشارك رأيه في هذا المنتج.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-3xl border border-[var(--border)] bg-[var(--muted)] p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-black text-[var(--foreground)]">
                        {review.customerName || "عميل"}
                      </h4>

                      {review.isVerifiedPurchase && (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 ring-1 ring-emerald-500/20">
                          شراء موثق
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs font-bold text-[var(--muted-foreground)]">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <Stars rating={review.rating} />
                </div>

                {review.title && (
                  <h5 className="mt-4 text-base font-black text-[var(--foreground)]">
                    {review.title}
                  </h5>
                )}

                <p className="mt-3 whitespace-pre-wrap text-sm font-bold leading-8 text-[var(--foreground)]">
                  {review.comment}
                </p>

                {review.merchantReply && (
                  <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
                    <p className="text-sm font-black text-[var(--foreground)]">
                      رد المتجر
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-7 text-[var(--muted-foreground)]">
                      {review.merchantReply}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
