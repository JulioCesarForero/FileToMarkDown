#!/usr/bin/env python3
"""
Script de inicio para FileToMarkdown
Lanza tanto el backend Flask como el frontend React
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

def check_dependencies():
    """Verificar que las dependencias estén instaladas"""
    print("🔍 Verificando dependencias...")
    
    # Verificar Python
    if sys.version_info < (3, 8):
        print("❌ Error: Se requiere Python 3.8 o superior")
        return False
    
    # Verificar archivo .env
    if not Path(".env").exists():
        print("⚠️  Advertencia: Archivo .env no encontrado")
        print("   Copia env_example.txt a .env y configura tu API key")
        return False
    
    # Verificar directorios
    required_dirs = ["InputFiles", "OutputFiles"]
    for dir_name in required_dirs:
        Path(dir_name).mkdir(exist_ok=True)
        print(f"✅ Directorio {dir_name} verificado")
    
    return True

def start_backend():
    """Iniciar el servidor Flask"""
    print("🚀 Iniciando backend Flask...")
    
    try:
        # Verificar que app.py existe
        if not Path("app.py").exists():
            print("❌ Error: app.py no encontrado")
            return None
        
        # Iniciar Flask
        process = subprocess.Popen([
            sys.executable, "app.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Esperar un momento para que Flask inicie
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Backend Flask iniciado en http://localhost:5000")
            return process
        else:
            print("❌ Error al iniciar Flask")
            return None
            
    except Exception as e:
        print(f"❌ Error iniciando backend: {e}")
        return None

def start_frontend():
    """Iniciar el frontend React"""
    print("🌐 Iniciando frontend React...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Error: Directorio frontend no encontrado")
        return None
    
    try:
        # Verificar si Yarn está disponible, sino usar npm
        use_yarn = True
        try:
            subprocess.run(["yarn", "--version"], 
                         check=True, capture_output=True)
            print("✅ Yarn encontrado (recomendado)")
        except (subprocess.CalledProcessError, FileNotFoundError):
            use_yarn = False
            print("⚠️  Yarn no encontrado, usando npm")
        
        # Verificar que node_modules existe
        if not (frontend_dir / "node_modules").exists():
            print("📦 Instalando dependencias de Node.js...")
            if use_yarn:
                subprocess.run(["yarn", "install"], cwd=frontend_dir, check=True)
            else:
                subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
        
        # Iniciar React con Vite
        if use_yarn:
            process = subprocess.Popen([
                "yarn", "dev"
            ], cwd=frontend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        else:
            process = subprocess.Popen([
                "npm", "run", "dev"
            ], cwd=frontend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Esperar un momento para que Vite inicie
        time.sleep(5)
        
        if process.poll() is None:
            print("✅ Frontend React iniciado en http://localhost:5173")
            return process
        else:
            print("❌ Error al iniciar React")
            return None
            
    except Exception as e:
        print(f"❌ Error iniciando frontend: {e}")
        return None

def main():
    """Función principal"""
    print("🎯 FileToMarkdown - Iniciando aplicación...")
    print("=" * 50)
    
    # Verificar dependencias
    if not check_dependencies():
        print("\n❌ No se pueden verificar las dependencias. Saliendo...")
        sys.exit(1)
    
    processes = []
    
    try:
        # Iniciar backend
        backend_process = start_backend()
        if backend_process:
            processes.append(("Backend Flask", backend_process))
        else:
            print("❌ No se pudo iniciar el backend. Saliendo...")
            sys.exit(1)
        
        # Iniciar frontend
        frontend_process = start_frontend()
        if frontend_process:
            processes.append(("Frontend React", frontend_process))
        else:
            print("⚠️  No se pudo iniciar el frontend")
        
        print("\n🎉 Aplicación iniciada exitosamente!")
        print("=" * 50)
        print("📱 Frontend (React + Vite): http://localhost:5173")
        print("🔧 Backend (Flask):        http://localhost:5000")
        print("📁 API Docs:               http://localhost:5000/api/health")
        print("\n💡 Presiona Ctrl+C para detener la aplicación")
        
        # Mantener la aplicación ejecutándose
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Deteniendo aplicación...")
            
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        
    finally:
        # Detener todos los procesos
        print("🔄 Deteniendo procesos...")
        for name, process in processes:
            try:
                print(f"   Deteniendo {name}...")
                process.terminate()
                process.wait(timeout=5)
                print(f"   ✅ {name} detenido")
            except subprocess.TimeoutExpired:
                print(f"   ⚠️  {name} no se detuvo, forzando...")
                process.kill()
            except Exception as e:
                print(f"   ❌ Error deteniendo {name}: {e}")
        
        print("👋 Aplicación detenida")

if __name__ == "__main__":
    main()
