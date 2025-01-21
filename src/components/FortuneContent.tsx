import React from 'react';
import { useLocation } from 'react-router-dom';
import FortunePage from '../pages/FortunePage';
import AstrologyChatBot from './AstrologyChatBot';
import TarotReader from './TarotReader';
import PalmReader from './PalmReader';
import { NumerologyReader } from './NumerologyReader';
import DreamReader from './DreamReader';
import AnimalReader from './AnimalReader';
import FourPillarsReader from './FourPillarsReader';
import HistoryPage from '../pages/HistoryPage';
import FengshuiReader from './FengshuiReader';

export function FortuneContent() {
  const location = useLocation();
  const path = location.pathname.split('/').pop();

  // パスに基づいて適切なコンポーネントを返す
  const renderContent = () => {
    if (!path || path === '') {
      return <FortunePage />;
    }

    switch (path) {
      case 'astrology':
        return <AstrologyChatBot />;
      case 'tarot':
        return <TarotReader />;
      case 'palm':
        return <PalmReader />;
      case 'numerology':
        return <NumerologyReader />;
      case 'dream':
        return <DreamReader />;
      case 'animal':
        return <AnimalReader />;
      case 'fourpillars':
        return <FourPillarsReader />;
      case 'history':
        return <HistoryPage />;
      case 'fengshui':
        return <FengshuiReader />;
      default:
        return <FortunePage />;
    }
  };

  return renderContent();
} 