#!/usr/bin/env python3
"""
Script de instalación automatizada para FileToMarkdown
Configura el entorno Python y Node.js automáticamente
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_step(message):
    """Imprimir un paso de la instalación"""
    print(f"\n🔧 {message}")
    print("-" * 50)

def run_command(command, cwd=None, check=True):
    """Ejecutar un comando del sistema"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            check=check,
            capture_output=True,
            text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando: {command}")
        print(f"   {e.stderr}")
        return None

def check_python_version():
    """Verificar versión de Python"""
    print_step("Verificando versión de Python")
    
    if sys.version_info < (3, 8):
        print("❌ Error: Se requiere Python 3.8 o superior")
        print(f"   Versión actual: {sys.version}")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detectado")
    return True

def check_node_version():
    """Verificar versión de Node.js"""
    print_step("Verificando versión de Node.js")
    
    result = run_command("node --version", check=False)
    if result is None or result.returncode != 0:
        print("❌ Error: Node.js no está instalado")
        print("   Instala Node.js desde: https://nodejs.org/")
        return False
    
    version = result.stdout.strip()
    print(f"✅ Node.js {version} detectado")
    
    # Verificar npm
    result = run_command("npm --version", check=False)
    if result is None or result.returncode != 0:
        print("❌ Error: npm no está disponible")
        return False
    
    npm_version = result.stdout.strip()
    print(f"✅ npm {npm_version} detectado")
    return True

def setup_python_environment():
    """Configurar entorno Python"""
    print_step("Configurando entorno Python")
    
    # Crear entorno virtual
    if not Path("venv").exists():
        print("📦 Creando entorno virtual...")
        result = run_command("python -m venv venv")
        if result is None:
            return False
        print("✅ Entorno virtual creado")
    else:
        print("✅ Entorno virtual ya existe")
    
    # Activar entorno virtual y instalar dependencias
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate && pip install -r requirements.txt"
    else:  # Unix/Linux/macOS
        activate_cmd = "source venv/bin/activate && pip install -r requirements.txt"
    
    print("📦 Instalando dependencias de Python...")
    result = run_command(activate_cmd)
    if result is None:
        return False
    
    print("✅ Dependencias de Python instaladas")
    return True

def setup_node_environment():
    """Configurar entorno Node.js"""
    print_step("Configurando entorno Node.js")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Error: Directorio frontend no encontrado")
        return False
    
    # Instalar dependencias de Node.js
    print("📦 Instalando dependencias de Node.js...")
    result = run_command("npm install", cwd=frontend_dir)
    if result is None:
        return False
    
    print("✅ Dependencias de Node.js instaladas")
    return True

def setup_environment_file():
    """Configurar archivo de entorno"""
    print_step("Configurando archivo de entorno")
    
    env_file = Path(".env")
    env_example = Path("env_example.txt")
    
    if env_file.exists():
        print("✅ Archivo .env ya existe")
        return True
    
    if not env_example.exists():
        print("❌ Error: archivo env_example.txt no encontrado")
        return False
    
    # Copiar archivo de ejemplo
    shutil.copy(env_example, env_file)
    print("✅ Archivo .env creado desde env_example.txt")
    print("⚠️  IMPORTANTE: Edita .env y configura tu API key de LlamaCloud")
    
    return True

def create_directories():
    """Crear directorios necesarios"""
    print_step("Creando directorios necesarios")
    
    directories = ["InputFiles", "OutputFiles"]
    for dir_name in directories:
        Path(dir_name).mkdir(exist_ok=True)
        print(f"✅ Directorio {dir_name} verificado")
    
    return True

def run_tests():
    """Ejecutar tests básicos"""
    print_step("Ejecutando tests básicos")
    
    # Test del backend
    print("🧪 Probando backend...")
    result = run_command("python -c \"import flask, dotenv\"", check=False)
    if result is None or result.returncode != 0:
        print("❌ Error: Dependencias del backend no están disponibles")
        return False
    
    print("✅ Backend: Dependencias verificadas")
    
    # Test del frontend
    print("🧪 Probando frontend...")
    frontend_dir = Path("frontend")
    if frontend_dir.exists():
        result = run_command("npm list react", cwd=frontend_dir, check=False)
        if result is None or result.returncode != 0:
            print("❌ Error: Dependencias del frontend no están disponibles")
            return False
        
        print("✅ Frontend: Dependencias verificadas")
    
    return True

def show_next_steps():
    """Mostrar próximos pasos"""
    print_step("Instalación Completada")
    
    print("🎉 ¡FileToMarkdown ha sido instalado exitosamente!")
    print("\n📋 Próximos pasos:")
    print("1. Edita el archivo .env y configura tu API key de LlamaCloud")
    print("2. Ejecuta 'python start_app.py' para iniciar la aplicación")
    print("3. Abre http://localhost:3000 en tu navegador")
    print("\n🔧 Comandos útiles:")
    print("   Iniciar aplicación completa: python start_app.py")
    print("   Solo backend: python app.py")
    print("   Solo frontend: cd frontend && npm start")
    print("\n📚 Documentación:")
    print("   README.md - Documentación principal")
    print("   frontend/README.md - Documentación del frontend")
    print("\n💡 ¿Necesitas ayuda? Revisa la documentación o crea un issue")

def main():
    """Función principal de instalación"""
    print("🚀 FileToMarkdown - Instalador Automatizado")
    print("=" * 60)
    
    # Verificar requisitos del sistema
    if not check_python_version():
        sys.exit(1)
    
    if not check_node_version():
        sys.exit(1)
    
    # Configurar entornos
    if not setup_python_environment():
        print("❌ Error configurando entorno Python")
        sys.exit(1)
    
    if not setup_node_environment():
        print("❌ Error configurando entorno Node.js")
        sys.exit(1)
    
    # Configurar archivos y directorios
    if not setup_environment_file():
        print("❌ Error configurando archivo de entorno")
        sys.exit(1)
    
    if not create_directories():
        print("❌ Error creando directorios")
        sys.exit(1)
    
    # Ejecutar tests
    if not run_tests():
        print("❌ Error en los tests")
        sys.exit(1)
    
    # Mostrar próximos pasos
    show_next_steps()

if __name__ == "__main__":
    main()
