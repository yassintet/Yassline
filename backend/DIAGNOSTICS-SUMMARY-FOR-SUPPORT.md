# Network diagnostics – Summary for MongoDB Support

## Yassline M0 cluster (correct)

- **cluster_hostname:** `yassline.v3oycnj.mongodb.net`
- **Primary node:** `ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net`
- **Connection string:** SRV only – `mongodb+srv://...@yassline.v3oycnj.mongodb.net/...?appName=Yassline`

We previously used nodes from a different cluster (`ac-nbesxsy`, `v3oycnj`). All config and scripts now target **Yassline M0** (mzstv7l / aw7fb7q).

---

## How to run diagnostics

Use `run-network-diagnostics.ps1` (tests PortQuiz, ping, Test-NetConnection, nslookup SRV/TXT).

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
.\run-network-diagnostics.ps1
```

Results are saved to `network-diagnostics-results.txt`. Share that file or paste its contents in the support chat.

---

## Short summary you can paste in chat

```
Cluster: Yassline M0
cluster_hostname: yassline.v3oycnj.mongodb.net
Primary node: ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net

I ran the requested PowerShell diagnostics. Results:

1. curl http://portquiz.net:27017 -> Status: 200
2. ping -n 10 <primary node> -> (see attached output)
3. Test-NetConnection -Port 27017 -ComputerName <primary node> -> (see attached)
4. nslookup -debug -q=SRV _mongodb._tcp.yassline.v3oycnj.mongodb.net -> (see attached)
5. nslookup -debug -q=TXT yassline.v3oycnj.mongodb.net -> (see attached)
6. Test-NetConnection to shard 00-00 and 00-01 -> (see attached)

Full output: network-diagnostics-results.txt
```

---

## Files

- **Script:** `backend\run-network-diagnostics.ps1`
- **Output:** `backend\network-diagnostics-results.txt`
- **Cluster details:** `backend\CLUSTER-YASSLINE-M0.md`
