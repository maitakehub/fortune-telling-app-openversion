import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

interface PersonalInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female' | 'other' | '';
  zodiacSign: string;
  profileImage?: string;
}

const zodiacSigns = [
  { value: 'aries', label: '牡羊座', period: '3/21-4/19' },
  { value: 'taurus', label: '牡牛座', period: '4/20-5/20' },
  { value: 'gemini', label: '双子座', period: '5/21-6/21' },
  { value: 'cancer', label: '蟹座', period: '6/22-7/22' },
  { value: 'leo', label: '獅子座', period: '7/23-8/22' },
  { value: 'virgo', label: '乙女座', period: '8/23-9/22' },
  { value: 'libra', label: '天秤座', period: '9/23-10/23' },
  { value: 'scorpio', label: '蠍座', period: '10/24-11/22' },
  { value: 'sagittarius', label: '射手座', period: '11/23-12/21' },
  { value: 'capricorn', label: '山羊座', period: '12/22-1/19' },
  { value: 'aquarius', label: '水瓶座', period: '1/20-2/18' },
  { value: 'pisces', label: '魚座', period: '2/19-3/20' }
];

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '',
    zodiacSign: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const fetchPersonalInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/user/personal-info', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPersonalInfo(response.data);
      if (response.data.profileImage) {
        setImagePreview(response.data.profileImage);
      }
    } catch (error) {
      console.error('個人情報の取得に失敗:', error);
      setError('個人情報の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const calculateZodiacSign = (birthDate: string) => {
    if (!birthDate) return '';

    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    for (const sign of zodiacSigns) {
      const [startMonth, startDay] = sign.period.split('-')[0].split('/').map(Number);
      const [endMonth, endDay] = sign.period.split('-')[1].split('/').map(Number);

      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return sign.value;
      }
    }

    return 'capricorn'; // デフォルトは山羊座
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const updatedInfo = {
        ...personalInfo,
        zodiacSign: calculateZodiacSign(personalInfo.birthDate),
        profileImage: imagePreview
      };

      await axios.put('/api/user/personal-info', updatedInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('個人情報を更新しました');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('個人情報の更新に失敗:', error);
      setError('個人情報の更新に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-purple-200">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
            プロフィール設定
          </h1>
          <button
            onClick={() => navigate('/fortune')}
            className="px-4 py-2 text-purple-200 hover:text-purple-100 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            戻る
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 md:p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-center">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* プロフィール画像 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-purple-700/30 border-2 border-purple-500/30">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="プロフィール"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-purple-300 text-sm">
                クリックして画像をアップロード
              </p>
            </div>

            {/* 名前 */}
            <div>
              <label htmlFor="name" className="block text-purple-200 mb-2">
                名前
              </label>
              <input
                type="text"
                id="name"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                className="w-full px-4 py-2 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* 生年月日 */}
            <div>
              <label htmlFor="birthDate" className="block text-purple-200 mb-2">
                生年月日
              </label>
              <input
                type="date"
                id="birthDate"
                value={personalInfo.birthDate}
                onChange={(e) => setPersonalInfo({ ...personalInfo, birthDate: e.target.value })}
                className="w-full px-4 py-2 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* 生まれた時間 */}
            <div>
              <label htmlFor="birthTime" className="block text-purple-200 mb-2">
                生まれた時間（任意）
              </label>
              <input
                type="time"
                id="birthTime"
                value={personalInfo.birthTime}
                onChange={(e) => setPersonalInfo({ ...personalInfo, birthTime: e.target.value })}
                className="w-full px-4 py-2 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-purple-200 mb-2">
                性別（任意）
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setPersonalInfo({ ...personalInfo, gender })}
                    className={`py-2 px-4 rounded-lg transition-colors ${
                      personalInfo.gender === gender
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-900/30 text-purple-200 hover:bg-purple-800/30'
                    }`}
                  >
                    {gender === 'male' ? '男性' : gender === 'female' ? '女性' : 'その他'}
                  </button>
                ))}
              </div>
            </div>

            {/* 星座（自動計算、表示のみ） */}
            <div>
              <label className="block text-purple-200 mb-2">
                星座
              </label>
              <div className="px-4 py-2 bg-purple-900/30 border border-purple-700/30 rounded-lg text-purple-200">
                {personalInfo.birthDate
                  ? zodiacSigns.find(sign => sign.value === calculateZodiacSign(personalInfo.birthDate))?.label || '計算中...'
                  : '生年月日を入力してください'}
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 bg-purple-600 text-white rounded-lg transition-colors ${
                  saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
                }`}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 