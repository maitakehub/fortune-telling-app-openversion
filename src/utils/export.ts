import { FortuneReading } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportOptions {
  format?: 'pdf' | 'json';
  includeMetadata?: boolean;
  language?: 'ja' | 'en';
}

/**
 * 占い結果をエクスポートする
 */
export async function exportFortuneReading(
  reading: FortuneReading,
  options: ExportOptions = {}
): Promise<Blob | string> {
  const { format = 'pdf', includeMetadata = true, language = 'ja' } = options;

  if (format === 'pdf') {
    return exportToPDF(reading, { includeMetadata, language });
  } else {
    return exportToJSON(reading, { includeMetadata });
  }
}

/**
 * 占い結果をPDFとしてエクスポート
 */
async function exportToPDF(
  reading: FortuneReading,
  options: { includeMetadata?: boolean; language?: 'ja' | 'en' }
): Promise<Blob> {
  const { includeMetadata = true, language = 'ja' } = options;
  const doc = new jsPDF();

  // ヘッダー
  doc.setFontSize(20);
  doc.text('占い結果', 20, 20);

  // 基本情報
  doc.setFontSize(12);
  doc.text(`実施日時: ${new Date(reading.timestamp).toLocaleString(language)}`, 20, 35);
  doc.text(`占いの種類: ${getFortuneTypeName(reading.type, language)}`, 20, 45);

  // 結果の内容
  doc.setFontSize(14);
  doc.text('結果', 20, 60);
  
  const content = reading.reading.split('\n');
  let y = 70;
  content.forEach(line => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text(line, 20, y);
    y += 10;
  });

  // メタデータ
  if (includeMetadata && 'aspects' in reading) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('運勢の詳細', 20, 20);

    const aspects = reading.aspects as Record<string, string>;
    const tableData = Object.entries(aspects).map(([key, value]) => [
      getAspectName(key, language),
      value
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [['分野', '運勢']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 12,
        cellPadding: 5
      }
    });
  }

  return doc.output('blob');
}

/**
 * 占い結果をJSONとしてエクスポート
 */
function exportToJSON(
  reading: FortuneReading,
  options: { includeMetadata?: boolean }
): string {
  const { includeMetadata = true } = options;

  const exportData = {
    type: reading.type,
    timestamp: reading.timestamp,
    reading: reading.reading,
    ...(includeMetadata && {
      metadata: {
        aspects: 'aspects' in reading ? reading.aspects : undefined,
        luckyItems: 'luckyItems' in reading ? reading.luckyItems : undefined
      }
    })
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 占いの種類の名前を取得
 */
function getFortuneTypeName(type: string, language: 'ja' | 'en'): string {
  const names: Record<string, Record<'ja' | 'en', string>> = {
    numerology: { ja: '数秘術', en: 'Numerology' },
    tarot: { ja: 'タロット', en: 'Tarot' },
    palm: { ja: '手相', en: 'Palm Reading' },
    dream: { ja: '夢占い', en: 'Dream Interpretation' }
  };

  return names[type]?.[language] || type;
}

/**
 * 運勢の分野の名前を取得
 */
function getAspectName(aspect: string, language: 'ja' | 'en'): string {
  const names: Record<string, Record<'ja' | 'en', string>> = {
    general: { ja: '総合運', en: 'General' },
    love: { ja: '恋愛運', en: 'Love' },
    work: { ja: '仕事運', en: 'Work' },
    health: { ja: '健康運', en: 'Health' },
    money: { ja: '金運', en: 'Money' }
  };

  return names[aspect]?.[language] || aspect;
} 