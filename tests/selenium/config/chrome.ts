import { Options } from 'selenium-webdriver/chrome';

export const getChromeOptions = (): Options => {
  const options = new Options();
  
  // 基本設定
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files',
    '--allow-insecure-localhost',
    '--allow-running-insecure-content',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--enable-local-storage',
    '--allow-universal-access-from-files'
  ];

  options.addArguments(...args);

  // パフォーマンス最適化
  options.addArguments(
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-features=site-per-process',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-popup-blocking',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--disable-translate',
    '--metrics-recording-only',
    '--no-first-run',
    '--safebrowsing-disable-auto-update'
  );

  // メモリ使用量の最適化
  options.addArguments(
    '--js-flags=--max-old-space-size=4096',
    '--memory-pressure-off',
    '--force-gpu-mem-available-mb=4096'
  );

  return options;
}; 