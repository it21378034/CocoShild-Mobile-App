#!/usr/bin/env python3
"""
Setup script for Coconut Diseases Backend
This script helps you find your IP address and start the backend server
"""

import socket
import subprocess
import sys
import os
from pathlib import Path

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn', 
        'tensorflow',
        'numpy',
        'python-multipart',
        'pandas'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def update_mobile_config(ip_address):
    """Update the mobile app configuration with the correct IP address"""
    config_file = Path("mobile/config/api.ts")
    if config_file.exists():
        content = config_file.read_text()
        # Replace the IP address in the config
        new_content = content.replace(
            "export const API_BASE_URL = 'http://192.168.121.73:8000';",
            f"export const API_BASE_URL = 'http://{ip_address}:8000';"
        )
        config_file.write_text(new_content)
        print(f"✅ Updated mobile config with IP: {ip_address}")
    else:
        print("⚠️  Mobile config file not found")

def main():
    print("🌴 Coconut Diseases Backend Setup")
    print("=" * 40)
    
    # Get local IP address
    local_ip = get_local_ip()
    print(f"📍 Your local IP address: {local_ip}")
    
    # Check dependencies
    print("\n📦 Checking dependencies...")
    missing = check_dependencies()
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        install_choice = input("Install missing dependencies? (y/n): ").lower()
        if install_choice == 'y':
            if not install_dependencies():
                print("❌ Failed to install dependencies. Please install manually:")
                print("pip install -r backend/requirements.txt")
                return
        else:
            print("❌ Please install dependencies manually before continuing")
            return
    else:
        print("✅ All dependencies are installed!")
    
    # Update mobile config
    print(f"\n📱 Updating mobile app configuration...")
    update_mobile_config(local_ip)
    
    # Instructions
    print(f"\n🚀 Ready to start the backend server!")
    print(f"📋 Next steps:")
    print(f"   1. Make sure your mobile device is on the same WiFi network")
    print(f"   2. Run: cd backend && python main.py")
    print(f"   3. The server will start at: http://{local_ip}:8000")
    print(f"   4. Test the connection: http://{local_ip}:8000/test")
    print(f"   5. Start your mobile app and try the treatment screen")
    
    # Ask if user wants to start the server now
    start_server = input("\nStart the backend server now? (y/n): ").lower()
    if start_server == 'y':
        print(f"\n🚀 Starting backend server at http://{local_ip}:8000")
        print("Press Ctrl+C to stop the server")
        try:
            os.chdir("backend")
            subprocess.run([sys.executable, "main.py"])
        except KeyboardInterrupt:
            print("\n👋 Server stopped")
        except Exception as e:
            print(f"❌ Failed to start server: {e}")

if __name__ == "__main__":
    main() 