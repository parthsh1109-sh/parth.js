Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
startScript = fso.BuildPath(fso.BuildPath(projectDir, "scripts"), "start-backend.ps1")

shell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & startScript & """", 0, True
shell.Run "http://localhost:3000/", 1, False
