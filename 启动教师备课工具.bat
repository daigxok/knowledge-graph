@echo off
chcp 65001 >nul
echo ========================================
echo   教师备课工具 - 本地服务器启动
echo ========================================
echo.
echo 正在启动本地服务器...
echo.
echo 启动后请在浏览器中访问：
echo http://localhost:8000/teacher-quick.html
echo.
echo 按 Ctrl+C 可停止服务器
echo ========================================
echo.

python -m http.server 8000

pause
