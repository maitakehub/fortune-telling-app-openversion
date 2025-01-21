import subprocess
import time
import requests
import os
import signal
import sys
import logging
from typing import Optional
from pathlib import Path

# ロギングの設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app_starter.log'),
        logging.StreamHandler()
    ]
)

class AppStarter:
    def __init__(self):
        self.frontend_process: Optional[subprocess.Popen] = None
        self.backend_process: Optional[subprocess.Popen] = None
        self.workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.max_retries = 3
        self.retry_interval = 5
        self.frontend_port = 5173
        self.backend_port = 3000

    def check_node_environment(self):
        """Node.js環境のチェック"""
        try:
            # Node.jsとnpmのバージョン確認
            node_version = subprocess.run(["node", "--version"], shell=True, capture_output=True, text=True).stdout.strip()
            npm_version = subprocess.run(["npm", "--version"], shell=True, capture_output=True, text=True).stdout.strip()
            logging.info(f"Node.js version: {node_version}")
            logging.info(f"npm version: {npm_version}")
            return True
        except Exception as e:
            logging.error(f"Node.js environment check failed: {e}")
            return False

    def install_dependencies(self):
        """依存関係のインストール"""
        try:
            # フロントエンドの依存関係
            os.chdir(self.workspace_root)
            logging.info("Installing frontend dependencies...")
            subprocess.run(["npm", "install"], shell=True, check=True)

            # バックエンドの依存関係
            os.chdir(os.path.join(self.workspace_root, "server"))
            logging.info("Installing backend dependencies...")
            subprocess.run(["npm", "install"], shell=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            logging.error(f"Failed to install dependencies: {e}")
            return False
        finally:
            os.chdir(self.workspace_root)

    def kill_process_on_port(self, port):
        """指定されたポートのプロセスを終了"""
        try:
            if port == self.frontend_port:
                print(f"Killing process on frontend port {self.frontend_port}")
            elif port == self.backend_port:
                print(f"Killing process on backend port {self.backend_port}")
        except Exception as e:
            logging.warning(f"Failed to kill process on port {port}: {e}")

    def start_backend(self):
        """バックエンドを起動"""
        try:
            # バックエンドのディレクトリに移動
            backend_dir = os.path.join(self.workspace_root, "server")
            os.chdir(backend_dir)
            logging.info(f"Starting backend in directory: {backend_dir}")
            
            # バックエンドのプロセスを開始
            logging.info("Starting backend process...")
            self.backend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # 起動を待機
            logging.info("Waiting for backend to start...")
            for i in range(30):  # 30秒タイムアウト
                # プロセスの出力を確認
                while True:
                    output = self.backend_process.stdout.readline()
                    if output == '' and self.backend_process.poll() is not None:
                        break
                    if output:
                        logging.info(f"Backend output: {output.strip()}")
                        if "Server listening on port" in output:
                            # サーバーが起動したことを確認
                            time.sleep(2)  # 少し待機してヘルスチェック
                            try:
                                response = requests.get("http://localhost:3000/api/health")
                                if response.status_code == 200:
                                    logging.info("Backend started successfully")
                                    return True
                            except requests.exceptions.ConnectionError:
                                pass

                # プロセスが終了していないか確認
                if self.backend_process.poll() is not None:
                    stdout, stderr = self.backend_process.communicate()
                    logging.error(f"Backend process terminated. Exit code: {self.backend_process.returncode}")
                    logging.error(f"stdout: {stdout}")
                    logging.error(f"stderr: {stderr}")
                    return False

                time.sleep(1)
                logging.info(f"Waiting for backend... ({i+1}/30)")
                
            # タイムアウト時の処理
            logging.error("Backend startup timed out")
            self.cleanup_backend()
            return False
            
        except Exception as e:
            logging.error(f"Failed to start backend: {str(e)}")
            self.cleanup_backend()
            return False
        finally:
            os.chdir(self.workspace_root)

    def cleanup_backend(self):
        """バックエンドのクリーンアップ"""
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            self.backend_process = None

    def start_frontend(self):
        try:
            # フロントエンドのディレクトリはプロジェクトルートと同じ
            frontend_dir = self.workspace_root
            os.chdir(frontend_dir)
            print(f"Starting frontend in directory: {frontend_dir}")
            
            # 既存のプロセスをクリーンアップ
            self.kill_process_on_port(self.frontend_port)
            
            # フロントエンドプロセスを開始
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # 起動確認
            for i in range(30):
                try:
                    response = requests.get("http://localhost:5173")
                    if response.status_code == 200:
                        print("Frontend started successfully")
                        return True
                except requests.exceptions.ConnectionError:
                    print(f"Waiting for frontend... ({i+1}/30)")
                    time.sleep(1)
            
            print("Frontend startup timed out")
            return False
            
        except Exception as e:
            print(f"Frontend startup error: {str(e)}")
            return False
            
        except Exception as e:
            print(f"Frontend startup error: {str(e)}")
            return False

    def cleanup(self):
        """全体のクリーンアップ"""
        self.cleanup_backend()
        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
            self.frontend_process = None

    def start(self):
        """アプリケーション全体を起動"""
        try:
            print("Starting application setup...")
            
            if not self.start_backend():
                print("Backend startup failed")
                return False
            
            print("Backend started successfully, starting frontend...")
            
            if not self.start_frontend():
                print("Frontend startup failed")
                return False
            
            print("Frontend started successfully")
            return True
            
        except Exception as e:
            print(f"Error in start(): {str(e)}")
            self.cleanup()
            return False

if __name__ == "__main__":
    starter = AppStarter()
    starter.start() 