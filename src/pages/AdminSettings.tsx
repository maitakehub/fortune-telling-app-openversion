import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  features: {
    tarot: boolean;
    astrology: boolean;
    numerology: boolean;
    palmistry: boolean;
    dream: boolean;
    animal: boolean;
    fourPillars: boolean;
  };
  subscription: {
    trial: {
      enabled: boolean;
      durationDays: number;
    };
    prices: {
      basic: number;
      premium: number;
    };
  };
  notifications: {
    enabled: boolean;
    types: {
      email: boolean;
      push: boolean;
    };
  };
}

const defaultSettings: SystemSettings = {
  maintenance: {
    enabled: false,
    message: 'システムメンテナンス中です。ご不便をおかけして申し訳ありません。',
  },
  features: {
    tarot: true,
    astrology: true,
    numerology: true,
    palmistry: true,
    dream: true,
    animal: true,
    fourPillars: true,
  },
  subscription: {
    trial: {
      enabled: true,
      durationDays: 7,
    },
    prices: {
      basic: 4980,
      premium: 9800,
    },
  },
  notifications: {
    enabled: true,
    types: {
      email: true,
      push: false,
    },
  },
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: 実際のAPIエンドポイントで設定を保存
      // await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });
      await new Promise(resolve => setTimeout(resolve, 1000)); // 保存の模擬
      alert('設定を保存しました。');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('設定の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('設定をデフォルトに戻してもよろしいですか？')) {
      setSettings(defaultSettings);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8 lg:mb-12">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 text-purple-100 text-sm sm:text-base rounded-lg hover:bg-purple-800 transition-colors"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
            ダッシュボードに戻る
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200">
            システム設定
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* メンテナンスモード */}
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">
              メンテナンスモード
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="maintenance-enabled"
                  checked={settings.maintenance.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenance: {
                        ...settings.maintenance,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 bg-purple-800 border-purple-700 rounded"
                />
                <label
                  htmlFor="maintenance-enabled"
                  className="text-sm sm:text-base text-purple-200"
                >
                  メンテナンスモードを有効にする
                </label>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-purple-200 mb-1">
                  メンテナンスメッセージ
                </label>
                <textarea
                  value={settings.maintenance.message}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenance: {
                        ...settings.maintenance,
                        message: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 border border-purple-700 rounded-lg text-sm sm:text-base text-purple-100 placeholder-purple-400"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 機能の有効/無効 */}
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">
              機能の有効/無効
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`feature-${key}`}
                    checked={value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        features: {
                          ...settings.features,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 bg-purple-800 border-purple-700 rounded"
                  />
                  <label
                    htmlFor={`feature-${key}`}
                    className="text-sm sm:text-base text-purple-200"
                  >
                    {key === 'tarot' && 'タロット占い'}
                    {key === 'astrology' && '星占い'}
                    {key === 'numerology' && '数秘術'}
                    {key === 'palmistry' && '手相占い'}
                    {key === 'dream' && '夢占い'}
                    {key === 'animal' && '動物占い'}
                    {key === 'fourPillars' && '四柱推命'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* サブスクリプション設定 */}
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">
              サブスクリプション設定
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="trial-enabled"
                    checked={settings.subscription.trial.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        subscription: {
                          ...settings.subscription,
                          trial: {
                            ...settings.subscription.trial,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 bg-purple-800 border-purple-700 rounded"
                  />
                  <label
                    htmlFor="trial-enabled"
                    className="text-sm sm:text-base text-purple-200"
                  >
                    無料トライアルを有効にする
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settings.subscription.trial.durationDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        subscription: {
                          ...settings.subscription,
                          trial: {
                            ...settings.subscription.trial,
                            durationDays: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-20 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-800/50 border border-purple-700 rounded text-sm sm:text-base text-purple-100"
                    min={1}
                    max={30}
                  />
                  <span className="text-sm sm:text-base text-purple-200">日間</span>
                </div>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-purple-200 mb-1">
                  ベーシックプラン料金
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base text-purple-200">¥</span>
                  <input
                    type="number"
                    value={settings.subscription.prices.basic}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        subscription: {
                          ...settings.subscription,
                          prices: {
                            ...settings.subscription.prices,
                            basic: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-32 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-800/50 border border-purple-700 rounded text-sm sm:text-base text-purple-100"
                    min={0}
                    step={100}
                  />
                  <span className="text-sm sm:text-base text-purple-200">/月</span>
                </div>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-purple-200 mb-1">
                  プレミアムプラン料金
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base text-purple-200">¥</span>
                  <input
                    type="number"
                    value={settings.subscription.prices.premium}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        subscription: {
                          ...settings.subscription,
                          prices: {
                            ...settings.subscription.prices,
                            premium: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-32 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-800/50 border border-purple-700 rounded text-sm sm:text-base text-purple-100"
                    min={0}
                    step={100}
                  />
                  <span className="text-sm sm:text-base text-purple-200">/月</span>
                </div>
              </div>
            </div>
          </div>

          {/* 通知設定 */}
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">
              通知設定
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifications-enabled"
                  checked={settings.notifications.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 bg-purple-800 border-purple-700 rounded"
                />
                <label
                  htmlFor="notifications-enabled"
                  className="text-sm sm:text-base text-purple-200"
                >
                  通知を有効にする
                </label>
              </div>
              {settings.notifications.enabled && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notifications-email"
                      checked={settings.notifications.types.email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            types: {
                              ...settings.notifications.types,
                              email: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-4 h-4 bg-purple-800 border-purple-700 rounded"
                    />
                    <label
                      htmlFor="notifications-email"
                      className="text-sm sm:text-base text-purple-200"
                    >
                      メール通知
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notifications-push"
                      checked={settings.notifications.types.push}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            types: {
                              ...settings.notifications.types,
                              push: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-4 h-4 bg-purple-800 border-purple-700 rounded"
                    />
                    <label
                      htmlFor="notifications-push"
                      className="text-sm sm:text-base text-purple-200"
                    >
                      プッシュ通知
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white text-sm sm:text-base rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={16} className="sm:w-5 sm:h-5" />
            デフォルトに戻す
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white text-sm sm:text-base rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} className="sm:w-5 sm:h-5" />
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
} 