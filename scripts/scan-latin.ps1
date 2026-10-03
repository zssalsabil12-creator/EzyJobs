param([string]$Path = "project\src\content\guides.ts")
$txt = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
$lines = $txt -split "`n"
$pattern = '[A-Za-z][A-Za-z''\-]{1,}'
for ($i = 0; $i -lt $lines.Count; $i++) {
  $l = $lines[$i]
  if ($l -notmatch '[\u0600-\u06FF]') { continue }
  $clean = [regex]::Replace($l, '[\u0600-\u06FF]+', '|')
  $runs = [regex]::Matches($clean, $pattern)
  if ($runs.Count -eq 0) { continue }
  $r = ($runs | ForEach-Object { $_.Value }) -join ', '
  "L$($i + 1)  >> $r"
}
