# MongoDB Atlas Support Ticket

## Subject
Connection timeout after Network Access configured - Server selection timed out after 30000 ms

---

## Problem Description

I am experiencing persistent connection timeouts when trying to connect to my MongoDB Atlas cluster from Node.js applications, even though Network Access has been properly configured for over 6 hours.

**Cluster Details:**
- Cluster Name: Yassline
- Project: [Your Project Name]
- Region: [Your Region]
- Cluster Type: M10 (or your tier)

**Connection String Format:**
- Standard: `mongodb://yasslinetour_db_user:***@ac-nbesxsy-shard-00-00.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-01.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-02.v3oycnj.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&replicaSet=atlas-nbesxsy-shard-0&retryWrites=true&w=majority`
- SRV: `mongodb+srv://yasslinetour_db_user:***@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority`

---

## Error Messages

**Primary Error:**
```
MongoServerSelectionError: Server selection timed out after 30000 ms
```

**Additional Errors:**
- `querySrv ECONNREFUSED _mongodb._tcp.yassline.v3oycnj.mongodb.net` (SRV format)
- `Server selection timed out after 30000 ms` (Standard format)

---

## What Has Been Verified

### ✅ Network Access Configuration
- IP Address: `0.0.0.0/0` (Allow Access from Anywhere)
- Status: **Active**
- Configured for over 6 hours
- Attempted to delete and re-add the IP address (no change)

### ✅ Cluster Status
- Cluster State: **Active** (not paused)
- All shards appear to be running
- No alerts or warnings in the Atlas dashboard

### ✅ Database and User Configuration
- Database: `yasslinetour` - Created and accessible via Atlas UI
- Collection: `circuits` - Created and accessible via Atlas UI
- User: `yasslinetour_db_user` - Status: **Active** in Database Access
- User has proper permissions for the database

### ✅ Network Connectivity Tests
- **TCP Port Connectivity:** ✅ SUCCESS
  - All three shard servers (ports 27017) are accessible via TCP
  - Test performed using Node.js `net` module
  - All connections establish successfully at TCP level

### ✅ Search Index
- Atlas Search index created successfully via UI
- Index status: **READY**
- This confirms UI access works, but programmatic connections fail

---

## What Has Been Tried

### Connection Attempts
1. **Mongoose (v9.1.5)** - Multiple configurations tested, all timeout
2. **MongoDB Native Driver (v7.0.0)** - Same timeout error
3. **Different connection options:**
   - Various timeout values (10s, 30s, 60s)
   - With and without SSL options
   - Direct connection attempts
   - Different read preferences

### Network Troubleshooting
1. **Firewall:** Windows Firewall temporarily disabled - no change
2. **Antivirus:** Temporarily disabled - no change
3. **Network:** Tested from different network (mobile hotspot) - same issue
4. **DNS:** DNS resolution works correctly for SRV records

### Configuration Changes
1. Deleted and re-added `0.0.0.0/0` in Network Access
2. Verified user permissions multiple times
3. Tried both SRV and standard connection string formats
4. Verified cluster is not paused

---

## Technical Details

**Environment:**
- OS: Windows 10/11
- Node.js: v24.13.0
- MongoDB Driver: v7.0.0
- Mongoose: v9.1.5

**Connection Test Results:**
```
TCP Connectivity Test:
✅ ac-nbesxsy-shard-00-00.v3oycnj.mongodb.net:27017 - Accessible
✅ ac-nbesxsy-shard-00-01.v3oycnj.mongodb.net:27017 - Accessible
✅ ac-nbesxsy-shard-00-02.v3oycnj.mongodb.net:27017 - Accessible

MongoDB Connection Test:
❌ SRV Format: querySrv ECONNREFUSED
❌ Standard Format: Server selection timed out after 30000 ms
```

**Observation:**
The TCP ports are accessible, but MongoDB cannot establish the connection. This suggests the issue is not a basic firewall problem, but rather something at the MongoDB protocol level (SSL/TLS handshake, authentication, or replica set configuration).

---

## Request

Please investigate:
1. Why connections timeout even though Network Access is properly configured
2. Whether there are any server-side restrictions or issues preventing connections
3. If there are any logs on the Atlas side showing connection attempts being rejected
4. Whether the replica set configuration might be causing issues

I can provide additional diagnostic information or perform specific tests if needed.

---

## Additional Information

- **Support Plan:** [Your Support Plan Level]
- **Priority:** High (blocking development)
- **Time Since Issue Started:** 6+ hours
- **Can access Atlas UI:** Yes (can create databases, collections, indexes via web interface)
- **Can access via Compass:** [Not tested / Tested and failed / Tested and succeeded]

Thank you for your assistance.

---

## Copy-Paste Version (for Support Ticket)

```
Subject: Connection timeout after Network Access configured - Server selection timed out after 30000 ms

Problem Description:
I am experiencing persistent connection timeouts when trying to connect to my MongoDB Atlas cluster from Node.js applications, even though Network Access has been properly configured for over 6 hours.

Cluster: Yassline
Database: yasslinetour
User: yasslinetour_db_user

Error: MongoServerSelectionError: Server selection timed out after 30000 ms

What I've verified:
- Network Access: 0.0.0.0/0 is Active (configured for 6+ hours)
- Cluster Status: Active (not paused)
- User Status: Active in Database Access
- TCP Ports: All three shard servers (27017) are accessible via TCP
- Database/Collection: Created and accessible via Atlas UI

What I've tried:
- Multiple connection string formats (SRV and standard)
- Both Mongoose and MongoDB native driver
- Different timeout values and connection options
- Disabled firewall and antivirus
- Tested from different network (mobile hotspot)
- Deleted and re-added Network Access IP

Observation: TCP ports are accessible, but MongoDB cannot establish the connection. This suggests an issue at the MongoDB protocol level (SSL/TLS handshake, authentication, or replica set).

Request: Please investigate why connections timeout despite proper Network Access configuration. Are there any server-side restrictions or logs showing connection attempts being rejected?

Environment: Windows 10/11, Node.js v24.13.0, MongoDB Driver v7.0.0, Mongoose v9.1.5
```
