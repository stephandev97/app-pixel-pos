@echo off
:: PixelPOS - Apertura de puerto 8085 para sincronizacion LAN
title PixelPOS - Habilitar Firewall LAN

:: Verificar elevacion de administrador
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Solicitando permisos de administrador...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
echo ========================================================
echo  Configurando Windows Firewall para PixelPOS LAN (Puerto 8085)
echo ========================================================
echo.
netsh advfirewall firewall delete rule name="PixelPOS LAN Sync" >nul 2>&1
netsh advfirewall firewall add rule name="PixelPOS LAN Sync" dir=in action=allow protocol=TCP localport=8085 profile=any
powershell -NoProfile -Command "Get-NetConnectionProfile | Where-Object { $_.IPv4Connectivity -eq 'Internet' } | Set-NetConnectionProfile -NetworkCategory Private -ErrorAction SilentlyContinue"
echo.
echo ========================================================
echo  LISTO! PUERTO 8085 HABILITADO EN EL FIREWALL DE WINDOWS
echo ========================================================
echo.
echo La IP local de esta PC de Caja para poner en la Tablet es:
powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet -ErrorAction SilentlyContinue).IPAddress"
echo.
echo Puedes cerrar esta ventana y volver a PixelPOS.
pause
