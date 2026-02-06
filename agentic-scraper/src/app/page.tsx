"use client";

import { useState, useTransition } from "react";

type ScrapedData = {
  title: string | null;
  description: string | null;
  headings: string[];
  links: { text: string; href: string }[];
  paragraphs: string[];
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [scraped, setScraped] = useState<ScrapedData | null>(null);
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setScraped(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Unable to scrape that URL right now.");
          return;
        }

        setScraped(payload.data as ScrapedData);
        setFetchedUrl(payload.fetchedUrl ?? url);
      } catch (err) {
        console.error(err);
        setError("Unexpected error. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Agentic Web Scraper
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Fetch publicly available HTML pages, inspect their structure, and extract key
            content like titles, meta descriptions, headings, links, and paragraphs.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-950/40">
          <form className="flex flex-col gap-4 sm:flex-row" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="url-input">
              URL to scrape
            </label>
            <input
              id="url-input"
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-base text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="h-full min-h-[3.25rem] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 text-lg font-medium text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "Scraping…" : "Scrape"}
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-400">
            Observed data respects robots.txt and site policies. Verify permission before
            scraping.
          </p>
        </section>

        {error && (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">
            <p>{error}</p>
          </div>
        )}

        {scraped && (
          <section className="flex flex-col gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
                Fetched URL
              </p>
              <a
                href={fetchedUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-lg font-medium text-cyan-400 hover:text-cyan-200"
              >
                {fetchedUrl}
              </a>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-xl font-semibold text-white">Overview</h2>
                <dl className="mt-4 space-y-4 text-sm text-slate-300">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Title
                    </dt>
                    <dd className="text-base text-slate-100">
                      {scraped.title ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Description
                    </dt>
                    <dd className="text-base text-slate-100">
                      {scraped.description ?? "—"}
                    </dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-xl font-semibold text-white">Headings</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {scraped.headings.length === 0 && (
                    <li className="text-slate-500">No headings found.</li>
                  )}
                  {scraped.headings.map((heading, index) => (
                    <li
                      key={`${heading}-${index}`}
                      className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2"
                    >
                      {heading}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-xl font-semibold text-white">Links</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  {scraped.links.length === 0 && (
                    <li className="text-slate-500">No links found.</li>
                  )}
                  {scraped.links.map((link) => (
                    <li
                      key={link.href}
                      className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2"
                    >
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-200"
                      >
                        {link.text}
                      </a>
                      <p className="text-xs text-slate-500">{link.href}</p>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-xl font-semibold text-white">Paragraphs</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {scraped.paragraphs.length === 0 && (
                    <li className="text-slate-500">No paragraphs extracted.</li>
                  )}
                  {scraped.paragraphs.map((paragraph, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-3"
                    >
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
