import React, { useState, useEffect } from 'react';
import { PreferencesManager } from '../../utils/preferences';
import './SettingsPanel.css';

interface SettingsPanelProps {
  userId: string;
  onClose: () => void;
}

type SettingsCategory = 'general' | 'notifications' | 'display' | 'privacy' | 'fortune';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ userId, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preferencesManager = new PreferencesManager();

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const userPrefs = await preferencesManager.getUserPreferences(userId);
      setPreferences(userPrefs);
      setError(null);
    } catch (err) {
      setError('設定の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (updates: Partial<any>) => {
    try {
      setIsSaving(true);
      await preferencesManager.updatePreferences(userId, updates);
      setPreferences({ ...preferences, ...updates });
      setError(null);
    } catch (err) {
      setError('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const resetCategory = async () => {
    try {
      setIsSaving(true);
      const defaultPrefs = preferencesManager.createDefaultPreferences();
      const categoryPrefs = defaultPrefs[activeCategory];
      await savePreferences({ [activeCategory]: categoryPrefs });
    } catch (err) {
      setError('設定のリセットに失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAllPreferences = async () => {
    try {
      setIsSaving(true);
      const defaultPrefs = preferencesManager.createDefaultPreferences();
      await preferencesManager.updatePreferences(userId, defaultPrefs);
      setPreferences(defaultPrefs);
      setError(null);
    } catch (err) {
      setError('全設定のリセットに失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="settings-panel">読み込み中...</div>;
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>設定</h2>
        <button className="close-button" onClick={onClose}>閉じる</button>
      </div>

      {error && <div className="settings-error">{error}</div>}

      <nav className="settings-nav">
        <ul>
          <li>
            <button
              className={activeCategory === 'general' ? 'active' : ''}
              onClick={() => setActiveCategory('general')}
            >
              一般
            </button>
          </li>
          <li>
            <button
              className={activeCategory === 'notifications' ? 'active' : ''}
              onClick={() => setActiveCategory('notifications')}
            >
              通知
            </button>
          </li>
          <li>
            <button
              className={activeCategory === 'display' ? 'active' : ''}
              onClick={() => setActiveCategory('display')}
            >
              表示
            </button>
          </li>
          <li>
            <button
              className={activeCategory === 'privacy' ? 'active' : ''}
              onClick={() => setActiveCategory('privacy')}
            >
              プライバシー
            </button>
          </li>
          <li>
            <button
              className={activeCategory === 'fortune' ? 'active' : ''}
              onClick={() => setActiveCategory('fortune')}
            >
              占い
            </button>
          </li>
        </ul>
      </nav>

      <div className="settings-content">
        {activeCategory === 'general' && (
          <section className="settings-section">
            <h3>一般設定</h3>
            <div className="settings-group">
              <h4>解釈スタイル</h4>
              <select
                value={preferences.general.interpretationStyle}
                onChange={(e) => savePreferences({
                  general: { ...preferences.general, interpretationStyle: e.target.value }
                })}
              >
                <option value="detailed">詳細</option>
                <option value="concise">簡潔</option>
                <option value="poetic">詩的</option>
              </select>
            </div>

            <div className="settings-group">
              <h4>文化的コンテキスト</h4>
              <select
                value={preferences.general.culturalContext}
                onChange={(e) => savePreferences({
                  general: { ...preferences.general, culturalContext: e.target.value }
                })}
              >
                <option value="japanese">日本</option>
                <option value="western">西洋</option>
                <option value="chinese">中国</option>
              </select>
            </div>
          </section>
        )}

        {activeCategory === 'notifications' && (
          <section className="settings-section">
            <h3>通知設定</h3>
            <div className="settings-group">
              <h4>通知タイミング</h4>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.daily}
                  onChange={(e) => savePreferences({
                    notifications: { ...preferences.notifications, daily: e.target.checked }
                  })}
                />
                毎日の運勢
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.weekly}
                  onChange={(e) => savePreferences({
                    notifications: { ...preferences.notifications, weekly: e.target.checked }
                  })}
                />
                週間の運勢
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.monthly}
                  onChange={(e) => savePreferences({
                    notifications: { ...preferences.notifications, monthly: e.target.checked }
                  })}
                />
                月間の運勢
              </label>
            </div>

            <div className="settings-group">
              <h4>通知時間</h4>
              <div className="time-range">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.notifications.startHour}
                  onChange={(e) => savePreferences({
                    notifications: { ...preferences.notifications, startHour: parseInt(e.target.value) }
                  })}
                />
                <span>時 ～</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.notifications.endHour}
                  onChange={(e) => savePreferences({
                    notifications: { ...preferences.notifications, endHour: parseInt(e.target.value) }
                  })}
                />
                <span>時</span>
              </div>
            </div>

            <div className="settings-group">
              <h4>通知チャンネル</h4>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.channels.email}
                  onChange={(e) => savePreferences({
                    notifications: {
                      ...preferences.notifications,
                      channels: { ...preferences.notifications.channels, email: e.target.checked }
                    }
                  })}
                />
                メール
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.channels.browser}
                  onChange={(e) => savePreferences({
                    notifications: {
                      ...preferences.notifications,
                      channels: { ...preferences.notifications.channels, browser: e.target.checked }
                    }
                  })}
                />
                ブラウザ通知
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.channels.mobile}
                  onChange={(e) => savePreferences({
                    notifications: {
                      ...preferences.notifications,
                      channels: { ...preferences.notifications.channels, mobile: e.target.checked }
                    }
                  })}
                />
                モバイル通知
              </label>
            </div>
          </section>
        )}

        {activeCategory === 'display' && (
          <section className="settings-section">
            <h3>表示設定</h3>
            <div className="settings-group">
              <h4>テーマ</h4>
              <select
                value={preferences.display.theme}
                onChange={(e) => savePreferences({
                  display: { ...preferences.display, theme: e.target.value }
                })}
              >
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="auto">システム設定に従う</option>
              </select>
            </div>

            <div className="settings-group">
              <h4>フォントサイズ</h4>
              <select
                value={preferences.display.fontSize}
                onChange={(e) => savePreferences({
                  display: { ...preferences.display, fontSize: e.target.value }
                })}
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>

            <div className="settings-group">
              <h4>その他の表示オプション</h4>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.display.showImages}
                  onChange={(e) => savePreferences({
                    display: { ...preferences.display, showImages: e.target.checked }
                  })}
                />
                画像を表示
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.display.compactView}
                  onChange={(e) => savePreferences({
                    display: { ...preferences.display, compactView: e.target.checked }
                  })}
                />
                コンパクト表示
              </label>
            </div>
          </section>
        )}

        {activeCategory === 'privacy' && (
          <section className="settings-section">
            <h3>プライバシー設定</h3>
            <div className="settings-group">
              <h4>履歴の共有</h4>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.privacy.shareHistory}
                  onChange={(e) => savePreferences({
                    privacy: { ...preferences.privacy, shareHistory: e.target.checked }
                  })}
                />
                占い結果の匿名データを共有して精度向上に貢献する
              </label>
            </div>

            <div className="settings-group">
              <h4>分析の許可</h4>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.privacy.allowAnalytics}
                  onChange={(e) => savePreferences({
                    privacy: { ...preferences.privacy, allowAnalytics: e.target.checked }
                  })}
                />
                利用状況の分析を許可する
              </label>
            </div>

            <div className="settings-group">
              <h4>データの保存期間</h4>
              <select
                value={preferences.privacy.storageDuration}
                onChange={(e) => savePreferences({
                  privacy: { ...preferences.privacy, storageDuration: e.target.value }
                })}
              >
                <option value="1month">1ヶ月</option>
                <option value="3months">3ヶ月</option>
                <option value="6months">6ヶ月</option>
                <option value="1year">1年</option>
                <option value="forever">永続的に保存</option>
              </select>
            </div>
          </section>
        )}

        {activeCategory === 'fortune' && (
          <section className="settings-section">
            <h3>占い設定</h3>
            <div className="settings-group">
              <h4>デフォルトの占い種類</h4>
              <select
                value={preferences.fortune.defaultType}
                onChange={(e) => savePreferences({
                  fortune: { ...preferences.fortune, defaultType: e.target.value }
                })}
              >
                <option value="tarot">タロット</option>
                <option value="palmistry">手相</option>
                <option value="numerology">数秘術</option>
                <option value="dream">夢占い</option>
              </select>
            </div>

            <div className="settings-group">
              <h4>カスタムキーワード</h4>
              <div className="keyword-list">
                {preferences.fortune.customKeywords.map((keyword: string, index: number) => (
                  <div key={index} className="keyword-item">
                    <span>{keyword}</span>
                    <button onClick={() => {
                      const newKeywords = preferences.fortune.customKeywords.filter((_: string, i: number) => i !== index);
                      savePreferences({
                        fortune: { ...preferences.fortune, customKeywords: newKeywords }
                      });
                    }}>
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="settings-footer">
        <button
          className="reset-button"
          onClick={resetCategory}
          disabled={isSaving}
        >
          このカテゴリーをリセット
        </button>
        <button
          className="reset-all-button"
          onClick={resetAllPreferences}
          disabled={isSaving}
        >
          全設定をリセット
        </button>
      </div>
    </div>
  );
}; 