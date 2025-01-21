import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Stars, Moon } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = '占い中...' }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-purple-900/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative text-center max-w-md mx-auto px-6">
        {/* 装飾的な背景エフェクト */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 text-purple-300/20"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Stars size={40} />
          </motion.div>
          <motion.div
            className="absolute bottom-0 right-1/4 text-purple-300/20"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Moon size={40} />
          </motion.div>
        </div>

        {/* メインのローディングアニメーション */}
        <div className="relative">
          <motion.div
            className="w-24 h-24 mx-auto mb-8 relative"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-purple-400/30" />
            <motion.div
              className="absolute inset-0 rounded-full border-t-4 border-r-4 border-purple-200"
              animate={{
                rotate: [0, 180],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="text-purple-200" size={32} />
              </motion.div>
            </div>
          </motion.div>

          {/* メッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              {message}
            </h3>
            <p className="text-purple-300/80 text-sm">
              神秘の力があなたの運命を紡いでいます...
            </p>
          </motion.div>

          {/* 装飾的な光の効果 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent" />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 40%)",
                  "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 