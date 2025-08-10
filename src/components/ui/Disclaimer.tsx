'use client';

import React from 'react';

type DisclaimerProps = {
  className?: string;
};

export default function Disclaimer({ className = '' }: DisclaimerProps) {
  return (
    <div className={`text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-4 ${className}`}>
      Wyliczenia mają charakter orientacyjny i informacyjny. Nie stanowią porady inwestycyjnej, finansowej ani oferty w rozumieniu Kodeksu cywilnego.
      Rzeczywiste wartości mogą się różnić w zależności od stawek rynkowych, przyjętych założeń, wykonawców i warunków finansowania.
    </div>
  );
}


