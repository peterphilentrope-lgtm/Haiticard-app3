import { useState, createContext, useContext } from "react";
import {
  Home, Wallet, Send, Download, Activity, CreditCard, User,
  ArrowUpRight, ArrowDownLeft, Plus, Search, Bell, ChevronRight,
  Eye, EyeOff, Shield, QrCode, CheckCircle, DollarSign,
  Star, ExternalLink, ArrowLeft, Copy, Share2, Lock, Unlock
} from "lucide-react";

const WISE_LINK = "https://wise.com/invite/YOUR_REFERRAL_LINK";

const TRANSACTIONS = [
  { id:1, type:"received", name:"Jean Pierre",   amount:250,   date:"Today 10:31 AM",  note:"Rent payment" },
  { id:2, type:"sent",     name:"Marie Joseph",  amount:50,    date:"Today 9:15 AM",   note:"Lunch" },
  { id:3, type:"card",     name:"Amazon",        amount:35.99, date:"Yesterday 3:22 PM",note:"Purchase" },
  { id:4, type:"funded",   name:"MonCash",       amount:200,   date:"Yesterday 11:00 AM",note:"Top-up" },
  { id:5, type:"sent",     name:"Claudette M.",  amount:100,   date:"Jun 12",          note:"Business" },
  { id:6, type:"received", name:"Paul Laurent",  amount:500,   date:"Jun 11",          note:"Invoice" },
  { id:7, type:"card",     name:"Netflix",       amount:15.99, date:"Jun 10",          note:"Subscription" },
  { id:8, type:"withdrawal",name:"NatCash",      amount:150,   date:"Jun 9",           note:"Cash out" },
];

const RECIPIENTS = [
  { id:1, name:"Jean Pierre",  username:"jeanp",  avatar:"JP", fav:true },
  { id:2, name:"Marie Joseph", username:"mariej", avatar:"MJ", fav:true },
  { id:3, name:"Claudette M.", username:"claudm", avatar:"CM", fav:false },
  { id:4, name:"Paul Laurent", username:"paull",  avatar:"PL", fav:false },
];

const fmt = (n) => "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Context
const WCtx = createContext(null);
function WalletProvider({ children }) {
  const [frozen, setFrozen]     = useState(false);
  const [showBal, setShowBal]   = useState(true);
  const [online, setOnline]     = useState(true);
  const [daily, setDaily]       = useState(200);
  const [monthly, setMonthly]   = useState(2000);
  return (
    <WCtx.Provider value={{ frozen, setFrozen, showBal, setShowBal, online, setOnline, daily, setDaily, monthly, setMonthly }}>
      {children}
    </WCtx.Provider>
  );
}
const useW = () => useContext(WCtx);

// Transaction Icon
function TxIcon({ type }) {
  const cfg = {
    received:   { bg:"bg-green-100",  cls:"text-green-600",  I: ArrowDownLeft },
    sent:       { bg:"bg-red-100",    cls:"text-red-600",    I: ArrowUpRight },
    card:       { bg:"bg-blue-100",   cls:"text-blue-600",   I: CreditCard },
    funded:     { bg:"bg-purple-100", cls:"text-purple-600", I: Plus },
    withdrawal: { bg:"bg-orange-100", cls:"text-orange-600", I: ArrowUpRight },
  };
  const { bg, cls, I } = cfg[type] || cfg.sent;
  return (
    <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
      <I className={`w-5 h-5 ${cls}`} />
    </div>
  );
}

// Toggle Switch
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative w-12 h-6 rounded-full transition-colors ${on ? "bg-green-500" : "bg-gray-300"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  );
}

// Bottom Nav
function Navbar({ page, setPage }) {
  const tabs = [
    { id:"home",     I:Home,       label:"Home" },
    { id:"money",    I:Wallet,     label:"Money" },
    { id:"activity", I:Activity,   label:"Activity" },
    { id:"card",     I:CreditCard, label:"Card" },
    { id:"profile",  I:User,       label:"Profile" },
  ];
  const active = ["home","money","activity","card","profile"].includes(page) ? page : "home";
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100 z-50">
      <div className="flex">
        {tabs.map(({ id, I, label }) => (
          <button key={id} onClick={() => setPage(id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 ${active === id ? "text-blue-600" : "text-gray-400"}`}>
            <I className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────
function HomePage({ go }) {
  const { showBal, setShowBal } = useW();
  const bal = 1247.50;
  const actions = [
    { label:"Fund",    I:Plus,       p:"fund",    c:"bg-green-500" },
    { label:"Send",    I:Send,       p:"send",    c:"bg-blue-500" },
    { label:"Receive", I:Download,   p:"receive", c:"bg-purple-500" },
    { label:"Card",    I:CreditCard, p:"card",    c:"bg-orange-500" },
  ];
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 pt-10 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-200 text-sm">Good morning</p>
            <h1 className="text-white text-xl font-bold">Peter Philentrope</h1>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">PP</span>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-1">
            <p className="text-blue-200 text-sm">Available Balance</p>
            <button onClick={() => setShowBal(!showBal)}>
              {showBal ? <Eye className="w-4 h-4 text-blue-200" /> : <EyeOff className="w-4 h-4 text-blue-200" />}
            </button>
          </div>
          <h2 className="text-white text-4xl font-bold">{showBal ? fmt(bal) : "••••••"}</h2>
          <p className="text-blue-200 text-xs mt-1">HaitiCard Wallet • @peterp</p>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-4 gap-3">
            {actions.map(({ label, I, p, c }) => (
              <button key={label} onClick={() => go(p)} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 ${c} rounded-xl flex items-center justify-center shadow`}>
                  <I className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-green-600 font-bold">W</span>
              </div>
              <div>
                <p className="font-bold">Wise</p>
                <p className="text-xs text-green-100">Send money worldwide</p>
              </div>
            </div>
            <a href={WISE_LINK} target="_blank" rel="noopener noreferrer"
              className="bg-white text-green-600 text-xs font-bold px-3 py-2 rounded-lg">
              Get Account →
            </a>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700">Recent Activity</h3>
          <button onClick={() => go("activity")} className="text-xs text-blue-600 font-medium">See all</button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {TRANSACTIONS.slice(0,4).map((tx, i) => (
            <div key={tx.id} className={`flex items-center gap-3 p-4 ${i < 3 ? "border-b border-gray-50" : ""}`}>
              <TxIcon type={tx.type} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{tx.name}</p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
              <span className={`font-bold text-sm ${tx.type==="received"||tx.type==="funded" ? "text-green-600" : "text-gray-900"}`}>
                {tx.type==="received"||tx.type==="funded" ? "+" : "-"}{fmt(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MY MONEY ──────────────────────────────────────────────────────────────
function MyMoneyPage({ go }) {
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-4 pt-10 pb-8">
        <h1 className="text-white text-xl font-bold mb-6">My Money</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-purple-200 text-xs mb-1">Available</p>
            <p className="text-white text-2xl font-bold">$1,247.50</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-purple-200 text-xs mb-1">Pending</p>
            <p className="text-white text-2xl font-bold">$150.00</p>
          </div>
        </div>
      </div>
      <div className="px-4 mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4">This Month</h3>
          {[["Total Received","$750.00","text-green-600"],["Total Sent","$150.00","text-red-600"],["Card Spent","$51.98","text-blue-600"]].map(([l,v,c])=>(
            <div key={l} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{l}</span>
              <span className={`font-bold text-sm ${c}`}>{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4">Funding Sources</h3>
          {[["📱","MonCash","Mobile Money",true],["📱","NatCash","Mobile Money",true],["🏦","Bank","Bank Account",false]].map(([icon,name,type,linked])=>(
            <div key={name} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <span className="text-2xl">{icon}</span>
              <div className="flex-1"><p className="font-medium text-sm">{name}</p><p className="text-xs text-gray-400">{type}</p></div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${linked?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{linked?"Linked":"Add"}</span>
            </div>
          ))}
        </div>
        <button onClick={() => go("fund")} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Fund My Wallet
        </button>
      </div>
    </div>
  );
}

// ── FUND WALLET ───────────────────────────────────────────────────────────
function FundWalletPage({ go }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [done, setDone] = useState(false);

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-24">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
        <p className="text-gray-600 mb-1">Funding {fmt(parseFloat(amount))} via {method}</p>
        <p className="text-sm text-gray-400 mb-8">Your wallet will be updated shortly</p>
        <button onClick={() => { go("home"); setDone(false); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-green-600 to-green-800 px-4 pt-10 pb-8">
        <button onClick={() => go("money")} className="flex items-center gap-2 text-green-200 mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="text-white text-xl font-bold">Fund Wallet</h1>
      </div>
      <div className="px-4 mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl text-2xl font-bold focus:border-green-500 focus:outline-none" />
          </div>
          <div className="flex gap-2 mt-3">
            {[50,100,200,500].map(n => (
              <button key={n} onClick={() => setAmount(n.toString())}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-600">${n}</button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Funding Method</label>
          <div className="space-y-2">
            {[["📱","MonCash","Digicel mobile money"],["📱","NatCash","Natcom mobile money"],["🏦","Bank Transfer","Local bank"],["🏪","Cash Agent","Nearest agent"]].map(([icon,label,desc])=>(
              <button key={label} onClick={() => setMethod(label)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${method===label?"border-green-500 bg-green-50":"border-gray-100"}`}>
                <span className="text-2xl">{icon}</span>
                <div className="text-left"><p className="font-semibold text-sm">{label}</p><p className="text-xs text-gray-400">{desc}</p></div>
                {method===label && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { if(amount&&method) setDone(true); }} disabled={!amount||!method}
          className={`w-full py-4 rounded-2xl font-bold text-lg ${amount&&method?"bg-green-600 text-white":"bg-gray-200 text-gray-400"}`}>
          Fund Wallet
        </button>
      </div>
    </div>
  );
}

// ── SEND MONEY ────────────────────────────────────────────────────────────
function SendMoneyPage({ go }) {
  const [step, setStep]         = useState(1);
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount]     = useState("");
  const [note, setNote]         = useState("");
  const [search, setSearch]     = useState("");

  const back = () => step > 1 ? setStep(step-1) : go("home");
  const filtered = RECIPIENTS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (step === 3) return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-24">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Money Sent!</h2>
        <p className="text-gray-600 mb-8">{fmt(parseFloat(amount))} sent to {recipient?.name}</p>
        <button onClick={() => { go("home"); setStep(1); setRecipient(null); setAmount(""); setNote(""); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 pt-10 pb-8">
        <button onClick={back} className="flex items-center gap-2 text-blue-200 mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="text-white text-xl font-bold">Send Money</h1>
        <div className="flex gap-2 mt-4">
          {[1,2].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${step>=s?"bg-white":"bg-white/30"}`} />)}
        </div>
      </div>
      <div className="px-4 mt-6 space-y-4">
        {step === 1 && <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipient..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1"><Star className="w-4 h-4" /> Favorites</p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {RECIPIENTS.filter(r=>r.fav).map(r=>(
                <button key={r.id} onClick={() => { setRecipient(r); setStep(2); }} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{r.avatar}</span>
                  </div>
                  <span className="text-xs text-gray-600 w-14 text-center truncate">{r.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filtered.map((r,i) => (
              <button key={r.id} onClick={() => { setRecipient(r); setStep(2); }}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 ${i<filtered.length-1?"border-b border-gray-50":""}`}>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{r.avatar}</span>
                </div>
                <div className="flex-1"><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-400">@{r.username}</p></div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </>}
        {step === 2 && recipient && <>
          <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">{recipient.avatar}</span>
            </div>
            <div><p className="font-bold">{recipient.name}</p><p className="text-sm text-gray-500">@{recipient.username}</p></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl text-2xl font-bold focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note (optional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="What's this for?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
            </div>
            {amount && <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="flex justify-between text-gray-600 mb-1"><span>Amount</span><span>{fmt(parseFloat(amount))}</span></div>
              <div className="flex justify-between text-gray-600 mb-1"><span>Fee</span><span className="text-green-600">Free</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{fmt(parseFloat(amount))}</span></div>
            </div>}
          </div>
          <button onClick={() => { if(amount) setStep(3); }} disabled={!amount}
            className={`w-full py-4 rounded-2xl font-bold text-lg ${amount?"bg-blue-600 text-white":"bg-gray-200 text-gray-400"}`}>
            Send {amount ? fmt(parseFloat(amount)) : "Money"}
          </button>
        </>}
      </div>
    </div>
  );
}

// ── RECEIVE ───────────────────────────────────────────────────────────────
function ReceiveMoneyPage({ go }) {
  const [copied, setCopied] = useState(false);
  const link = "haiticard.app/pay/peterp";
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-4 pt-10 pb-8">
        <button onClick={() => go("home")} className="flex items-center gap-2 text-purple-200 mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="text-white text-xl font-bold">Receive Money</h1>
      </div>
      <div className="px-4 mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-48 h-48 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <div className="text-center"><QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" /><p className="text-xs text-gray-400">QR Code</p></div>
          </div>
          <h2 className="text-xl font-bold">Peter Philentrope</h2>
          <p className="text-gray-500 text-sm">@peterp</p>
          <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 inline-block">
            <p className="text-blue-600 text-xs font-mono">HC-2024-001</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Payment Link</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
            <p className="flex-1 text-sm text-gray-600 truncate font-mono">{link}</p>
            <button onClick={copy} className={`p-2 rounded-lg ${copied?"bg-green-100":"bg-gray-200"}`}>
              {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>
        <button className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" /> Share Payment Link
        </button>
      </div>
    </div>
  );
}

// ── ACTIVITY ──────────────────────────────────────────────────────────────
function ActivityPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filters = ["all","received","sent","card","funded","withdrawal"];
  const list = TRANSACTIONS.filter(tx =>
    (filter==="all" || tx.type===filter) &&
    tx.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-4 pt-10 pb-6">
        <h1 className="text-white text-xl font-bold mb-4">Activity</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-2 px-4 py-4 overflow-x-auto">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${filter===f?"bg-gray-900 text-white":"bg-gray-100 text-gray-600"}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {list.length === 0
            ? <div className="p-8 text-center"><p className="text-gray-400">No transactions found</p></div>
            : list.map((tx,i) => (
              <div key={tx.id} className={`flex items-center gap-3 p-4 ${i<list.length-1?"border-b border-gray-50":""}`}>
                <TxIcon type={tx.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{tx.name}</p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                  {tx.note && <p className="text-xs text-gray-400 italic">"{tx.note}"</p>}
                </div>
                <span className={`font-bold text-sm ${tx.type==="received"||tx.type==="funded"?"text-green-600":"text-gray-900"}`}>
                  {tx.type==="received"||tx.type==="funded"?"+":"-"}{fmt(tx.amount)}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────
function CardPage() {
  const { frozen, setFrozen, online, setOnline, daily, setDaily, monthly, setMonthly } = useW();
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 px-4 pt-10 pb-8">
        <h1 className="text-white text-xl font-bold mb-6">My Card</h1>
        <div className={`rounded-2xl p-6 shadow-2xl ${frozen?"bg-gradient-to-br from-gray-400 to-gray-600":"bg-gradient-to-br from-gray-900 to-gray-700"}`}>
          <div className="flex justify-between items-start mb-8">
            <div><p className="text-white/60 text-xs">HaitiCard</p><p className="text-white font-bold">Virtual Card</p></div>
            {frozen && <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">❄️ Frozen</span>}
          </div>
          <p className="text-white font-mono text-lg tracking-widest mb-6">•••• •••• •••• 4242</p>
          <div className="flex justify-between">
            <div><p className="text-white/60 text-xs">Holder</p><p className="text-white text-sm font-medium">Peter Philentrope</p></div>
            <div><p className="text-white/60 text-xs">Expires</p><p className="text-white text-sm font-medium">12/27</p></div>
            <div><p className="text-white/60 text-xs">CVV</p><p className="text-white text-sm font-medium">•••</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button onClick={() => setFrozen(!frozen)}
            className="w-full flex items-center gap-3 p-4 border-b border-gray-50">
            {frozen ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-blue-600" />}
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">{frozen ? "Unfreeze Card" : "Freeze Card"}</p>
              <p className="text-xs text-gray-400">{frozen ? "Card is frozen" : "Temporarily disable"}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${frozen?"bg-red-100 text-red-600":"bg-green-100 text-green-600"}`}>
              {frozen ? "Frozen" : "Active"}
            </span>
          </button>
          <div className="flex items-center gap-3 p-4 border-b border-gray-50">
            <Shield className="w-5 h-5 text-purple-600" />
            <div className="flex-1"><p className="font-medium text-sm">Online Purchases</p><p className="text-xs text-gray-400">International payments</p></div>
            <Toggle on={online} onChange={setOnline} />
          </div>
          <div className="p-4 border-b border-gray-50">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-sm">Daily Limit</p>
              <span className="text-sm font-bold text-blue-600">{fmt(daily)}</span>
            </div>
            <input type="range" min={50} max={500} step={50} value={daily} onChange={e => setDaily(Number(e.target.value))}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$50</span><span>$500</span></div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-sm">Monthly Limit</p>
              <span className="text-sm font-bold text-blue-600">{fmt(monthly)}</span>
            </div>
            <input type="range" min={100} max={2000} step={100} value={monthly} onChange={e => setMonthly(Number(e.target.value))}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$100</span><span>$2,000</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────
function ProfilePage() {
  const [notifs, setNotifs] = useState(true);
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-4 pt-10 pb-8">
        <h1 className="text-white text-xl font-bold mb-6">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">PP</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Peter Philentrope</h2>
            <p className="text-gray-400 text-sm">@peterp</p>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">✓ Verified</span>
          </div>
        </div>
      </div>
      <div className="px-4 mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50"><p className="text-sm font-bold text-gray-700">Personal Information</p></div>
          {[["Full Name","Peter Philentrope"],["Username","@peterp"],["Email","Fatherleaderhq@gmail.com"],["Phone","+509 4795-4115"]].map(([l,v],i,arr)=>(
            <div key={l} className={`flex justify-between px-4 py-3 ${i<arr.length-1?"border-b border-gray-50":""}`}>
              <span className="text-sm text-gray-500">{l}</span>
              <span className="text-sm font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Notifications</p><p className="text-xs text-gray-400">Transaction alerts</p></div>
            <Toggle on={notifs} onChange={setNotifs} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50"><p className="text-sm font-bold text-gray-700">Partner Services</p></div>
          {[["Get Wise Account","Send money internationally"],["Get Wise Card","Spend worldwide"]].map(([l,d],i,arr)=>(
            <a key={l} href={WISE_LINK} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${i<arr.length-1?"border-b border-gray-50":""}`}>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">W</span>
              </div>
              <div className="flex-1"><p className="text-sm font-medium">{l}</p><p className="text-xs text-gray-400">{d}</p></div>
              <ExternalLink className="w-4 h-4 text-gray-300" />
            </a>
          ))}
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">Coming Soon</p>
          <div className="flex gap-3">
            {["Payoneer","EziPay","CashApp"].map(p=>(
              <div key={p} className="bg-white rounded-xl px-3 py-2 text-xs font-medium text-gray-400 border border-gray-200">{p}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const render = () => {
    switch(page) {
      case "home":     return <HomePage go={setPage} />;
      case "money":    return <MyMoneyPage go={setPage} />;
      case "fund":     return <FundWalletPage go={setPage} />;
      case "send":     return <SendMoneyPage go={setPage} />;
      case "receive":  return <ReceiveMoneyPage go={setPage} />;
      case "activity": return <ActivityPage />;
      case "card":     return <CardPage />;
      case "profile":  return <ProfilePage />;
      default:         return <HomePage go={setPage} />;
    }
  };
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
        {render()}
        <Navbar page={page} setPage={setPage} />
      </div>
    </WalletProvider>
  );
   }
