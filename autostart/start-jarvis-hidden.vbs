Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)
startScript = fso.BuildPath(fso.BuildPath(projectDir, "scripts"), "start-backend.ps1")
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & startScript & """"

shell.Run command, 0, False
