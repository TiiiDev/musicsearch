$folderList = "Folders.txt"
$outJson    = "tracks.json"
$logFile    = "run.log"

chcp 65001 | Out-Null
[Console]::InputEncoding  = [Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$OutputEncoding = [Console]::OutputEncoding

[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
$OutputEncoding = [Console]::OutputEncoding

function Normalize-Text($s) {
  if (-not $s) { return "" }

  # 一旦 全角→半角
  $n = $s.Normalize([Text.NormalizationForm]::FormKC)

  # 半角チルダのみ変換（全角～にする）
  $n = $n -replace '~', '～'

  return $n.Trim()
}

function SecTo-MMSS($sec) {
  if (-not $sec) { return "00:00" }

  $total = [int][Math]::Round([double]$sec)
  $m = [int]($total / 60)
  $s = $total % 60

  return ('{0:00}:{1:00}' -f $m, $s)
}

"=== Run started: $(Get-Date) ===" |
  Out-File $logFile -Encoding UTF8

$roots = Get-Content $folderList |
  Where-Object { $_ -and (Test-Path $_) }

$files = foreach ($r in $roots) {
  Get-ChildItem -Path $r -Recurse -File |
    Where-Object { $_.Extension -in '.mp3', '.flac', '.m4a', '.wav' }
}

$result = foreach ($f in $files) {
  try {
    $raw = ffprobe -v quiet `
      -show_entries format=duration:format_tags=artist,title `
      -of json "$($f.FullName)"
    $rawText = $raw | Out-String
    $json    = $rawText | ConvertFrom-Json


    $tags = $json.format.tags
    $durationSec = [double]$json.format.duration
    $duration    = SecTo-MMSS $durationSec


    $artist = $tags.artist
    $title  = $tags.title

    $invalidArtist = -not $artist -or $artist -match '^アーティスト'
    $invalidTitle  = -not $title  -or $title  -match '^トラック'

    if ($invalidArtist) {
      $artist = $f.Directory.Parent.Name
    }

    if ($invalidTitle) {
      $title = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    }

    $artist = Normalize-Text $artist
    $title  = Normalize-Text $title

    $msg = "[OK] $($f.FullName) | $artist - $title ($duration)"
    $msg | Out-File $logFile -Append -Encoding UTF8

    [PSCustomObject]@{
      a = $artist
      t = $title
      l = $duration
      p = $f.FullName   # パスは一切正規化しない
    }

  } catch {
    $msg = "[NG] $($f.FullName) | $($_.Exception.Message)"
    Write-Host $msg
    $msg | Out-File $logFile -Append -Encoding UTF8
    $null
  }
}

# パス完全一致で重複排除
$result |
Where-Object { $_ } |
Group-Object p |
ForEach-Object { $_.Group[0] } |
ConvertTo-Json -Compress |
Out-File $outJson -Encoding UTF8

"[DONE] $(Get-Date)" |
  Out-File $logFile -Append -Encoding UTF8

# 変更日を記載したtxt作成

Get-Date -Format "yyyy/MM/dd HH:mm:ss" |
Out-File date.txt -Encoding ASCII
