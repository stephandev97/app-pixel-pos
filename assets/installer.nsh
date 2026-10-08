!macro customInit
  nsExec::Exec 'taskkill /F /IM "pixel-pos2.exe" /T'
  nsExec::Exec 'taskkill /F /IM "pixel-pos.exe" /T'
  
  DeleteRegValue HKCU "${UNINSTALL_REGISTRY_KEY}" "UninstallString"
  DeleteRegValue HKLM "${UNINSTALL_REGISTRY_KEY}" "UninstallString"
  
  Sleep 300
!macroend

!macro customCheckAppRunning
  nsExec::Exec 'taskkill /F /IM "pixel-pos2.exe" /T'
  nsExec::Exec 'taskkill /F /IM "pixel-pos.exe" /T'
  Sleep 300
!macroend

!macro customInstall
  nsExec::Exec 'taskkill /F /IM "pixel-pos2.exe" /T'
  nsExec::Exec 'taskkill /F /IM "pixel-pos.exe" /T'
  Sleep 300
!macroend

!macro customUnInit
  nsExec::Exec 'taskkill /F /IM "pixel-pos2.exe" /T'
  nsExec::Exec 'taskkill /F /IM "pixel-pos.exe" /T'
  Sleep 300
!macroend

!macro customUnInstallCheck
  DetailPrint "Old uninstaller finished, continuing install..."
!macroend

!macro customUnInstallCheckCurrentUser
  DetailPrint "Old uninstaller finished, continuing install..."
!macroend




