export default function DashboardLoading() {
  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="skeleton h-11 w-56" />
          <div className="skeleton mt-4 h-5 w-80 max-w-full" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="skeleton h-12 w-56" />
          <div className="skeleton h-12 w-32" />
          <div className="skeleton h-12 w-28" />
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="skeleton h-5 w-28" />
            <div className="skeleton mt-4 h-9 w-64" />
            <div className="skeleton mt-4 h-4 w-52" />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="skeleton h-10 w-24 rounded-full" />
            <div className="skeleton h-10 w-28 rounded-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["sales", "orders", "products", "active"].map((item) => (
          <div key={item} className="glass-card p-5">
            <div className="skeleton h-5 w-28" />
            <div className="skeleton mt-5 h-9 w-36" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["new", "processing", "shipped", "delivered"].map((item) => (
          <div key={item} className="glass-card p-5">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton mt-5 h-9 w-24" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
            <div>
              <div className="skeleton h-8 w-40" />
              <div className="skeleton mt-3 h-4 w-64" />
            </div>

            <div className="skeleton h-11 w-28" />
          </div>

          <div className="divide-y divide-[var(--border)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
              >
                <div>
                  <div className="skeleton h-5 w-40" />
                  <div className="skeleton mt-3 h-4 w-56" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="skeleton h-8 w-24 rounded-full" />
                  <div className="skeleton h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <div className="skeleton h-8 w-40" />
            <div className="skeleton mt-3 h-4 w-56" />
          </div>

          <div className="divide-y divide-[var(--border)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-5">
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <div className="skeleton h-5 w-36" />
                    <div className="skeleton mt-3 h-4 w-28" />
                  </div>

                  <div className="skeleton h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {["products", "orders", "settings"].map((item) => (
          <div key={item} className="glass-card p-6">
            <div className="skeleton h-7 w-40" />
            <div className="skeleton mt-4 h-4 w-full" />
            <div className="skeleton mt-3 h-4 w-3/4" />
          </div>
        ))}
      </section>
    </main>
  );
}