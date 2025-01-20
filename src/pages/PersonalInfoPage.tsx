import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/useAuth';
import { handleError, validateInput, fetchWithErrorHandling } from '../utils/errorHandler';
import { toast } from 'react-toastify';

interface PersonalInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female' | 'other';
  zodiacSign: string;
  profileImage?: string;
}

const ZODIAC_SIGNS = [
  { value: 'aries', label: '牡羊座' },
  { value: 'taurus', label: '牡牛座' },
  { value: 'gemini', label: '双子座' },
  { value: 'cancer', label: '蟹座' },
  { value: 'leo', label: '獅子座' },
  { value: 'virgo', label: '乙女座' },
  { value: 'libra', label: '天秤座' },
  { value: 'scorpio', label: '蠍座' },
  { value: 'sagittarius', label: '射手座' },
  { value: 'capricorn', label: '山羊座' },
  { value: 'aquarius', label: '水瓶座' },
  { value: 'pisces', label: '魚座' }
];

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: 'male' as const,
    zodiacSign: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/personal-info' } });
      return;
    }

    const fetchPersonalInfo = async () => {
      try {
        const data = await fetchWithErrorHandling<PersonalInfo>('/api/user/personal-info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const formattedData = {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : ''
        };
        setPersonalInfo(formattedData);
        if (data.profileImage) {
          setImagePreview(data.profileImage);
        }
      } catch (error) {
        if (error instanceof Response && error.status === 401) {
          navigate('/login', { state: { from: '/personal-info' } });
          return;
        }
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalInfo();
  }, [navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // 画像をリサイズ
        const resizedImage = await resizeImage(file, 800); // 最大幅800pxにリサイズ
        setImagePreview(resizedImage);
        setPersonalInfo(prev => ({
          ...prev,
          profileImage: resizedImage
        }));
      } catch (err) {
        console.error('画像のアップロードに失敗しました:', err);
        setErrors({ image: err instanceof Error ? err.message : '画像のアップロードに失敗しました' });
      }
    }
  };

  // 画像リサイズ関数
  const resizeImage = (file: File, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // JPEG形式で圧縮率0.7
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました'));
        URL.revokeObjectURL(img.src);
      };
    });
  };

  const calculateZodiacSign = (birthDate: string) => {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 誕生日から星座を計算
    const zodiacRanges = [
      { sign: 'capricorn', start: [1, 1], end: [1, 19] },
      { sign: 'aquarius', start: [1, 20], end: [2, 18] },
      { sign: 'pisces', start: [2, 19], end: [3, 20] },
      { sign: 'aries', start: [3, 21], end: [4, 19] },
      { sign: 'taurus', start: [4, 20], end: [5, 20] },
      { sign: 'gemini', start: [5, 21], end: [6, 20] },
      { sign: 'cancer', start: [6, 21], end: [7, 22] },
      { sign: 'leo', start: [7, 23], end: [8, 22] },
      { sign: 'virgo', start: [8, 23], end: [9, 22] },
      { sign: 'libra', start: [9, 23], end: [10, 22] },
      { sign: 'scorpio', start: [10, 23], end: [11, 21] },
      { sign: 'sagittarius', start: [11, 22], end: [12, 21] },
      { sign: 'capricorn', start: [12, 22], end: [12, 31] }
    ];

    const zodiacSign = zodiacRanges.find(range => {
      const [startMonth, startDay] = range.start;
      const [endMonth, endDay] = range.end;
      
      if (startMonth === month && day >= startDay) return true;
      if (endMonth === month && day <= endDay) return true;
      return false;
    });

    return zodiacSign?.sign || 'capricorn';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'birthDate') {
      const zodiacSign = calculateZodiacSign(value);
      setPersonalInfo(prev => ({
        ...prev,
        [name]: value,
        zodiacSign
      }));
    } else {
      setPersonalInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    const nameError = validateInput(personalInfo.name, 'name');
    if (nameError) newErrors.name = nameError;

    const dateError = validateInput(personalInfo.birthDate, 'date');
    if (dateError) newErrors.birthDate = dateError;

    if (!personalInfo.gender) {
      newErrors.gender = '性別を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('入力内容に誤りがあります');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetchWithErrorHandling('/api/user/personal-info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: personalInfo.name,
          birthDate: personalInfo.birthDate,
          birthTime: personalInfo.birthTime || null,
          gender: personalInfo.gender,
          zodiacSign: personalInfo.zodiacSign,
          profileImage: imagePreview
        })
      });

      toast.success('プロフィール情報を更新しました');
      setSuccess(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="text-purple-200">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-purple-800/50 rounded-xl p-6 sm:p-8"
      >
        <h1 className="text-3xl font-bold text-purple-100 mb-8 text-center">プロフィール設定</h1>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="profile-form">
          {/* プロフィール画像アップロード */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-full overflow-hidden bg-purple-700 border-2 border-purple-400">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="プロフィール"
                    className="w-full h-full object-cover"
                    data-testid="profile-image"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-300">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-500 transition-colors"
                data-testid="image-upload-button"
              >
                <input
                  type="file"
                  id="profile-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  data-testid="image-input"
                />
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </label>
            </div>
          </div>

          {/* 名前入力 */}
          <div>
            <label htmlFor="name" className="block text-purple-200 mb-2">
              名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={personalInfo.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-purple-700/50 rounded-lg text-purple-100 placeholder-purple-400 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="あなたの名前"
              data-testid="name-input"
            />
            {errors.name && (
              <p className="mt-1 text-red-400 text-sm" data-testid="name-error">
                {errors.name}
              </p>
            )}
          </div>

          {/* 生年月日入力 */}
          <div>
            <label htmlFor="birthDate" className="block text-purple-200 mb-2">
              生年月日
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={personalInfo.birthDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-purple-700/50 rounded-lg text-purple-100 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              data-testid="birthDate-input"
            />
            {errors.birthDate && (
              <p className="mt-1 text-red-400 text-sm" data-testid="birthDate-error">
                {errors.birthDate}
              </p>
            )}
          </div>

          {/* 生まれた時間入力 */}
          <div>
            <label htmlFor="birthTime" className="block text-purple-200 mb-2">
              生まれた時間（任意）
            </label>
            <input
              type="time"
              id="birthTime"
              name="birthTime"
              value={personalInfo.birthTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-purple-700/50 rounded-lg text-purple-100 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              data-testid="birthTime-input"
            />
          </div>

          {/* 性別選択 */}
          <div className="relative z-10">
            <label className="block text-purple-200 mb-2">性別</label>
            <div className="flex space-x-4">
              {['male', 'female', 'other'].map((gender) => (
                <label
                  key={gender}
                  className="relative flex items-center cursor-pointer"
                  data-testid={`gender-${gender}-label`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={personalInfo.gender === gender}
                    onChange={handleInputChange}
                    className="sr-only"
                    data-testid={`gender-${gender}-input`}
                  />
                  <div className="w-4 h-4 border-2 border-purple-400 rounded-full mr-2 flex items-center justify-center">
                    {personalInfo.gender === gender && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    )}
                  </div>
                  <span className="text-purple-200">
                    {gender === 'male' ? '男性' : gender === 'female' ? '女性' : 'その他'}
                  </span>
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="mt-1 text-red-400 text-sm" data-testid="gender-error">
                {errors.gender}
              </p>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => navigate('/fortune')}
              className="px-6 py-2 bg-purple-700/50 text-purple-200 rounded-lg hover:bg-purple-600/50 transition-colors"
              data-testid="skip-button"
            >
              スキップ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="save-button"
            >
              {isSaving ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>

        {/* 成功メッセージ */}
        {success && (
          <div
            className="mt-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg"
            data-testid="success-message"
          >
            <p className="text-green-400 text-center">プロフィール情報を更新しました</p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 