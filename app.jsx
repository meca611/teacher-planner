
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ZIEK MAILER</title>
<link rel="icon" href="ziekfav.ico">
<link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@400;700&display=swap" rel="stylesheet">
<style>
body{margin:0;font-family:"LINE Seed JP",sans-serif;background:#0b0f14;color:#fff}
header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#111827;transition:.3s}
header.new{background:#7c3aed}
.logo{display:flex;align-items:center;gap:14px}
.logo img{height:56px}
.title{font-size:26px;font-weight:700}
.sub{font-size:12px;opacity:.7}
.status{font-size:13px;text-align:right}
main{display:flex;height:calc(100vh - 140px)}
.col{flex:1;overflow:auto;border-right:1px solid #1f2937}
.col:last-child{border:none}
.mail.unread{background:#1f2937;font-weight:700}
footer{height:70px;background:#111827;display:flex;align-items:center;justify-content:space-between;padding:0 20px}
.badge{background:#ef4444;border-radius:999px;padding:2px 8px;margin-left:6px}
.ai-modes button{margin-right:6px}
@media(max-width:900px){
main{flex-direction:column}
.logo img{height:42px}
.title{font-size:20px}
}
</style>
</head>
<body>

<header id="header">
<div class="logo">
<img src="zieklogo.png">
<div>
<div class="title">ZIEK MAILER</div>
<div class="sub">Zenith Intelligent Executive Guardian</div>
</div>
</div>
<div class="status">
<div id="date"></div>
<div id="clock"></div>
</div>
</header>

<main>
<div class="col" id="list"></div>
<div class="col" id="detail"></div>
<div class="col" id="preview"></div>
</main>

<footer>
<img src="mecalogo-white.png" height="40">
<div>AI下書き支援稼働中</div>
</footer>

<audio id="sound" src="mailziek.mp3" preload="auto"></audio>

<script>
const header=document.getElementById("header")
function clock(){
const d=new Date()
document.getElementById("date").textContent=d.toLocaleDateString()
document.getElementById("clock").textContent=d.toLocaleTimeString()
}
setInterval(clock,1000);clock()

let unread=0
function newMail(){
unread++
header.classList.add("new")
document.title="("+unread+") ZIEK MAILER"
document.getElementById("sound").play()
}

document.addEventListener("keydown",e=>{
if(e.ctrlKey&&e.key==="r")location.reload()
if(e.ctrlKey&&e.key==="1")document.getElementById("list").focus()
if(e.ctrlKey&&e.key==="2")document.getElementById("detail").focus()
if(e.ctrlKey&&e.key==="3")document.getElementById("preview").focus()
})
</script>

</body>
</html>
