'use client';

import Link from 'next/link';
import { useDecks } from '@/hooks/useDecks';
import { DeckGrid } from '@/components/deck/DeckGrid';
import { getCategoryColor, getCategoryLabel } from '@/lib/utils';

const LEGEND_LIMIT = 5;

export default function Home() {
  const { allDecks, customDecks, hydrated } = useDecks();
  const categoryCounts = allDecks
    .flatMap((d) => d.cards)
    .reduce<Record<string, number>>((acc, card) => {
      acc[card.category] = (acc[card.category] ?? 0) + 1;
      return acc;
    }, {});
  const categories = Object.entries(categoryCounts)
    .sort((a,b) => b[1] = a[1])
    .map(([cat]) => cat);

  return (
    <div className='max-w-3xl mx-auto px-5 py-10 pb-16'>
      {/* Header */}
      <div className='mb-10 pb-6 border-b-2 border-text-primary'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <div>
            <h1 className='text-[2.6rem] leading-none tracking-tight font-logo text-primary'>
              kwek<span className='text-[1.3rem] align-super ml-0.5'>2</span>
            </h1>
            <p className='text-sm text-muted mt-1.5 font-medium'>
              Flashcards & quizzes — study smarter
            </p>
          </div>
          <Link
            href='/decks/new'
            className='px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-80 shrink-0 bg-text-primary text-bg'
          >
            + New Deck
          </Link>
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

      {/* All decks */}
      {!hydrated ? (
        <div className='text-muted text-sm font-medium'>Loading decks…</div>
      ) : (
        <>
          <section className='mb-8'>
            <h2 className='font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted mb-4'>
              All Decks ({allDecks.length})
            </h2>
            <DeckGrid decks={allDecks} showEmptyState={false} />
          </section>

          {customDecks.length === 0 && (
            <div className='border-[1.5px] border-dashed border-border rounded-2xl p-8 text-center mt-4'>
              <p className='text-muted text-sm font-medium mb-3'>
                Create your own deck to study any topic.
              </p>
              <Link
                href='/decks/new'
                className='inline-block px-5 py-2 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-80 bg-text-primary text-bg'
              >
                + Create Deck
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
