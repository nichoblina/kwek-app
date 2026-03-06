'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SettingsModal } from '@/components/SettingsModal';
import { useDecks } from '@/hooks/useDecks';
import { DeckGrid } from '@/components/deck/DeckGrid';
import { getCategoryColor, getCategoryLabel } from '@/lib/utils';

const LEGEND_LIMIT = 5;

export default function Home() {
  // Initialize decks
  const { allDecks, customDecks, hydrated } = useDecks();

  // Initialize settings
  const [showSettings, setShowSettings] = useState(false);

  // Initialize search and filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'cardCount'>(
    'createdAt',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'builtin' | 'custom'>(
    'all',
  );

  // Initialize categories
  const categoryCounts = allDecks
    .flatMap((d) => d.cards)
    .reduce<Record<string, number>>((acc, card) => {
      acc[card.category] = (acc[card.category] ?? 0) + 1;
      return acc;
    }, {});
  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  // Filter deck based on the states
  const filteredDecks = allDecks
    .filter((deck) => {
      const matchesSearch = deck.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        filterCategory === null || deck.categories.includes(filterCategory);
      const matchesType =
        filterType === 'all' ||
        (filterType === 'builtin' && deck.isBuiltIn) ||
        (filterType === 'custom' && !deck.isBuiltIn);
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let result = 0;
      if (sortBy === 'name') result = a.name.localeCompare(b.name);
      else if (sortBy === 'createdAt')
        result = a.createdAt.localeCompare(b.createdAt);
      else if (sortBy === 'cardCount') result = a.cards.length - b.cards.length;
      return sortOrder === 'asc' ? result : -result;
    });

  return (
    <div className='max-w-3xl mx-auto px-5 py-10 pb-16'>
      {/* Header */}
      <div className='mb-10 pb-6 border-b-2 border-text-primary'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <div>
            <h1 className='text-[2.6rem] leading-none tracking-tight font-logo text-primary'>
              kwek
            </h1>
            <p className='text-sm text-muted mt-1.5 font-medium'>
              Flashcards & quizzes — study smarter
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className='px-5 py-2.5 rounded-xl font-bold text-sm border-[1.5px] border-border hover:border-primary hover:bg-primary hover:text-white transition-all'
            >
              ⚙ Settings
            </button>
            <Link
              href='/decks/new'
              className='px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 shrink-0 bg-cta text-cta-text hover:opacity-80 border-[1.5px] border-transparent'
            >
              + New Deck
            </Link>
          </div>
        </div>

        {/* Category legend */}
        {hydrated && categories.length > 0 && (
          <div className='flex gap-5 mt-5 flex-wrap'>
            {categories.slice(0, LEGEND_LIMIT).map((cat) => (
              <div key={cat} className='flex items-center gap-1.5'>
                <span
                  className='w-2.5 h-2.5 rounded-full'
                  style={{ background: getCategoryColor(cat) }}
                />
                <span className='text-[0.8rem] font-semibold text-muted'>
                  {getCategoryLabel(cat)}
                </span>
              </div>
            ))}
            {categories.length > LEGEND_LIMIT && (
              <span className='text-[0.8rem] font-semibold text-muted'>
                +{categories.length - LEGEND_LIMIT} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search & filter */}
      {hydrated && (
        <div className='mb-6 flex flex-col gap-3'>
          <input
            type='text'
            placeholder='Search decks...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full px-4 py-2.5 rounded-xl border-[1.5px] border-border bg-card text-sm font-medium focus:outline-none focus:border-primary'
          />
          <div className='flex gap-2 flex-wrap'>
            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'name' | 'createdAt' | 'cardCount')
              }
              className='px-3 py-2 rounded-xl border-[1.5px] border-border bg-card text-sm font-medium focus:outline-none focus:border-primary hover:border-primary transition-colors cursor-pointer'
            >
              <option value='createdAt'>Date created</option>
              <option value='name'>Alphabetical</option>
              <option value='cardCount'>Card count</option>
            </select>

            {/* Sort order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className='px-3 py-2 rounded-xl border-[1.5px] border-border bg-card text-sm font-medium focus:outline-none focus:border-primary hover:border-primary transition-colors cursor-pointer'
            >
              <option value='desc'>Desc</option>
              <option value='asc'>Asc</option>
            </select>

            {/* Filter by type */}
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | 'builtin' | 'custom')
              }
              className='px-3 py-2 rounded-xl border-[1.5px] border-border bg-card text-sm font-medium focus:outline-none focus:border-primary hover:border-primary transition-colors cursor-pointer'
            >
              <option value='all'>All</option>
              <option value='builtin'>Built-in</option>
              <option value='custom'>Custom</option>
            </select>

            {/* Filter by category */}
            <select
              value={filterCategory ?? ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className='px-3 py-2 rounded-xl border-[1.5px] border-border bg-card text-sm font-medium focus:outline-none focus:border-primary hover:border-primary transition-colors cursor-pointer'
            >
              <option value=''>All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* All decks */}
      {!hydrated ? (
        <div className='text-muted text-sm font-medium'>Loading decks…</div>
      ) : (
        <>
          <section className='mb-8'>
            <h2 className='font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted mb-4'>
              All Decks ({filteredDecks.length})
            </h2>
            <DeckGrid decks={filteredDecks} showEmptyState={false} />
          </section>

          {customDecks.length === 0 && (
            <div className='border-[1.5px] border-dashed border-border rounded-2xl p-8 text-center mt-4'>
              <p className='text-muted text-sm font-medium mb-3'>
                Create your own deck to study any topic.
              </p>
              <Link
                href='/decks/new'
                className='inline-block px-5 py-2 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-80 bg-cta text-cta-text'
              >
                + Create Deck
              </Link>
            </div>
          )}
        </>
      )}

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
