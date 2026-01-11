@echo off
cd MakeList
powershell -ExecutionPolicy Bypass -File run.ps1
cd ..

if exist temp rd /s /q temp
mkdir temp

move MakeList\date.txt temp >nul
move MakeList\tracks.json temp >nul
move MakeList\run.log temp >nul
copy HTMLBase\*.* temp >nul

rem ===== date.txt から日付取得 =====
set datestr=
for /f "delims=" %%A in (temp\date.txt) do set datestr=%%A

rem YYYY/MM/DD HH:MM:SS → YYYYMMDD
set date2=%datestr:~0,4%%datestr:~5,2%%datestr:~8,2%

rem HH:MM:SS → HHMMSS
set time2=%datestr:~11,2%%datestr:~14,2%%datestr:~17,2%

echo Build date: %date2% %time2%

powershell compress-archive temp/* tmp.zip

ren tmp.zip 音源DB-%date2%%time2%.zip

pause
rd /s /q temp