'use client';

import { useState } from 'react';
import type { Deck, SimpleCard } from '@/lib/types';
import { generateId, getCategoryLabel } from '@/lib/utils';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

interface CardFormState {
  front: string;
  back: string;
  category: string;
  showQuiz: boolean;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

function emptyCardForm(): CardFormState {
  return {
    front: '',
    back: '',
    category: '',
    showQuiz: false,
    options: ['', '', '', ''],
    answerIndex: 0,
    explanation: '',
  };
}

interface DeckEditorProps {
  deck: Deck | null;
  onSave: (deck: Deck) => void;
  onCancel: () => void;
}

export function DeckEditor({ deck, onSave, onCancel }: DeckEditorProps) {
  const [name, setName] = useState(deck?.name ?? '');
  const [description, setDescription] = useState(deck?.description ?? '');
  const [cards, setCards] = useState<SimpleCard[]>(
    (deck?.cards.filter((c) => c.type === 'simple') as SimpleCard[]) ?? [],
  );
  const [cardForm, setCardForm] = useState<CardFormState>(emptyCardForm());
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Deck name is required.';
    if (cards.length === 0) errs.cards = 'Add at least one card.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const now = new Date().toISOString();
    const saved: Deck = {
      id: deck?.id ?? generateId(),
      name: name.trim(),
      description: description.trim(),
      createdAt: deck?.createdAt ?? now,
      isBuiltIn: false,
      categories: [...new Set(cards.map((c) => c.category))],
      cards,
    };
    onSave(saved);
  }

  function saveCardForm() {
    const cardErrors: Record<string, string> = {};
    if (!cardForm.front.trim()) cardErrors.front = 'Front is required.';
    if (!cardForm.back.trim()) cardErrors.back = 'Back is required.';
    if (cardForm.showQuiz) {
      cardForm.options.forEach((o, i) => {
        if (!o.trim())
          cardErrors[`opt${i}`] = `Option ${LETTERS[i]} is required.`;
      });
    }
    if (Object.keys(cardErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...cardErrors }));
      return;
    }

    const newCard: SimpleCard = {
      id: editingCardId ?? generateId(),
      type: 'simple',
      category: cardForm.category,
      front: cardForm.front.trim(),
      back: cardForm.back.trim(),
      ...(cardForm.showQuiz && {
        options: cardForm.options.map((o) => o.trim()) as [
          string,
          string,
          string,
          string,
        ],
        answerIndex: cardForm.answerIndex,
        explanation: cardForm.explanation.trim() || undefined,
      }),
    };

    if (editingCardId) {
      setCards((prev) =>
        prev.map((c) => (c.id === editingCardId ? newCard : c)),
      );
      setEditingCardId(null);
    } else {
      setCards((prev) => [...prev, newCard]);
    }

    setCardForm(emptyCardForm());
    setErrors((prev) => {
      const next = { ...prev };
      delete next.front;
      delete next.back;
      delete next.cards;
      LETTERS.forEach((_, i) => delete next[`opt${i}`]);
      return next;
    });
  }

  function startEditCard(card: SimpleCard) {
    setEditingCardId(card.id);
    setCardForm({
      front: card.front,
      back: card.back,
      category: card.category,
      showQuiz: !!(card.options && card.options.length === 4),
      options: card.options ?? ['', '', '', ''],
      answerIndex: card.answerIndex ?? 0,
      explanation: card.explanation ?? '',
    });
  }

  function cancelCardEdit() {
    setEditingCardId(null);
    setCardForm(emptyCardForm());
  }

  function deleteCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border-[1.5px] border-border bg-bg text-text-primary text-sm font-medium focus:outline-none focus:border-text-primary transition-colors duration-150';
  const labelClass =
    'block text-[0.75rem] font-semibold text-muted uppercase tracking-wide mb-1.5 font-mono';

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Deck metadata */}
      <div className='bg-card border-[1.5px] border-border rounded-2xl p-6 mb-5'>
        <h2 className='font-extrabold text-xl mb-5 text-text-primary'>
          {deck ? 'Edit Deck' : 'New Deck'}
        </h2>

        <div className='mb-4'>
          <label className={labelClass}>Deck Name *</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. React Hooks'
            className={inputClass}
          />
          {errors.name && (
            <p className='text-[0.75rem] text-primary mt-1'>{errors.name}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='What is this deck about?'
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Card list */}
      {cards.length > 0 && (
        <div className='mb-5'>
          <h3 className='font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted mb-3'>
            Cards ({cards.length})
          </h3>
          <div className='flex flex-col gap-2'>
            {cards.map((card, idx) => (
              <div
                key={card.id}
                className='bg-card border-[1.5px] border-border rounded-xl px-4 py-3 flex items-start gap-3'
              >
                <span className='font-mono text-[0.65rem] font-bold text-muted mt-0.5 shrink-0'>
                  {idx + 1}
                </span>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-text-primary truncate'>
                    {card.front}
                  </p>
                  <p className='text-xs text-muted truncate mt-0.5'>
                    {card.back}
                  </p>
                  {card.options && (
                    <span
                      className='inline-block font-mono text-[0.58rem] font-semibold uppercase tracking-wide mt-1 px-1.5 py-0.5 rounded-full'
                      style={{
                        background: 'rgba(47,125,200,0.1)',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      MC
                    </span>
                  )}
                </div>
                <div className='flex gap-1.5 shrink-0'>
                  <button
                    onClick={() => startEditCard(card)}
                    className='text-[0.72rem] font-semibold text-muted hover:text-text-primary transition-colors cursor-pointer px-2 py-1'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className='text-[0.72rem] font-semibold text-primary hover:opacity-70 transition-opacity cursor-pointer px-2 py-1'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {errors.cards && (
            <p className='text-[0.75rem] text-primary mt-2'>{errors.cards}</p>
          )}
        </div>
      )}

      {/* Card form */}
      <div className='bg-card border-[1.5px] border-border rounded-2xl p-6 mb-5'>
        <h3 className='font-bold text-base mb-5 text-text-primary'>
          {editingCardId ? 'Edit Card' : 'Add Card'}
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className={labelClass}>Front (Question) *</label>
            <textarea
              value={cardForm.front}
              onChange={(e) =>
                setCardForm((f) => ({ ...f, front: e.target.value }))
              }
              placeholder='What is...?'
              rows={3}
              className={`${inputClass} resize-none`}
            />
            {errors.front && (
              <p className='text-[0.75rem] text-primary mt-1'>{errors.front}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Back (Answer) *</label>
            <textarea
              value={cardForm.back}
              onChange={(e) =>
                setCardForm((f) => ({ ...f, back: e.target.value }))
              }
              placeholder='The answer is...'
              rows={3}
              className={`${inputClass} resize-none`}
            />
            {errors.back && (
              <p className='text-[0.75rem] text-primary mt-1'>{errors.back}</p>
            )}
          </div>
        </div>

        <div className='mb-4'>
          <label className={labelClass}>Category</label>
          <input
            type='text'
            list='category-suggestions'
            value={cardForm.category}
            onChange={(e) =>
              setCardForm((f) => ({ ...f, category: e.target.value }))
            }
            placeholder='e.g. biology, chapter 3, literature...'
            className={inputClass}
          />
          <datalist id="category-suggestions">
            {[...new Set(cards.map((card) => card.category))].map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Quiz options toggle */}
        <button
          type='button'
          onClick={() => setCardForm((f) => ({ ...f, showQuiz: !f.showQuiz }))}
          className='flex items-center gap-2 text-sm font-semibold mb-4 cursor-pointer transition-colors hover:text-primary'
          style={{
            color: cardForm.showQuiz
              ? 'var(--color-secondary)'
              : 'var(--color-muted)',
          }}
        >
          <span
            className='w-4 h-4 border-[1.5px] rounded flex items-center justify-center text-[0.65rem] transition-all'
            style={{
              borderColor: cardForm.showQuiz
                ? 'var(--color-secondary)'
                : 'var(--color-border)',
              background: cardForm.showQuiz
                ? 'var(--color-secondary)'
                : 'transparent',
              color: cardForm.showQuiz ? 'white' : 'transparent',
            }}
          >
            ✓
          </span>
          Add multiple-choice options (for quiz mode)
        </button>

        {cardForm.showQuiz && (
          <div className='border-[1.5px] border-border rounded-xl p-4 mb-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
              {cardForm.options.map((opt, i) => (
                <div key={i}>
                  <label className={labelClass}>
                    Option {LETTERS[i]}{' '}
                    <input
                      type='radio'
                      name='answerIndex'
                      checked={cardForm.answerIndex === i}
                      onChange={() =>
                        setCardForm((f) => ({
                          ...f,
                          answerIndex: i as 0 | 1 | 2 | 3,
                        }))
                      }
                      className='ml-1'
                    />{' '}
                    (correct)
                  </label>
                  <input
                    type='text'
                    value={opt}
                    onChange={(e) => {
                      const opts = [...cardForm.options] as [
                        string,
                        string,
                        string,
                        string,
                      ];
                      opts[i] = e.target.value;
                      setCardForm((f) => ({ ...f, options: opts }));
                    }}
                    placeholder={`Option ${LETTERS[i]}`}
                    className={inputClass}
                  />
                  {errors[`opt${i}`] && (
                    <p className='text-[0.75rem] text-primary mt-1'>
                      {errors[`opt${i}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>Explanation (optional)</label>
              <textarea
                value={cardForm.explanation}
                onChange={(e) =>
                  setCardForm((f) => ({ ...f, explanation: e.target.value }))
                }
                placeholder='Why is this the correct answer?'
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}

        <div className='flex gap-3'>
          <button
            onClick={saveCardForm}
            className='px-5 py-2 rounded-xl font-bold text-sm cursor-pointer transition-opacity hover:opacity-80 bg-text-primary text-bg'
          >
            {editingCardId ? 'Update Card' : '+ Add Card'}
          </button>
          {editingCardId && (
            <button
              onClick={cancelCardEdit}
              className='px-5 py-2 rounded-xl font-bold text-sm cursor-pointer border-[1.5px] border-border hover:bg-surface transition-colors'
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Save / Cancel */}
      <div className='flex gap-3'>
        <button
          onClick={handleSave}
          className='px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-opacity hover:opacity-80 bg-text-primary text-bg'
        >
          Save Deck
        </button>
        <button
          onClick={onCancel}
          className='px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer border-[1.5px] border-border hover:bg-surface transition-colors'
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
