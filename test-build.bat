@echo off
echo Building Next.js application...
npm run build > build.log 2>&1
if %errorlevel% equ 0 (
    echo ✅ Build SUCCESS!
    type build.log | findstr /V "INFO:"
) else (
    echo ❌ Build FAILED!
    type build.log
)
echo.
echo Build log saved to build.log 