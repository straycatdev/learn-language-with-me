# Optional local installer. Run in an administrator PowerShell window.
# Uses official Windows capabilities, never third-party voice downloads.
# Does not change the display language or remove existing language features.
#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
try {
    foreach ($name in @('Language.Basic~~~zh-TW~0.0.1.0', 'Language.TextToSpeech~~~zh-TW~0.0.1.0')) {
        $capability = Get-WindowsCapability -Online -Name $name
        if (-not $capability) { throw "This Windows version does not list $name. Use Settings > Time & Language > Speech > Add voices instead." }
        if ($capability.State -eq 'Installed') {
            Write-Output "Already installed: $name"
        } else {
            Write-Output "Downloading from Windows Update: $name (this may take several minutes)"
            $result = Add-WindowsCapability -Online -Name $name
            Write-Output "Installed: $name. Restart required: $($result.RestartNeeded)"
        }
    }
    Write-Output 'Fully close and reopen your browser. In Formosa, open Set up Chinese audio > Check voices again.'
    Write-Output 'Choose a Taiwan Mandarin (zh-TW) voice and test playback. Browser voice availability can vary.'
} catch {
    Write-Error "Voice installation did not complete: $($_.Exception.Message) Check internet/Windows Update access or ask your administrator. You can also use Windows Speech settings."
    exit 1
}