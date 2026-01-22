# MongoDB Atlas Support - Network Diagnostics (Windows PowerShell)
# Run this and share the output file with Ernest / MongoDB Support.
#
# Usage: .\run-network-diagnostics.ps1
# Or:    powershell -ExecutionPolicy Bypass -File .\run-network-diagnostics.ps1

$ErrorActionPreference = "Continue"
$clusterHostname = "yassline.v3oycnj.mongodb.net"
$nodeHostname   = "ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net"
$outFile        = "network-diagnostics-results.txt"
$fullPath       = Join-Path $PSScriptRoot $outFile

"========================================" | Tee-Object -FilePath $fullPath
"MongoDB Atlas - Network Diagnostics"     | Tee-Object -FilePath $fullPath -Append
"Run: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Tee-Object -FilePath $fullPath -Append
"Cluster: $clusterHostname"               | Tee-Object -FilePath $fullPath -Append
"Node:   $nodeHostname"                   | Tee-Object -FilePath $fullPath -Append
"========================================" | Tee-Object -FilePath $fullPath -Append
"" | Tee-Object -FilePath $fullPath -Append

# 1. PortQuiz - test outbound port 27017
"--- 1. curl http://portquiz.net:27017 ---" | Tee-Object -FilePath $fullPath -Append
try {
    $r = Invoke-WebRequest -Uri "http://portquiz.net:27017" -UseBasicParsing -TimeoutSec 15
    "Status: $($r.StatusCode)" | Tee-Object -FilePath $fullPath -Append
} catch {
    "Error: $($_.Exception.Message)" | Tee-Object -FilePath $fullPath -Append
}
"" | Tee-Object -FilePath $fullPath -Append

# 2. Ping primary node (10 packets)
"--- 2. ping -n 10 $nodeHostname ---" | Tee-Object -FilePath $fullPath -Append
ping -n 10 $nodeHostname 2>&1 | Tee-Object -FilePath $fullPath -Append
"" | Tee-Object -FilePath $fullPath -Append

# 3. Test-NetConnection - port 27017 to primary node
"--- 3. Test-NetConnection -Port 27017 -ComputerName $nodeHostname ---" | Tee-Object -FilePath $fullPath -Append
try {
    $tnc = Test-NetConnection -Port 27017 -InformationLevel Detailed -ComputerName $nodeHostname -WarningAction SilentlyContinue
    $tnc | Format-List * | Out-String | Tee-Object -FilePath $fullPath -Append
} catch {
    "Error: $($_.Exception.Message)" | Tee-Object -FilePath $fullPath -Append
}
"" | Tee-Object -FilePath $fullPath -Append

# 4. nslookup SRV - _mongodb._tcp.<cluster_hostname>
"--- 4. nslookup -debug -q=SRV _mongodb._tcp.$clusterHostname ---" | Tee-Object -FilePath $fullPath -Append
nslookup -debug -q=SRV "_mongodb._tcp.$clusterHostname" 2>&1 | Tee-Object -FilePath $fullPath -Append
"" | Tee-Object -FilePath $fullPath -Append

# 5. nslookup TXT - <cluster_hostname>
"--- 5. nslookup -debug -q=TXT $clusterHostname ---" | Tee-Object -FilePath $fullPath -Append
nslookup -debug -q=TXT $clusterHostname 2>&1 | Tee-Object -FilePath $fullPath -Append
"" | Tee-Object -FilePath $fullPath -Append

# 6. Extra: Test-NetConnection to other shards (optional)
"--- 6. Test-NetConnection -Port 27017 to shard 00-01 and 00-02 ---" | Tee-Object -FilePath $fullPath -Append
foreach ($node in @("ac-mzstv7l-shard-00-00.aw7fb7q.mongodb.net", "ac-mzstv7l-shard-00-01.aw7fb7q.mongodb.net")) {
    "  Node: $node" | Tee-Object -FilePath $fullPath -Append
    try {
        $t = Test-NetConnection -Port 27017 -ComputerName $node -WarningAction SilentlyContinue
        "  TcpTestSucceeded: $($t.TcpTestSucceeded)" | Tee-Object -FilePath $fullPath -Append
    } catch {
        "  Error: $($_.Exception.Message)" | Tee-Object -FilePath $fullPath -Append
    }
}
"" | Tee-Object -FilePath $fullPath -Append

"========================================" | Tee-Object -FilePath $fullPath -Append
"End of diagnostics. Share: $fullPath"    | Tee-Object -FilePath $fullPath -Append

# Re-save as UTF-8 for easier sharing with Support
try {
    $content = Get-Content -Path $fullPath -Raw -Encoding Default
    [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.UTF8Encoding]::new($false))
} catch { }

Write-Host ""
Write-Host "Done. Results saved to: $fullPath"
Write-Host "Share this file with MongoDB Support (Ernest)."
