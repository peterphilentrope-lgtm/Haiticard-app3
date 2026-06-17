import { useState, createContext, useContext, useCallback, useEffect } from "react";
import {
  Home, Wallet, Send, Download, Activity, CreditCard, User,
  ArrowUpRight, ArrowDownLeft, Plus, Search, Bell, ChevronRight,
  Eye, EyeOff, Shield, QrCode, CheckCircle, Star,
  ArrowLeft, Copy, Share2, Lock, Unlock, X, Zap,
  UserPlus, Trash2, Phone, Mail, RefreshCw, AlertCircle,
  Globe, LogOut, Clock, Check, XCircle
} from "lucide-react";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const WISE_LINK   = "https://wise.com/invite/YOUR_LINK";
const CASHAPP_TAG = "$haiticard";
const USDT_TRC20  = "TJmvHZFYmpQBGBVZhM4Bk5fNQVgRxJ9kLp";
const USDT_BEP20  = "0x4B8f3e2a1C9dE7F0A6b5c3D8e9F2A4B7c1E6d2F";
const ADMIN_PASS  = "admin2025";
const ME          = { username:"peterp", displayName:"Peter Philentrope", walletId:"HC-2024-001", phone:"+509 4795-4115", email:"Fatherleaderhq@gmail.com" };

// ── UTILS ─────────────────────────────────────────────────────────────────────
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5);
const tsNow= () => new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const fmt  = n => "$" + Math.abs(Number(n)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",");

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
const INIT_TX = [
  { id:"t1", type:"received",   name:"Jean Pierre",  amount:250,   date:"Today, 10:31 AM",    note:"Rent payment",  from:"@jeanp",  to:"@peterp", status:"completed" },
  { id:"t2", type:"sent",       name:"Marie Joseph", amount:50,    date:"Today, 9:15 AM",     note:"Lunch",         from:"@peterp", to:"@mariej", status:"completed" },
  { id:"t3", type:"card",       name:"Amazon",       amount:35.99, date:"Yesterday, 3:22 PM", note:"Online order",  from:"@peterp", to:"Amazon",  status:"completed" },
  { id:"t4", type:"funded",     name:"MonCash",      amount:200,   date:"Yesterday, 11:00 AM",note:"Top-up",        from:"MonCash", to:"@peterp", status:"completed" },
  { id:"t5", type:"sent",       name:"Claudette M.", amount:100,   date:"Jun 12",             note:"Business",      from:"@peterp", to:"@claudm", status:"completed" },
  { id:"t6", type:"received",   name:"Paul Laurent", amount:500,   date:"Jun 11",             note:"Invoice",       from:"@paull",  to:"@peterp", status:"completed" },
  { id:"t7", type:"card",       name:"Netflix",      amount:15.99, date:"Jun 10",             note:"Subscription",  from:"@peterp", to:"Netflix", status:"completed" },
  { id:"t8", type:"withdrawal", name:"NatCash",      amount:150,   date:"Jun 9",              note:"Cash out",      from:"@peterp", to:"NatCash", status:"completed" },
];

const INIT_CONTACTS = [
  { id:"c1", username:"jeanp",  displayName:"Jean Pierre",  walletId:"HC-2024-002", fav:true  },
  { id:"c2", username:"mariej", displayName:"Marie Joseph", walletId:"HC-2024-003", fav:true  },
  { id:"c3", username:"claudm", displayName:"Claudette M.", walletId:"HC-2024-004", fav:false },
  { id:"c4", username:"paull",  displayName:"Paul Laurent", walletId:"HC-2024-005", fav:false },
];

const INIT_NOTIFS = [
  { id:"n1", type:"received", message:"Jean Pierre sent you $250.00",   amount:250, read:false, ts:"10:31 AM"  },
  { id:"n2", type:"sent",     message:"You sent Marie Joseph $50.00",   amount:50,  read:false, ts:"9:15 AM"   },
  { id:"n3", type:"funded",   message:"MonCash top-up of $200 approved",amount:200, read:true,  ts:"Yesterday" },
];

const MOCK_USERS = [
  { id:"u1", displayName:"Jean Pierre",  username:"jeanp",  walletId:"HC-2024-002", status:"active",    balance:420 },
  { id:"u2", displayName:"Marie Joseph", username:"mariej", walletId:"HC-2024-003", status:"active",    balance:150 },
  { id:"u3", displayName:"Claudette M.", username:"claudm", walletId:"HC-2024-004", status:"suspended", balance:80  },
  { id:"u4", displayName:"Paul Laurent", username:"paull",  walletId:"HC-2024-005", status:"active",    balance:930 },
];

// ── CONTEXT ───────────────────────────────────────────────────────────────────
const WCtx = createContext(null);

function WalletProvider({ children }) {
  const [auth,          setAuth]          = useState(false);
  const [balance,       setBalance]       = useState(1247.50);
  const [transactions,  setTransactions]  = useState(INIT_TX);
  const [contacts,      setContacts]      = useState(INIT_CONTACTS);
  const [notifications, setNotifications] = useState(INIT_NOTIFS);
  const [pendingFunds,  setPendingFunds]  = useState([]);
  const [frozen,        setFrozen]        = useState(false);
  const [online,        setOnline]        = useState(true);
  const [daily,         setDaily]         = useState(200);
  const [monthly,       setMonthly]       = useState(2000);
  const [showBal,       setShowBal]       = useState(true);
  const [notifPref,     setNotifPref]     = useState(true);

  const unread = notifications.filter(n => !n.read).length;

  const pushNotif = useCallback((type, message, amount) => {
    setNotifications(p => [{ id:uid(), type, message, amount, read:false, ts:tsNow() }, ...p]);
  }, []);

  const addTx = useCallback((tx) => {
    setTransactions(p => [{ ...tx, id:uid(), date:"Just now", status:"completed" }, ...p]);
  }, []);

  const sendMoney = useCallback((toName, toHandle, amount, note) => {
    if (balance < amount) return false;
    setBalance(p => +(p - amount).toFixed(2));
    addTx({ type:"sent", name:toName, amount, note:note||"Transfer", from:"@peterp", to:toHandle });
    pushNotif("sent", `You sent ${fmt(amount)} to ${toName}`, amount);
    return true;
  }, [balance, addTx, pushNotif]);

  const addFunds = useCallback((amount, method, note) => {
    setBalance(p => +(p + amount).toFixed(2));
    addTx({ type:"funded", name:method, amount, note:note||"Funding", from:method, to:"@peterp" });
    pushNotif("funded", `${fmt(amount)} added via ${method}`, amount);
  }, [addTx, pushNotif]);

  const addPending = useCallback((req) => {
    const r = { ...req, id:uid(), status:"pending", ts:tsNow() };
    setPendingFunds(p => [r, ...p]);
    pushNotif("pending", `${fmt(req.amount)} funding request submitted via ${req.method}`, req.amount);
  }, [pushNotif]);

  const approveFunding = useCallback((id) => {
    setPendingFunds(p => p.map(f => f.id===id ? { ...f, status:"approved" } : f));
    const req = pendingFunds.find(f => f.id===id);
    if (req) { setBalance(p => +(p + req.amount).toFixed(2)); pushNotif("funded", `Funding of ${fmt(req.amount)} approved!`, req.amount); }
  }, [pendingFunds, pushNotif]);

  const rejectFunding = useCallback((id) => {
    setPendingFunds(p => p.map(f => f.id===id ? { ...f, status:"rejected" } : f));
    const req = pendingFunds.find(f => f.id===id);
    if (req) pushNotif("rejected", `Funding of ${fmt(req.amount)} was rejected`, req.amount);
  }, [pendingFunds, pushNotif]);

  const addContact    = useCallback((c)  => setContacts(p => [{ ...c, id:uid(), fav:false }, ...p]), []);
  const removeContact = useCallback((id) => setContacts(p => p.filter(c => c.id !== id)), []);
  const toggleFav     = useCallback((id) => setContacts(p => p.map(c => c.id===id ? { ...c, fav:!c.fav } : c)), []);
  const markRead      = useCallback((id) => setNotifications(p => p.map(n => n.id===id ? { ...n, read:true } : n)), []);
  const markAllRead   = useCallback(()   => setNotifications(p => p.map(n => ({ ...n, read:true }))), []);

  return (
    <WCtx.Provider value={{
      auth, setAuth,
      balance, showBal, setShowBal,
      transactions, contacts, notifications, pendingFunds, unread,
      frozen, setFrozen, online, setOnline, daily, setDaily, monthly, setMonthly,
      notifPref, setNotifPref,
      sendMoney, addFunds, addPending, addContact, removeContact,
      toggleFav, markRead, markAllRead, approveFunding, rejectFunding, pushNotif,
    }}>
      {children}
    </WCtx.Provider>
  );
}
const useW = () => useContext(WCtx);

// ── SHARED ────────────────────────────────────────────────────────────────────
const isCredit = t => ["received","funded"].includes(t);

const TX_CFG = {
  received:   { bg:"bg-green-100",  fg:"text-green-600",  I:ArrowDownLeft, label:"Received"   },
  sent:       { bg:"bg-red-100",    fg:"text-red-500",    I:ArrowUpRight,  label:"Sent"       },
  card:       { bg:"bg-blue-100",   fg:"text-blue-600",   I:CreditCard,    label:"Card"       },
  funded:     { bg:"bg-violet-100", fg:"text-violet-600", I:Plus,          label:"Funded"     },
  withdrawal: { bg:"bg-orange-100", fg:"text-orange-500", I:ArrowUpRight,  label:"Withdrawal" },
};

function Tog({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${on ? "bg-blue-600" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0"}`}/>
    </button>
  );
}

function Av({ initials="?", size="md", bg="bg-blue-100", fg="text-blue-700" }) {
  const s = { sm:"w-8 h-8 text-xs", md:"w-10 h-10 text-sm", lg:"w-14 h-14 text-base", xl:"w-20 h-20 text-2xl" }[size];
  return <div className={`${s} ${bg} ${fg} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>{initials}</div>;
}

function Crd({ children, className="" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>;
}

function SecTitle({ children }) {
  return <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{children}</p>;
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-white/80 hover:text-white mb-5 text-sm font-medium">
      <ArrowLeft className="w-4 h-4"/> Back
    </button>
  );
}

function TxRow({ tx, last }) {
  const c = TX_CFG[tx.type] || TX_CFG.sent;
  const cr = isCredit(tx.type);
  return (
    <div className={`flex items-center gap-3 p-4 ${!last ? "border-b border-gray-50" : ""}`}>
      <div className={`w-10 h-10 ${c.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
        <c.I className={`w-5 h-5 ${c.fg}`}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{tx.name}</p>
        <p className="text-xs text-gray-400">{tx.date}</p>
        {tx.note && <p className="text-xs text-gray-400 italic truncate">"{tx.note}"</p>}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${cr ? "text-green-600" : "text-gray-900"}`}>
          {cr ? "+" : "-"}{fmt(tx.amount)}
        </p>
        <p className="text-xs text-gray-300">{c.label}</p>
      </div>
    </div>
  );
}

function Done({ title, sub, onHome }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 pb-24 bg-gray-50">
      <div className="text-center w-full max-w-sm">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-12 h-12 text-green-500"/>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-8">{sub}</p>
        <button onClick={onHome} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Back to Home</button>
      </div>
    </div>
  );
}

function NotifIcon({ type }) {
  const map = {
    received: "bg-green-100 text-green-600",
    sent:     "bg-red-100 text-red-500",
    funded:   "bg-violet-100 text-violet-600",
    pending:  "bg-yellow-100 text-yellow-600",
    rejected: "bg-gray-100 text-gray-500",
  };
  const cls = map[type] || map.funded;
  const I = type==="received" ? ArrowDownLeft : type==="sent" ? ArrowUpRight : type==="rejected" ? XCircle : Plus;
  return (
    <div className={`w-10 h-10 ${cls} rounded-full flex items-center justify-center flex-shrink-0`}>
      <I className="w-5 h-5"/>
    </div>
  );
}

const initials = s => s.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

// ── NAVBAR ────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"home",     I:Home,       label:"Home"     },
  { id:"money",    I:Wallet,     label:"Money"    },
  { id:"activity", I:Activity,   label:"Activity" },
  { id:"card",     I:CreditCard, label:"Card"     },
  { id:"profile",  I:User,       label:"Profile"  },
];
const TOP_LEVEL = ["home","money","activity","card","profile"];

function Navbar({ page, setPage }) {
  const active = TOP_LEVEL.includes(page) ? page : "home";
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100 z-50">
      <div className="flex">
        {NAV.map(({ id, I, label }) => (
          <button key={id} onClick={() => setPage(id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${active===id ? "text-blue-600" : "text-gray-400"}`}>
            <I className="w-5 h-5"/>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── OTP AUTH ──────────────────────────────────────────────────────────────────
function AuthScreen() {
  const { setAuth } = useW();
  const [step,   setStep]   = useState(1);
  const [method, setMethod] = useState("phone");
  const [val,    setVal]    = useState("");
  const [otp,    setOtp]    = useState("");
  const [code,   setCode]   = useState("");
  const [timer,  setTimer]  = useState(60);
  const [err,    setErr]    = useState("");

  const onVal = useCallback(e => { setVal(e.target.value); setErr(""); }, []);
  const onOtp = useCallback(e => { setOtp(e.target.value.replace(/\D/g,"").slice(0,6)); setErr(""); }, []);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const t = setTimeout(() => setTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, timer]);

  const sendOtp = () => {
    if (!val.trim()) { setErr("Please enter your " + (method==="phone" ? "phone number" : "email")); return; }
    const c = Math.floor(100000 + Math.random() * 900000).toString();
    setCode(c); setStep(2); setTimer(60); setOtp(""); setErr("");
  };

  const verify = () => {
    if (otp === code) setAuth(true);
    else setErr("Invalid OTP. Try again.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <CreditCard className="w-10 h-10 text-blue-600"/>
          </div>
          <h1 className="text-4xl font-bold text-white mb-1">HaitiCard</h1>
          <p className="text-blue-200 text-sm">Kat ou pou lavi dijital ou 🇭🇹</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-sm mb-5">Sign in to your wallet</p>
              <div className="flex gap-2 mb-5">
                {[["phone","Phone",Phone],["email","Email",Mail]].map(([id,l,I]) => (
                  <button key={id} onClick={() => { setMethod(id); setVal(""); setErr(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${method===id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"}`}>
                    <I className="w-4 h-4"/>{l}
                  </button>
                ))}
              </div>
              <input type={method==="phone" ? "tel" : "email"} value={val} onChange={onVal}
                placeholder={method==="phone" ? "+509 XXXX-XXXX" : "your@email.com"}
                className={`w-full px-4 py-3 border-2 rounded-xl text-base mb-2 focus:outline-none ${err ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}/>
              {err && <p className="text-red-500 text-xs mb-3">{err}</p>}
              <button onClick={sendOtp} className="w-full mt-3 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700">
                Send OTP Code
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => { setStep(1); setErr(""); }} className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                <ArrowLeft className="w-4 h-4"/> Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-500 text-sm mb-3">Code sent to <strong>{val}</strong></p>
              <div className="bg-blue-50 rounded-xl p-3 mb-4 text-center border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Demo OTP Code:</p>
                <p className="text-3xl font-bold text-blue-700 tracking-widest">{code}</p>
              </div>
              <input type="text" value={otp} onChange={onOtp} placeholder="000000" maxLength={6}
                className={`w-full px-4 py-4 border-2 rounded-xl text-3xl font-bold text-center tracking-widest focus:outline-none mb-2 ${err ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}/>
              {err && <p className="text-red-500 text-xs mb-2">{err}</p>}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5"/> {timer > 0 ? `${timer}s` : "Expired"}
                </p>
                <button onClick={sendOtp} disabled={timer > 0}
                  className={`text-xs font-bold flex items-center gap-1 ${timer > 0 ? "text-gray-300" : "text-blue-600"}`}>
                  <RefreshCw className="w-3.5 h-3.5"/> Resend
                </button>
              </div>
              <button onClick={verify} disabled={otp.length < 6}
                className={`w-full py-4 rounded-xl font-bold text-base ${otp.length===6 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                Verify & Login
              </button>
            </>
          )}
          <p className="text-center text-xs text-gray-400 mt-4">🔒 HaitiCard · Haiti 🇭🇹</p>
        </div>
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomePage({ go }) {
  const { balance, transactions, showBal, setShowBal, unread, notifications, markRead, markAllRead } = useW();
  const [showNotif, setShowNotif] = useState(false);

  const actions = [
    { l:"Fund",    I:Plus,       p:"fund",    g:"from-green-500 to-emerald-600" },
    { l:"Send",    I:Send,       p:"send",    g:"from-blue-500 to-blue-700"    },
    { l:"Receive", I:Download,   p:"receive", g:"from-violet-500 to-purple-700" },
    { l:"Card",    I:CreditCard, p:"card",    g:"from-orange-400 to-red-500"   },
  ];
  const income = transactions.filter(t => isCredit(t.type)).reduce((a,t) => a+t.amount, 0);
  const out    = transactions.filter(t => !isCredit(t.type)).reduce((a,t) => a+t.amount, 0);

  return (
    <div className="pb-20 bg-gray-50">
      {showNotif && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)}>
          <div className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button onClick={markAllRead} className="text-xs text-blue-600 font-semibold">Mark all read</button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0,6).map((n,i) => (
                <button key={n.id} onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left border-b border-gray-50 last:border-0 ${!n.read ? "bg-blue-50/60" : "hover:bg-gray-50"}`}>
                  <NotifIcon type={n.type}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">{n.message}</p>
                    <p className="text-xs text-gray-400">{n.ts}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"/>}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowNotif(false); go("notifications"); }}
              className="w-full py-3 text-blue-600 text-sm font-bold border-t border-gray-100">
              View All
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-4 pt-12 pb-10">
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-blue-200 text-sm mb-0.5">Good morning 👋</p>
            <h1 className="text-white text-xl font-bold">Peter Philentrope</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotif(!showNotif)}
              className="relative w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white"/>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold px-1">
                  {unread}
                </span>
              )}
            </button>
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-bold text-sm">PP</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm">Available Balance</p>
            <button onClick={() => setShowBal(!showBal)} className="text-blue-200">
              {showBal ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
          <h2 className="text-white text-4xl font-bold tracking-tight mb-3">
            {showBal ? fmt(balance) : "••••••"}
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-blue-200 text-xs">@peterp · HC-2024-001</p>
            <div className="flex gap-4">
              <div className="text-right"><p className="text-xs font-bold text-green-400">+{fmt(income)}</p><p className="text-blue-200 text-xs">In</p></div>
              <div className="text-right"><p className="text-xs font-bold text-red-400">-{fmt(out)}</p><p className="text-blue-200 text-xs">Out</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5">
        <Crd className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {actions.map(({ l, I, p, g }) => (
              <button key={l} onClick={() => go(p)} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 bg-gradient-to-br ${g} rounded-xl flex items-center justify-center shadow`}>
                  <I className="w-6 h-6 text-white"/>
                </div>
                <span className="text-xs font-semibold text-gray-600">{l}</span>
              </button>
            ))}
          </div>
        </Crd>
      </div>

      <div className="px-4 mt-5">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-4 flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 font-extrabold text-lg">W</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Get a Free Wise Account</p>
            <p className="text-green-100 text-xs">Send money worldwide at real rates</p>
          </div>
          <a href={WISE_LINK} target="_blank" rel="noopener noreferrer"
            className="bg-white text-green-600 text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap flex-shrink-0">
            Join →
          </a>
        </div>
      </div>

      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <SecTitle>Recent Activity</SecTitle>
          <button onClick={() => go("activity")} className="text-xs text-blue-600 font-semibold">See all</button>
        </div>
        <Crd>
          {transactions.slice(0,5).map((tx,i) => <TxRow key={tx.id} tx={tx} last={i===4}/>)}
        </Crd>
      </div>

      <div className="px-4 mt-5 mb-2">
        <div className="flex items-center justify-between mb-3">
          <SecTitle>Partners</SecTitle>
          <button onClick={() => go("partners")} className="text-xs text-blue-600 font-semibold">View all</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[["W","Wise","bg-green-500"],["$","Cash App","bg-gray-900"],["P","PayPal","bg-blue-600"],["₮","USDT","bg-teal-500"]].map(([l,name,c]) => (
            <button key={name} onClick={() => go("partners")} className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-12 ${c} rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm`}>{l}</div>
              <span className="text-xs text-gray-500">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MY MONEY ──────────────────────────────────────────────────────────────────
function MyMoneyPage({ go }) {
  const { balance, transactions, pendingFunds } = useW();
  const income  = transactions.filter(t => isCredit(t.type)).reduce((a,t) => a+t.amount, 0);
  const expense = transactions.filter(t => !isCredit(t.type)).reduce((a,t) => a+t.amount, 0);
  const cards   = transactions.filter(t => t.type==="card").reduce((a,t) => a+t.amount, 0);
  const pendingTotal = pendingFunds.filter(f => f.status==="pending").reduce((a,f) => a+f.amount, 0);

  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-violet-600 to-purple-800 px-4 pt-12 pb-8">
        <h1 className="text-white text-xl font-bold mb-6">My Money</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
            <p className="text-purple-200 text-xs mb-1">Available</p>
            <p className="text-white text-2xl font-bold">{fmt(balance)}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
            <p className="text-purple-200 text-xs mb-1">Pending</p>
            <p className="text-white text-2xl font-bold">{fmt(pendingTotal)}</p>
          </div>
        </div>
      </div>
      <div className="px-4 mt-5 space-y-4">
        <Crd className="p-4">
          <p className="font-bold text-gray-800 mb-4 text-sm">Summary</p>
          {[["Total Received",fmt(income),"text-green-600"],["Total Sent",fmt(expense),"text-red-500"],["Card Purchases",fmt(cards),"text-blue-600"],["Net Balance",fmt(balance),"text-gray-900"]].map(([l,v,c],i,a) => (
            <div key={l} className={`flex justify-between py-2.5 ${i < a.length-1 ? "border-b border-gray-50" : ""}`}>
              <span className="text-sm text-gray-500">{l}</span>
              <span className={`font-bold text-sm ${c}`}>{v}</span>
            </div>
          ))}
        </Crd>

        {pendingFunds.length > 0 && (
          <div>
            <SecTitle>Pending Requests</SecTitle>
            <Crd className="overflow-hidden">
              {pendingFunds.map((f,i) => (
                <div key={f.id} className={`flex items-center gap-3 p-4 ${i < pendingFunds.length-1 ? "border-b border-gray-50" : ""}`}>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{f.method}</p>
                    <p className="text-xs text-gray-400">{f.ts}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{fmt(f.amount)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.status==="approved" ? "bg-green-100 text-green-600" : f.status==="rejected" ? "bg-red-100 text-red-500" : "bg-yellow-100 text-yellow-600"}`}>
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </Crd>
          </div>
        )}

        <button onClick={() => go("fund")}
          className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <Plus className="w-5 h-5"/> Fund My Wallet
        </button>
      </div>
    </div>
  );
}

// ── FUND WALLET ───────────────────────────────────────────────────────────────
function FundWalletPage({ go }) {
  const { addFunds, addPending, balance } = useW();
  const [tab, setTab] = useState("mobile");
  const [mAmt,  setMAmt]    = useState(""); const [mMeth, setMMeth] = useState(""); const [mDone, setMDone] = useState(false);
  const [caSender, setCaSender] = useState(""); const [caAmt, setCaAmt] = useState(""); const [caRef, setCaRef] = useState(""); const [caDone, setCaDone] = useState(false);
  const [ppEmail, setPpEmail] = useState(""); const [ppAmt, setPpAmt] = useState(""); const [ppDone, setPpDone] = useState(false);
  const [uAmt, setUAmt] = useState(""); const [uNet, setUNet] = useState("trc20"); const [uDone, setUDone] = useState(false);

  const onMAmt     = useCallback(e => setMAmt(e.target.value), []);
  const onCaSender = useCallback(e => setCaSender(e.target.value), []);
  const onCaAmt    = useCallback(e => setCaAmt(e.target.value), []);
  const onCaRef    = useCallback(e => setCaRef(e.target.value), []);
  const onPpEmail  = useCallback(e => setPpEmail(e.target.value), []);
  const onPpAmt    = useCallback(e => setPpAmt(e.target.value), []);
  const onUAmt     = useCallback(e => setUAmt(e.target.value), []);

  if (mDone)  return <Done title="Request Submitted!"  sub={`${fmt(parseFloat(mAmt))} via ${mMeth} — pending.`}      onHome={() => { go("home"); setMDone(false);  setMAmt("");  setMMeth("");  }}/>;
  if (caDone) return <Done title="Cash App Request!"   sub={`${fmt(parseFloat(caAmt))} from ${caSender}. Ref: ${caRef}`}  onHome={() => { go("home"); setCaDone(false); setCaSender(""); setCaAmt(""); setCaRef("");  }}/>;
  if (ppDone) return <Done title="PayPal Request!"     sub={`${fmt(parseFloat(ppAmt))} from ${ppEmail} submitted.`}  onHome={() => { go("home"); setPpDone(false); setPpEmail(""); setPpAmt(""); }}/>;
  if (uDone)  return <Done title="USDT Received! ✅"  sub={`${fmt(parseFloat(uAmt))} added to your wallet.`}        onHome={() => { go("home"); setUDone(false);  setUAmt(""); }}/>;

  const TABS = [{id:"mobile",l:"Mobile 📱"},{id:"cashapp",l:"Cash App"},{id:"paypal",l:"PayPal"},{id:"usdt",l:"USDT ₮"}];

  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-4 pt-12 pb-8">
        <BackBtn onClick={() => go("money")}/>
        <h1 className="text-white text-xl font-bold">Funding Center</h1>
        <p className="text-green-200 text-sm">Balance: {fmt(balance)}</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${tab===t.id ? "bg-white text-green-700" : "bg-white/20 text-white"}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {tab === "mobile" && <>
          <Crd className="p-4">
            <p className="text-sm font-bold text-gray-700 mb-3">Amount (USD)</p>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
              <input type="number" value={mAmt} onChange={onMAmt} placeholder="0.00"
                className="w-full pl-9 pr-4 py-4 border-2 border-gray-200 rounded-xl text-3xl font-bold focus:border-green-500 focus:outline-none"/>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[25,50,100,200].map(n => (
                <button key={n} onClick={() => setMAmt(String(n))}
                  className={`py-2 rounded-xl text-sm font-bold border-2 ${mAmt===String(n) ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}>
                  ${n}
                </button>
              ))}
            </div>
          </Crd>
          <div className="space-y-2">
            {[["📱","MonCash","Digicel"],["📱","NatCash","Natcom"],["🏦","Bank Transfer","Local bank"],["🏪","Cash Agent","Nearest agent"]].map(([icon,lbl,desc]) => (
              <button key={lbl} onClick={() => setMMeth(lbl)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 bg-white ${mMeth===lbl ? "border-green-500 bg-green-50" : "border-gray-100"}`}>
                <span className="text-2xl">{icon}</span>
                <div className="flex-1 text-left"><p className="font-bold text-sm">{lbl}</p><p className="text-xs text-gray-400">{desc}</p></div>
                {mMeth===lbl && <CheckCircle className="w-5 h-5 text-green-500"/>}
              </button>
            ))}
          </div>
          <a href={`https://wa.me/50947954115?text=${encodeURIComponent(`Hi HaitiCard! Fund via ${mMeth||"mobile money"} - Amount: ${mAmt ? fmt(parseFloat(mAmt)) : "TBD"}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-2xl font-bold text-sm">
            💬 Fund via WhatsApp
          </a>
          <button onClick={() => { if(mAmt&&mMeth) { addPending({method:mMeth,amount:parseFloat(mAmt),ref:"MOB-"+uid().slice(0,6)}); setMDone(true); }}} disabled={!mAmt||!mMeth}
            className={`w-full py-4 rounded-2xl font-bold ${mAmt&&mMeth ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {mAmt&&mMeth ? `Submit ${fmt(parseFloat(mAmt))} Request` : "Fund Wallet"}
          </button>
        </>}

        {tab === "cashapp" && <>
          <Crd className="p-4">
            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">$</span></div>
              <div><p className="text-white font-bold text-sm">Send to Cash App</p><p className="text-green-400 font-bold">{CASHAPP_TAG}</p></div>
            </div>
            <p className="text-xs text-gray-500 mb-4">Send USD to <strong>{CASHAPP_TAG}</strong>, then fill in details below.</p>
            <div className="space-y-3">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Your Cash App Username</label>
                <input type="text" value={caSender} onChange={onCaSender} placeholder="$yourCashApp"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"/></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Amount (USD)</label>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" value={caAmt} onChange={onCaAmt} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"/></div></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Transaction Reference ID</label>
                <input type="text" value={caRef} onChange={onCaRef} placeholder="#ABCD1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"/></div>
            </div>
          </Crd>
          <Crd className="p-3 bg-yellow-50 border-yellow-100"><p className="text-xs text-yellow-800">⏱ <strong>15-30 min</strong> processing after payment verification.</p></Crd>
          <button onClick={() => { if(caSender&&caAmt&&caRef) { addPending({method:"Cash App",amount:parseFloat(caAmt),ref:caRef,sender:caSender}); setCaDone(true); }}} disabled={!caSender||!caAmt||!caRef}
            className={`w-full py-4 rounded-2xl font-bold ${caSender&&caAmt&&caRef ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            Submit Cash App Request
          </button>
        </>}

        {tab === "paypal" && <>
          <Crd className="p-4">
            <div className="flex items-center gap-3 p-3 bg-blue-600 rounded-xl mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"><span className="text-blue-600 font-bold text-xl">P</span></div>
              <div><p className="text-white font-bold text-sm">Send via PayPal</p><p className="text-blue-200 text-xs">{ME.email}</p></div>
            </div>
            <p className="text-xs text-gray-500 mb-4">Send to <strong>{ME.email}</strong>, then fill in details below.</p>
            <div className="space-y-3">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Your PayPal Email</label>
                <input type="email" value={ppEmail} onChange={onPpEmail} placeholder="you@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Amount (USD)</label>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" value={ppAmt} onChange={onPpAmt} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div></div>
            </div>
          </Crd>
          <button onClick={() => { if(ppEmail&&ppAmt) { addPending({method:"PayPal",amount:parseFloat(ppAmt),ref:ppEmail}); setPpDone(true); }}} disabled={!ppEmail||!ppAmt}
            className={`w-full py-4 rounded-2xl font-bold ${ppEmail&&ppAmt ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            Submit PayPal Request
          </button>
        </>}

        {tab === "usdt" && <>
          <Crd className="p-4">
            <div className="flex gap-2 mb-4">
              {[["trc20","TRC20"],["bep20","BEP20"]].map(([id,l]) => (
                <button key={id} onClick={() => setUNet(id)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 ${uNet===id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-500"}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mb-4">
              <p className="text-xs text-teal-700 font-semibold mb-1">USDT {uNet.toUpperCase()} Address:</p>
              <p className="text-xs font-mono text-teal-900 break-all">{uNet==="trc20" ? USDT_TRC20 : USDT_BEP20}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (USDT)</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input type="number" value={uAmt} onChange={onUAmt} placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"/></div>
            </div>
          </Crd>
          <Crd className="p-3 bg-teal-50 border-teal-100"><p className="text-xs text-teal-800">⚡ <strong>Mock instant</strong> — simulated demo. 1 USDT = 1 USD.</p></Crd>
          <button onClick={() => { if(uAmt) { addFunds(parseFloat(uAmt),"USDT",`USDT ${uNet.toUpperCase()} deposit`); setUDone(true); }}} disabled={!uAmt}
            className={`w-full py-4 rounded-2xl font-bold ${uAmt ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {uAmt ? `Confirm ${fmt(parseFloat(uAmt))} USDT` : "Enter Amount"}
          </button>
        </>}
      </div>
    </div>
  );
}

// ── SEND MONEY ────────────────────────────────────────────────────────────────
function SendMoneyPage({ go }) {
  const { contacts, balance, sendMoney } = useW();
  const [step,   setStep]   = useState(1);
  const [recip,  setRecip]  = useState(null);
  const [amount, setAmount] = useState("");
  const [note,   setNote]   = useState("");
  const [search, setSearch] = useState("");
  const [manual, setManual] = useState("");
  const [err,    setErr]    = useState("");
  const [done,   setDone]   = useState(false);

  const onSearch = useCallback(e => setSearch(e.target.value), []);
  const onAmount = useCallback(e => { setAmount(e.target.value); setErr(""); }, []);
  const onNote   = useCallback(e => setNote(e.target.value), []);
  const onManual = useCallback(e => setManual(e.target.value), []);

  const filtered = contacts.filter(r =>
    r.displayName.toLowerCase().includes(search.toLowerCase()) ||
    r.username.toLowerCase().includes(search.toLowerCase())
  );

  const handle = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setErr("Enter a valid amount"); return; }
    if (amt > balance) { setErr(`Insufficient balance. You have ${fmt(balance)}`); return; }
    const name   = recip ? recip.displayName : (manual || "Unknown");
    const handle = recip ? "@" + recip.username : manual;
    if (sendMoney(name, handle, amt, note)) setDone(true);
    else setErr(`Insufficient balance. You have ${fmt(balance)}`);
  };

  if (done) return <Done title="Money Sent! 🎉" sub={`${fmt(parseFloat(amount))} sent to ${recip?.displayName||manual}`}
    onHome={() => { go("home"); setStep(1); setRecip(null); setAmount(""); setNote(""); setManual(""); setDone(false); }}/>;

  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 pt-12 pb-8">
        <BackBtn onClick={() => step > 1 ? setStep(step-1) : go("home")}/>
        <div className="flex justify-between items-start">
          <div><h1 className="text-white text-xl font-bold">Send Money</h1><p className="text-blue-200 text-xs mt-1">Balance: {fmt(balance)}</p></div>
          <button onClick={() => go("contacts")} className="bg-white/20 text-white text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5"/> Contacts
          </button>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[1,2].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full ${step>=s ? "bg-white" : "bg-white/30"}`}/>)}
        </div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {step === 1 && <>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="text" value={search} onChange={onSearch} placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm"/>
          </div>
          {contacts.filter(r => r.fav).length > 0 && <>
            <SecTitle>⭐ Favorites</SecTitle>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {contacts.filter(r => r.fav).map(r => (
                <button key={r.id} onClick={() => { setRecip(r); setStep(2); }} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <Av initials={initials(r.displayName)} size="lg"/>
                  <span className="text-xs font-medium text-gray-600 max-w-16 text-center truncate">{r.displayName.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </>}
          <SecTitle>All Contacts</SecTitle>
          <Crd className="overflow-hidden">
            {filtered.length === 0
              ? <div className="p-8 text-center"><p className="text-gray-400 text-sm">No contacts found</p></div>
              : filtered.map((r,i) => (
                <button key={r.id} onClick={() => { setRecip(r); setStep(2); }}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 ${i<filtered.length-1 ? "border-b border-gray-50" : ""}`}>
                  <Av initials={initials(r.displayName)}/>
                  <div className="flex-1"><p className="font-semibold text-gray-900 text-sm">{r.displayName}</p><p className="text-xs text-gray-400">@{r.username} · {r.walletId}</p></div>
                  <ChevronRight className="w-4 h-4 text-gray-300"/>
                </button>
              ))
            }
          </Crd>
          <SecTitle>Or Send to Wallet ID</SecTitle>
          <Crd className="p-4">
            <input type="text" value={manual} onChange={onManual} placeholder="@username or HC-XXXX-XXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
            {manual.trim() && (
              <button onClick={() => { setRecip(null); setStep(2); }} className="w-full mt-3 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm">
                Continue with {manual}
              </button>
            )}
          </Crd>
        </>}

        {step === 2 && <>
          <Crd className="p-4 flex items-center gap-3">
            <Av initials={recip ? initials(recip.displayName) : (manual.slice(0,2).toUpperCase()||"??")} size="lg"/>
            <div><p className="font-bold text-gray-900">{recip?.displayName||manual}</p><p className="text-sm text-gray-400">{recip ? `@${recip.username} · ${recip.walletId}` : manual}</p></div>
            <button onClick={() => setStep(1)} className="ml-auto w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-500"/></button>
          </Crd>
          <Crd className="p-4 space-y-4">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Amount (USD)</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                <input type="number" value={amount} onChange={onAmount} placeholder="0.00"
                  className={`w-full pl-9 pr-4 py-4 border-2 rounded-xl text-3xl font-bold focus:outline-none ${err ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}/>
              </div>
              {err && <p className="text-red-500 text-xs mt-1.5">{err}</p>}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[10,20,50,100].map(n => (
                  <button key={n} onClick={() => { setAmount(String(n)); setErr(""); }}
                    className={`py-2 rounded-xl text-sm font-bold border-2 ${amount===String(n) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>${n}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Note (optional)</p>
              <input type="text" value={note} onChange={onNote} placeholder="What's this for?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
            </div>
          </Crd>
          {amount && parseFloat(amount) > 0 && !err && (
            <Crd className="p-4 bg-blue-50 border-blue-100">
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Sending</span><span className="font-bold">{fmt(parseFloat(amount))}</span></div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Fee</span><span className="font-bold text-green-600">Free</span></div>
              <div className="flex justify-between text-sm border-t border-blue-200 pt-2 mt-2">
                <span className="font-bold">New Balance</span>
                <span className={`font-bold ${balance-parseFloat(amount) >= 0 ? "text-blue-700" : "text-red-500"}`}>{fmt(balance - parseFloat(amount))}</span>
              </div>
            </Crd>
          )}
          <button onClick={handle} disabled={!amount||parseFloat(amount)<=0||!!err}
            className={`w-full py-4 rounded-2xl font-bold text-base ${amount&&parseFloat(amount)>0&&!err ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {amount&&parseFloat(amount)>0 ? `Send ${fmt(parseFloat(amount))} to ${(recip?.displayName||manual||"").split(" ")[0]}` : "Enter Amount"}
          </button>
        </>}
      </div>
    </div>
  );
}

// ── RECEIVE ───────────────────────────────────────────────────────────────────
function ReceiveMoneyPage({ go }) {
  const [copied, setCopied] = useState(false);
  const link = "haiticard.app/pay/peterp";
  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-violet-600 to-purple-800 px-4 pt-12 pb-8">
        <BackBtn onClick={() => go("home")}/>
        <h1 className="text-white text-xl font-bold">Receive Money</h1>
      </div>
      <div className="px-4 mt-5 space-y-4">
        <Crd className="p-6 text-center">
          <div className="w-52 h-52 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <div><QrCode className="w-20 h-20 text-gray-300 mx-auto mb-2"/><p className="text-xs text-gray-400">QR Code</p></div>
          </div>
          <h2 className="text-xl font-bold">Peter Philentrope</h2>
          <p className="text-gray-400 text-sm mb-3">@peterp</p>
          <div className="bg-violet-50 rounded-xl px-4 py-2 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"/>
            <p className="text-violet-700 text-sm font-mono font-bold">HC-2024-001</p>
          </div>
        </Crd>
        <Crd className="p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Payment Link</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="flex-1 text-sm text-gray-600 truncate font-mono">{link}</p>
            <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }}
              className={`p-2 rounded-lg ${copied ? "bg-green-100" : "bg-white border border-gray-200"}`}>
              {copied ? <CheckCircle className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4 text-gray-500"/>}
            </button>
          </div>
          {copied && <p className="text-green-600 text-xs mt-2">✓ Copied!</p>}
        </Crd>
        <button className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5"/> Share Payment Link
        </button>
      </div>
    </div>
  );
}

// ── CONTACTS ──────────────────────────────────────────────────────────────────
function ContactsPage({ go }) {
  const { contacts, addContact, removeContact, toggleFav } = useW();
  const [showForm, setShowForm] = useState(false);
  const [dname,    setDname]    = useState("");
  const [uname,    setUname]    = useState("");
  const [search,   setSearch]   = useState("");
  const [err,      setErr]      = useState("");

  const onDname  = useCallback(e => setDname(e.target.value), []);
  const onUname  = useCallback(e => setUname(e.target.value), []);
  const onSearch = useCallback(e => setSearch(e.target.value), []);

  const handleAdd = () => {
    if (!dname.trim() || !uname.trim()) { setErr("All fields required"); return; }
    if (contacts.find(c => c.username === uname.trim().replace("@",""))) { setErr("Contact already exists"); return; }
    addContact({ username:uname.trim().replace("@",""), displayName:dname.trim(), walletId:`HC-${uid().slice(0,4)}` });
    setDname(""); setUname(""); setShowForm(false); setErr("");
  };

  const filtered = contacts.filter(c =>
    c.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 px-4 pt-12 pb-8">
        <BackBtn onClick={() => go("home")}/>
        <div className="flex justify-between items-center">
          <div><h1 className="text-white text-xl font-bold">Contacts</h1><p className="text-indigo-200 text-sm">{contacts.length} contacts</p></div>
          <button onClick={() => { setShowForm(!showForm); setErr(""); }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {showForm ? <X className="w-5 h-5 text-white"/> : <UserPlus className="w-5 h-5 text-white"/>}
          </button>
        </div>
      </div>
      <div className="px-4 mt-5 space-y-4">
        {showForm && (
          <Crd className="p-4 space-y-3">
            <p className="font-bold text-gray-800 text-sm">Add New Contact</p>
            <input type="text" value={dname} onChange={onDname} placeholder="Display Name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
            <input type="text" value={uname} onChange={onUname} placeholder="@username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
            {err && <p className="text-red-500 text-xs">{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(false); setDname(""); setUname(""); setErr(""); }}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={handleAdd} disabled={!dname.trim()||!uname.trim()}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-white ${dname.trim()&&uname.trim() ? "bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}>Add</button>
            </div>
          </Crd>
        )}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input type="text" value={search} onChange={onSearch} placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm"/>
        </div>
        <Crd className="overflow-hidden">
          {filtered.length === 0
            ? <div className="p-10 text-center"><UserPlus className="w-10 h-10 text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm mb-3">{search ? "No results" : "No contacts yet"}</p><button onClick={() => setShowForm(true)} className="text-blue-600 text-sm font-bold">+ Add Contact</button></div>
            : filtered.map((c,i) => (
              <div key={c.id} className={`flex items-center gap-3 p-4 ${i<filtered.length-1 ? "border-b border-gray-50" : ""}`}>
                <Av initials={initials(c.displayName)}/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{c.displayName}</p>
                  <p className="text-xs text-gray-400">@{c.username} · {c.walletId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleFav(c.id)} className={`w-8 h-8 rounded-full flex items-center justify-center ${c.fav ? "bg-yellow-100" : "bg-gray-100"}`}>
                    <Star className={`w-4 h-4 ${c.fav ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}/>
                  </button>
                  <button onClick={() => go("send")} className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center"><Send className="w-4 h-4 text-blue-500"/></button>
                  <button onClick={() => removeContact(c.id)} className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-400"/></button>
                </div>
              </div>
            ))
          }
        </Crd>
      </div>
    </div>
  );
}

// ── ACTIVITY ──────────────────────────────────────────────────────────────────
function ActivityPage() {
  const { transactions } = useW();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const onSearch = useCallback(e => setSearch(e.target.value), []);

  const FILTERS = ["all","received","sent","card","funded","withdrawal"];
  const list = transactions.filter(tx =>
    (filter==="all" || tx.type===filter) &&
    (tx.name.toLowerCase().includes(search.toLowerCase()) || (tx.note||"").toLowerCase().includes(search.toLowerCase()))
  );
  const totalIn  = list.filter(t => isCredit(t.type)).reduce((a,t) => a+t.amount, 0);
  const totalOut = list.filter(t => !isCredit(t.type)).reduce((a,t) => a+t.amount, 0);

  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-4 pt-12 pb-6">
        <h1 className="text-white text-xl font-bold mb-4">Activity</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input type="text" value={search} onChange={onSearch} placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-gray-500 rounded-xl text-sm focus:outline-none"/>
        </div>
      </div>
      <div className="bg-gray-900 px-4 pb-4 flex gap-4">
        <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-3"><p className="text-green-400 text-xs mb-0.5">Money In</p><p className="text-green-400 font-bold">+{fmt(totalIn)}</p></div>
        <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-xs mb-0.5">Money Out</p><p className="text-red-400 font-bold">-{fmt(totalOut)}</p></div>
      </div>
      <div className="flex gap-2 px-4 py-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${filter===f ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      <div className="px-4">
        <Crd className="overflow-hidden">
          {list.length === 0
            ? <div className="p-12 text-center"><Activity className="w-10 h-10 text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">No transactions found</p></div>
            : list.map((tx,i) => <TxRow key={tx.id} tx={tx} last={i===list.length-1}/>)
          }
        </Crd>
      </div>
    </div>
  );
}

// ── CARD CENTER ───────────────────────────────────────────────────────────────
function CardPage() {
  const { frozen, setFrozen, online, setOnline, daily, setDaily, monthly, setMonthly, transactions, pushNotif } = useW();
  const cardTx    = transactions.filter(t => t.type==="card");
  const cardSpent = cardTx.reduce((a,t) => a+t.amount, 0);

  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 px-4 pt-12 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-xl font-bold">Virtual Card</h1>
          {frozen && <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold">❄️ Frozen</span>}
        </div>
        <div className={`rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${frozen ? "bg-gradient-to-br from-gray-500 to-gray-700" : "bg-gradient-to-br from-gray-900 to-slate-800"}`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16"/>
          <div className="relative">
            <div className="flex justify-between items-start mb-8">
              <div><p className="text-white/50 text-xs uppercase tracking-widest">HaitiCard</p><p className="text-white text-sm font-bold">Virtual Visa</p></div>
              <div className="w-10 h-7 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded"/>
            </div>
            <p className="text-white/90 font-mono text-xl tracking-widest mb-5">•••• •••• •••• 4242</p>
            <div className="flex justify-between items-end">
              <div><p className="text-white/40 text-xs uppercase mb-0.5">Holder</p><p className="text-white text-sm font-semibold">Peter Philentrope</p></div>
              <div><p className="text-white/40 text-xs uppercase mb-0.5">Expires</p><p className="text-white text-sm font-semibold">12/27</p></div>
              <div><p className="text-white/40 text-xs uppercase mb-0.5">CVV</p><p className="text-white text-sm font-semibold">•••</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[["Card Spent",fmt(cardSpent),"text-red-500"],["Transactions",String(cardTx.length),"text-blue-600"]].map(([l,v,c]) => (
            <Crd key={l} className="p-3 text-center"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-xs text-gray-400 mt-0.5">{l}</p></Crd>
          ))}
        </div>
        <Crd className="overflow-hidden">
          <button onClick={() => { setFrozen(!frozen); pushNotif(frozen?"funded":"sent", frozen?"Card unfrozen ✅":"Card frozen ❄️", 0); }}
            className="w-full flex items-center gap-3 p-4 border-b border-gray-50 hover:bg-gray-50">
            {frozen ? <Unlock className="w-5 h-5 text-green-600"/> : <Lock className="w-5 h-5 text-orange-500"/>}
            <div className="flex-1 text-left"><p className="font-semibold text-gray-900 text-sm">{frozen ? "Unfreeze Card" : "Freeze Card"}</p><p className="text-xs text-gray-400">{frozen ? "Card is frozen" : "Temporarily disable"}</p></div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${frozen ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>{frozen ? "Frozen" : "Active"}</span>
          </button>
          <div className="flex items-center gap-3 p-4 border-b border-gray-50">
            <Shield className="w-5 h-5 text-blue-500"/>
            <div className="flex-1"><p className="font-semibold text-gray-900 text-sm">Online Purchases</p><p className="text-xs text-gray-400">International payments</p></div>
            <Tog on={online} onChange={setOnline}/>
          </div>
          <div className="p-4 border-b border-gray-50">
            <div className="flex justify-between mb-3"><p className="font-semibold text-gray-900 text-sm">Daily Limit</p><span className="text-sm font-bold text-blue-600">{fmt(daily)}</span></div>
            <input type="range" min={50} max={500} step={50} value={daily} onChange={e => setDaily(Number(e.target.value))} className="w-full accent-blue-600"/>
            <div className="flex justify-between text-xs text-gray-300 mt-1"><span>$50</span><span>$500</span></div>
          </div>
          <div className="p-4">
            <div className="flex justify-between mb-3"><p className="font-semibold text-gray-900 text-sm">Monthly Limit</p><span className="text-sm font-bold text-blue-600">{fmt(monthly)}</span></div>
            <input type="range" min={100} max={2000} step={100} value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="w-full accent-blue-600"/>
            <div className="flex justify-between text-xs text-gray-300 mt-1"><span>$100</span><span>$2,000</span></div>
          </div>
        </Crd>
        {cardTx.length > 0 && (
          <div><SecTitle>Card Purchases</SecTitle>
            <Crd className="overflow-hidden">{cardTx.slice(0,4).map((tx,i) => <TxRow key={tx.id} tx={tx} last={i===Math.min(3,cardTx.length-1)}/>)}</Crd>
          </div>
        )}
        <Crd className="p-4 bg-orange-50 border-orange-100">
          <p className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2"><Zap className="w-4 h-4"/> Future Integrations</p>
          <div className="flex gap-2 flex-wrap">
            {["Wise Card","Stripe Issuing","Marqeta"].map(p => <span key={p} className="bg-white border border-orange-200 rounded-lg px-2 py-1 text-xs font-semibold text-orange-700">{p}</span>)}
          </div>
        </Crd>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function NotificationsPage({ go }) {
  const { notifications, markRead, markAllRead, unread } = useW();
  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-700 px-4 pt-12 pb-8">
        <BackBtn onClick={() => go("home")}/>
        <div className="flex justify-between items-center">
          <div><h1 className="text-white text-xl font-bold">Notifications</h1><p className="text-blue-200 text-sm">{unread} unread</p></div>
          {unread > 0 && <button onClick={markAllRead} className="bg-white/20 text-white text-xs px-3 py-2 rounded-xl font-semibold">Mark all read</button>}
        </div>
      </div>
      <div className="px-4 mt-5">
        <Crd className="overflow-hidden">
          {notifications.length === 0
            ? <div className="p-12 text-center"><Bell className="w-10 h-10 text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">No notifications</p></div>
            : notifications.map((n,i) => (
              <button key={n.id} onClick={() => markRead(n.id)}
                className={`w-full flex items-start gap-3 p-4 text-left ${i<notifications.length-1 ? "border-b border-gray-50" : ""} ${!n.read ? "bg-blue-50/60" : "hover:bg-gray-50"}`}>
                <NotifIcon type={n.type}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{n.message}</p>
                  {n.amount > 0 && <p className="text-xs font-bold text-green-600 mt-0.5">{fmt(n.amount)}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{n.ts}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"/>}
              </button>
            ))
          }
        </Crd>
      </div>
    </div>
  );
}

// ── PARTNERS ──────────────────────────────────────────────────────────────────
function PartnersPage({ go }) {
  const partners = [
    { name:"Wise",    desc:"International transfers at real rates", tag:"Live",       color:"bg-green-500", link:WISE_LINK,     items:["Personal Account","Business Account","Wise Card","80+ countries"] },
    { name:"Cash App",desc:"Send & receive USD instantly",          tag:"Coming Soon",color:"bg-gray-900",  link:"#",           items:["USD transfers","Cash App Card","Boost rewards","Bitcoin"] },
    { name:"PayPal",  desc:"Global payment platform",              tag:"Coming Soon",color:"bg-blue-600",  link:"#",           items:["PayPal.me link","Business payments","Multi-currency","Buyer protection"] },
    { name:"MonCash", desc:"Digicel mobile money — Haiti's #1",    tag:"Integrated", color:"bg-red-600",   link:"#",           items:["Fund wallet","Withdraw funds","MonCash transfers","Real-time"] },
    { name:"NatCash", desc:"Natcom mobile money service",           tag:"Integrated", color:"bg-blue-500",  link:"#",           items:["Fund wallet","Withdraw funds","NatCash transfers","Quick"] },
  ];

  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-teal-600 to-green-700 px-4 pt-12 pb-8">
        <BackBtn onClick={() => go("home")}/>
        <h1 className="text-white text-xl font-bold">Partner Services</h1>
        <p className="text-teal-200 text-sm mt-1">Financial services powering HaitiCard</p>
      </div>
      <div className="px-4 mt-5 space-y-4">
        {partners.map(p => (
          <Crd key={p.name} className="overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center shadow`}>
                    <span className="text-white font-bold text-lg">{p.name[0]}</span>
                  </div>
                  <div><p className="font-bold text-gray-900">{p.name}</p><p className="text-xs text-gray-400">{p.desc}</p></div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.tag==="Live" ? "bg-green-100 text-green-700" : p.tag==="Integrated" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{p.tag}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {p.items.map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0"/>{item}
                  </div>
                ))}
              </div>
              {p.link !== "#"
                ? <a href={p.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-green-600 text-white py-3 rounded-xl font-bold text-sm">Get {p.name} Account →</a>
                : <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed">Coming Soon</button>
              }
            </div>
          </Crd>
        ))}
        <Crd className="p-4 bg-blue-50 border-blue-100">
          <p className="text-sm font-bold text-blue-800 mb-2">🚀 Roadmap</p>
          <div className="flex gap-2 flex-wrap">
            {["Payoneer","Remitly","Zelle","Venmo","WorldRemit","BTC"].map(p => (
              <span key={p} className="bg-white border border-blue-100 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600">{p}</span>
            ))}
          </div>
        </Crd>
      </div>
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
function AdminPage({ go }) {
  const { transactions, pendingFunds, notifications, approveFunding, rejectFunding } = useW();
  const [tab,      setTab]      = useState("overview");
  const [pw,       setPw]       = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [err,      setErr]      = useState("");
  const onPw = useCallback(e => setPw(e.target.value), []);

  const pending = pendingFunds.filter(f => f.status==="pending");

  if (!unlocked) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Shield className="w-7 h-7 text-red-600"/></div>
          <h2 className="text-xl font-bold">Admin Access</h2>
          <p className="text-gray-500 text-sm">Restricted area</p>
        </div>
        <input type="password" value={pw} onChange={onPw} placeholder="Admin password"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-red-500 mb-2"/>
        {err && <p className="text-red-500 text-xs mb-2">{err}</p>}
        <button onClick={() => { if(pw===ADMIN_PASS) setUnlocked(true); else setErr("Incorrect password"); }}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold mb-3">Enter Admin</button>
        <button onClick={() => go("home")} className="w-full text-gray-500 text-sm">← Back to App</button>
      </div>
    </div>
  );

  const TABS = [{id:"overview",l:"Overview"},{id:"funding",l:`Funding (${pending.length})`},{id:"users",l:"Users"},{id:"tx",l:"Transactions"}];

  return (
    <div className="pb-20 bg-gray-100 min-h-screen">
      <div className="bg-gray-900 px-4 pt-12 pb-6">
        <div className="flex justify-between items-center mb-4">
          <div><h1 className="text-white text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-red-400"/> Admin</h1><p className="text-gray-400 text-sm">HaitiCard Dashboard</p></div>
          <button onClick={() => go("home")} className="bg-white/10 text-white p-2 rounded-xl"><LogOut className="w-4 h-4"/></button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${tab===t.id ? "bg-white text-gray-900" : "bg-white/10 text-white"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {tab === "overview" && <>
          <div className="grid grid-cols-2 gap-3">
            {[["Total Users",MOCK_USERS.length,"text-blue-600"],["Transactions",transactions.length,"text-green-600"],["Pending Funds",pending.length,"text-yellow-600"],["Notifications",notifications.length,"text-purple-600"]].map(([l,v,c]) => (
              <Crd key={l} className="p-4 text-center"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-xs text-gray-500">{l}</p></Crd>
            ))}
          </div>
          <SecTitle>Recent Transactions</SecTitle>
          <Crd className="overflow-hidden">{transactions.slice(0,4).map((tx,i) => <TxRow key={tx.id} tx={tx} last={i===3}/>)}</Crd>
        </>}

        {tab === "funding" && (
          pendingFunds.length === 0
            ? <Crd className="p-8 text-center"><p className="text-gray-400">No funding requests</p></Crd>
            : pendingFunds.map(f => (
              <Crd key={f.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-bold text-gray-900 text-sm">{f.method}</p><p className="text-xs text-gray-400">{f.sender||"—"} · {f.ref||"—"} · {f.ts}</p></div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{fmt(f.amount)}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.status==="approved" ? "bg-green-100 text-green-600" : f.status==="rejected" ? "bg-red-100 text-red-500" : "bg-yellow-100 text-yellow-600"}`}>{f.status}</span>
                  </div>
                </div>
                {f.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => approveFunding(f.id)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Check className="w-4 h-4"/> Approve</button>
                    <button onClick={() => rejectFunding(f.id)} className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><XCircle className="w-4 h-4"/> Reject</button>
                  </div>
                )}
              </Crd>
            ))
        )}

        {tab === "users" && (
          <Crd className="overflow-hidden">
            {MOCK_USERS.map((u,i) => (
              <div key={u.id} className={`flex items-center gap-3 p-4 ${i<MOCK_USERS.length-1 ? "border-b border-gray-50" : ""}`}>
                <Av initials={initials(u.displayName)} size="sm"/>
                <div className="flex-1"><p className="font-semibold text-sm text-gray-900">{u.displayName}</p><p className="text-xs text-gray-400">@{u.username} · {u.walletId}</p></div>
                <div className="text-right">
                  <p className="text-sm font-bold">{fmt(u.balance)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.status==="active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{u.status}</span>
                </div>
              </div>
            ))}
          </Crd>
        )}

        {tab === "tx" && (
          <Crd className="overflow-hidden">{transactions.slice(0,10).map((tx,i) => <TxRow key={tx.id} tx={tx} last={i===Math.min(9,transactions.length-1)}/>)}</Crd>
        )}
      </div>
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function ProfilePage({ go }) {
  const { notifPref, setNotifPref, setAuth } = useW();
  return (
    <div className="pb-20 bg-gray-50">
      <div className="bg-gradient-to-br from-gray-800 to-slate-900 px-4 pt-12 pb-8">
        <h1 className="text-white text-xl font-bold mb-6">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">PP</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Peter Philentrope</h2>
            <p className="text-gray-400 text-sm">@peterp · HC-2024-001</p>
            <div className="flex gap-2 mt-1">
              <span className="bg-green-500/20 text-green-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">✓ Verified</span>
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">⚡ Active</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 mt-5 space-y-4">
        <Crd className="overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50"><p className="text-sm font-bold text-gray-700">Personal Information</p></div>
          {[["Full Name","Peter Philentrope"],["Username","@peterp"],["Email",ME.email],["Phone",ME.phone],["Wallet ID","HC-2024-001"]].map(([l,v],i,a) => (
            <div key={l} className={`flex justify-between items-center px-4 py-3.5 ${i<a.length-1 ? "border-b border-gray-50" : ""}`}>
              <span className="text-sm text-gray-400">{l}</span>
              <span className="text-sm font-semibold text-gray-900 truncate max-w-44 text-right">{v}</span>
            </div>
          ))}
        </Crd>

        <div className="grid grid-cols-2 gap-3">
          {[[UserPlus,"Contacts","contacts","bg-indigo-50 text-indigo-600"],[Globe,"Partners","partners","bg-teal-50 text-teal-600"],[Bell,"Notifications","notifications","bg-blue-50 text-blue-600"],[Shield,"Admin","admin","bg-red-50 text-red-600"]].map(([I,l,p,cls]) => (
            <button key={l} onClick={() => go(p)} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50">
              <div className={`w-9 h-9 ${cls} rounded-xl flex items-center justify-center`}><I className="w-5 h-5"/></div>
              <span className="font-semibold text-sm text-gray-900">{l}</span>
            </button>
          ))}
        </div>

        <Crd className="p-4">
          <div className="flex items-center justify-between">
            <div><p className="font-semibold text-sm text-gray-900">Push Notifications</p><p className="text-xs text-gray-400">Transaction alerts</p></div>
            <Tog on={notifPref} onChange={setNotifPref}/>
          </div>
        </Crd>

        <button onClick={() => setAuth(false)} className="w-full border-2 border-red-100 text-red-500 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4"/> Sign Out
        </button>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
function AppRouter({ page, setPage }) {
  const { auth } = useW();
  if (!auth) return <AuthScreen/>;

  const render = () => {
    switch (page) {
      case "home":          return <HomePage go={setPage}/>;
      case "money":         return <MyMoneyPage go={setPage}/>;
      case "fund":          return <FundWalletPage go={setPage}/>;
      case "send":          return <SendMoneyPage go={setPage}/>;
      case "receive":       return <ReceiveMoneyPage go={setPage}/>;
      case "contacts":      return <ContactsPage go={setPage}/>;
      case "activity":      return <ActivityPage/>;
      case "card":          return <CardPage/>;
      case "notifications": return <NotificationsPage go={setPage}/>;
      case "partners":      return <PartnersPage go={setPage}/>;
      case "admin":         return <AdminPage go={setPage}/>;
      case "profile":       return <ProfilePage go={setPage}/>;
      default:              return <HomePage go={setPage}/>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative font-sans">
      {render()}
      <Navbar page={page} setPage={setPage}/>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  return (
    <WalletProvider>
      <AppRouter page={page} setPage={setPage}/>
    </WalletProvider>
  );
}
