import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart3,
  CreditCard,
  Home,
  PieChart as PieChartIcon,
  Settings,
  // Trigger Vercel rebuild (Clean cache deploy)
  Plus,
  Minus,
  X,
  Wallet,
  Trash2,
  Search,
  Filter,
  Edit2,
  CalendarDays,
  Target,
  Repeat,
  Lightbulb,
  Camera,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Users,
  CheckCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Briefcase,
  FileSpreadsheet,
  Bell,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CarFront,
  Gamepad2,
  ShoppingBag,
  Banknote,
  MoreHorizontal,
  Coins,
  Bitcoin,
  GraduationCap,
  Plane,
  Laptop,
  Smartphone,
  Heart,
  Droplet,
  Zap,
  Flame,
  Activity,
  Download,
  Upload,
  Shield,
  Tv2,
  Bot,
  Share2,
  Music
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import { locales } from './locales';
import './index.css';

// Live Currency Exchange Rates will replace these fallbacks

const CURRENCY_SYMBOLS = {
  TRY: '₺',
  USD: '$',
  EUR: '€'
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('nexspend_active_tab') || 'dashboard');

  useEffect(() => {
    localStorage.setItem('nexspend_active_tab', activeTab);
  }, [activeTab]);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('nexspend_theme') || 'dark');

  // Language Validation State
  const [language, setLanguage] = useState(() => localStorage.getItem('nexspend_lang') || 'tr');
  const t = (text) => {
    if (language === 'tr') return text;
    return locales[language]?.[text] || text;
  };

  // Currency & Live Rates State
  const [currency, setCurrency] = useState(() => localStorage.getItem('nexspend_currency') || 'TRY');
  const [rates, setRates] = useState({
    TRY: 1,
    USD: 31.50, // Fallback
    EUR: 34.20  // Fallback
  });

  // V7 & V9: Onboarding (Username) & Custom Reset States
  const [userName, setUserName] = useState(() => localStorage.getItem('nexspend_user') || '');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [tempUserName, setTempUserName] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    // If no username is set, open the custom modal instead of window.prompt
    if (!userName && activeTab === 'dashboard') {
      const timer = setTimeout(() => {
        setIsNameModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userName, activeTab]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempUserName && tempUserName.trim()) {
      setUserName(tempUserName.trim());
      localStorage.setItem('nexspend_user', tempUserName.trim());
    } else {
      setUserName(t('Kullanıcı'));
      localStorage.setItem('nexspend_user', t('Kullanıcı'));
    }
    setIsNameModalOpen(false);
    setTempUserName('');
  };

  const handleResetApp = () => {
    localStorage.clear();
    localStorage.setItem('nexspend_reset', 'true');
    window.location.reload();
  };

  // V17: Backup & Restore System
  const backupFileRef = useRef(null);
  const BACKUP_KEYS = [
    'nexspend_transactions', 'nexspend_goals', 'nexspend_subscriptions',
    'nexspend_debts', 'nexspend_assets', 'nexspend_budget', 'nexspend_theme',
    'nexspend_lang', 'nexspend_currency', 'nexspend_user', 'nexspend_active_tab'
  ];

  const lastBackupDate = localStorage.getItem('nexspend_last_backup');
  const isBackupStale = !lastBackupDate || (Date.now() - new Date(lastBackupDate).getTime()) > 24 * 60 * 60 * 1000;
  const [backupBannerDismissed, setBackupBannerDismissed] = useState(false);

  const handleBackupData = () => {
    const backupData = {};
    BACKUP_KEYS.forEach(key => {
      const val = localStorage.getItem(key);
      if (val !== null) backupData[key] = val;
    });
    backupData._nexspend_backup_version = '1.0';
    backupData._nexspend_backup_date = new Date().toISOString();

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `nexspend_yedek_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);

    localStorage.setItem('nexspend_last_backup', new Date().toISOString());
    setBackupBannerDismissed(true);
  };

  const handleRestoreData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data._nexspend_backup_version) {
          alert('Bu dosya geçerli bir NexSpend yedek dosyası değil!');
          return;
        }
        BACKUP_KEYS.forEach(key => {
          if (data[key] !== undefined) {
            localStorage.setItem(key, data[key]);
          }
        });
        localStorage.setItem('nexspend_last_backup', new Date().toISOString());
        alert('✅ Veriler başarıyla geri yüklendi! Sayfa yenilenecek.');
        window.location.reload();
      } catch (err) {
        alert('Dosya okunamadı. Lütfen geçerli bir .json yedek dosyası seçin.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // V4: Fetch Live Currency Rates
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/TRY')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          // API returns 1 TRY = X USD. We need 1 USD = X TRY (our base multiplier)
          setRates({
            TRY: 1,
            USD: 1 / data.rates.USD,
            EUR: 1 / data.rates.EUR
          });
        }
      })
      .catch(err => console.error("Canlı döviz kurları çekilemedi, fallbacks kullanılacak:", err));
  }, []);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Budget Limit State (Always in TRY conceptually, but we format based on currency)
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const saved = localStorage.getItem('nexspend_budget');
    return saved ? parseFloat(saved) : 50000;
  });
  const [tempBudget, setTempBudget] = useState(budgetLimit);

  // Sync temp budget when modal opens
  useEffect(() => {
    if (isBudgetModalOpen) setTempBudget(budgetLimit);
  }, [isBudgetModalOpen, budgetLimit]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'day', 'week', 'month', 'year'

  // Form States (Transaction)
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txNote, setTxNote] = useState('');
  const [txReceiptStr, setTxReceiptStr] = useState(null);
  const [txIsSplit, setTxIsSplit] = useState(false);
  const [txSplitCount, setTxSplitCount] = useState(2);
  const [isCategoryManual, setIsCategoryManual] = useState(false); // V4: Smart Category Tracker

  // V4: Auto Category Matcher
  useEffect(() => {
    if (!txTitle || isCategoryManual) return;

    const titleLower = txTitle.toLowerCase();
    const keywords = {
      food: ['kahve', 'starbucks', 'yemeksepeti', 'restoran', 'kafe', 'cafe', 'döner', 'kebap', 'mcdonalds', 'burger', 'çiğköfte', 'pizza', 'lokanta', 'getir', 'yemek', 'steak', 'baklava', 'tatlı'],
      shopping: ['migros', 'şok', 'bim', 'a101', 'market', 'amazon', 'trendyol', 'hepsiburada', 'tıraş', 'kozmetik', 'kıyafet', 'giyim', 'zara', 'boyner', 'çiçek', 'n11', 'çiçeksepeti', 'mac', 'sephora'],
      transport: ['taksi', 'martı', 'uber', 'otobüs', 'metro', 'uçak', 'bilet', 'benzin', 'shell', 'opet', 'petrol', 'yol', 'otoyol', 'hgs', 'pegasus', 'thy'],
      entertainment: ['sinema', 'tiyatro', 'konser', 'netflix', 'spotify', 'steam', 'oyun', 'exxen', 'blutv', 'eğlence', 'pubg', 'oyuncak'],
      bills: ['elektrik', 'su', 'doğal gaz', 'doğalgaz', 'internet', 'fatura', 'telekom', 'turkcell', 'vodafone', 'kablo', 'aidat', 'dsmart', 'digiturk'],
      health: ['eczane', 'ilaç', 'hastane', 'doktor', 'muayene', 'vitamin', 'diş', 'psikolog']
    };

    let matchedCategory = '';
    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(w => titleLower.includes(w))) {
        matchedCategory = cat;
        break; // İlk eşleşmeyi al
      }
    }

    if (matchedCategory && txCategory !== matchedCategory) {
      setTxCategory(matchedCategory);
    }
  }, [txTitle, isCategoryManual]);

  // Form States (Goal)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalColor, setGoalColor] = useState('#8b5cf6');
  const [goalIcon, setGoalIcon] = useState('Target');

  // V16: Goal Funds Modal
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundGoalId, setFundGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  // Form States (Subscription)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCategory, setSubCategory] = useState('streaming');
  const [subType, setSubType] = useState('expense'); // V12: 'income' or 'expense'
  const [subDate, setSubDate] = useState('');

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Transactions State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('nexspend_transactions');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Goals State
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('nexspend_goals');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('nexspend_subscriptions');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Debts State
  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('nexspend_debts');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Form States (Debt)
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtPerson, setDebtPerson] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState('i_owe'); // 'i_owe' or 'they_owe'
  const [debtDate, setDebtDate] = useState(new Date().toISOString().split('T')[0]);
  const [debtNote, setDebtNote] = useState('');

  // Assets State & Forms
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('nexspend_assets');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // V15: Live Markets State (Simulation)
  const [markets, setMarkets] = useState([
    { id: 'USD', name: 'Dolar', price: 34.50, change: +0.15, isUp: true, icon: '💵' },
    { id: 'EUR', name: 'Euro', price: 37.10, change: -0.05, isUp: false, icon: '💶' },
    { id: 'GLD', name: 'Altın (Gr)', price: 3050.25, change: +1.20, isUp: true, icon: '🪙' },
    { id: 'SLV', name: 'Gümüş (Gr)', price: 38.60, change: -0.40, isUp: false, icon: '🥈' },
    { id: 'BTC', name: 'Bitcoin', price: 94500.00, change: +2.45, isUp: true, icon: '₿' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(market => {
        if (Math.random() > 0.4) return market;
        const fluctuation = market.price * ((Math.random() * 0.001) + 0.0001);
        const isUp = Math.random() > 0.45;
        const newPrice = isUp ? market.price + fluctuation : market.price - fluctuation;
        const newChange = isUp ? market.change + (fluctuation / 10) : market.change - (fluctuation / 10);
        return {
          ...market,
          price: newPrice,
          change: newChange,
          isUp: isUp,
          flash: isUp ? 'up' : 'down'
        };
      }));

      setTimeout(() => {
        setMarkets(prev => prev.map(m => ({ ...m, flash: null })));
      }, 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('bank'); // 'bank', 'crypto', 'gold', 'stock'
  const [assetValue, setAssetValue] = useState('');

  // Data Persistance Effects
  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light-theme');
    else document.documentElement.classList.remove('light-theme');
    localStorage.setItem('nexspend_theme', theme);
  }, [theme]);

  // V10: Akıllı Auto-Pay Subscriptions Motor (Sonsuz Döngü, Runs on Mount)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setSubscriptions(prevSubs => {
      let hasChanges = false;
      let newTxs = [];

      const updatedSubs = prevSubs.map(sub => {
        if (sub.active && sub.nextBillingDate) {
          const subDate = new Date(sub.nextBillingDate);

          if (!isNaN(subDate.getTime()) && subDate <= today) {
            hasChanges = true;
            let currentSubDate = new Date(subDate);

            // Bugünü yakalayana dek geçmiş ödenmemiş ayları tek tek kes
            while (currentSubDate <= today) {
              const paymentDate = new Date(currentSubDate);

              // 1. Her geciken (veya bugün ödenen) fatura için sırayla işlem yarat
              // V12: Regular Income Support
              const isIncome = sub.type === 'income';

              newTxs.push({
                id: Date.now() + Math.random(),
                date: paymentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
                originalDate: paymentDate.toISOString().split('T')[0],
                title: `${sub.name} (Düzenli ${isIncome ? 'Gelir' : 'Gider'})`,
                note: 'Otomatik Yenileme',
                category: sub.category || (isIncome ? 'income' : 'entertainment'), // V12: Default income category
                amount: isIncome ? Math.abs(sub.amount) : -Math.abs(sub.amount),
                type: isIncome ? 'income' : 'expense',
                currency: 'TRY'
              });

              // 2. Abonelik Tarihini 1 Ay İleri At
              currentSubDate.setMonth(currentSubDate.getMonth() + 1);
            }

            return { ...sub, nextBillingDate: currentSubDate.toISOString().split('T')[0] };
          }
        }
        return sub;
      });

      if (hasChanges && newTxs.length > 0) {
        setTransactions(prevTxs => [...prevTxs, ...newTxs]);
        return updatedSubs;
      }
      return prevSubs;
    });
  }, [subscriptions]); // V12: Added subscriptions as dependency so adding an income Triggers motor immediately

  useEffect(() => localStorage.setItem('nexspend_lang', language), [language]);
  useEffect(() => localStorage.setItem('nexspend_currency', currency), [currency]);
  useEffect(() => localStorage.setItem('nexspend_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('nexspend_budget', budgetLimit.toString()), [budgetLimit]);
  useEffect(() => localStorage.setItem('nexspend_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('nexspend_subscriptions', JSON.stringify(subscriptions)), [subscriptions]);
  useEffect(() => localStorage.setItem('nexspend_debts', JSON.stringify(debts)), [debts]);
  useEffect(() => localStorage.setItem('nexspend_assets', JSON.stringify(assets)), [assets]);


  // Helper: Convert Any Currency to Base (TRY)
  const toBaseCurrency = (amount, fromCurrency) => {
    if (!fromCurrency || fromCurrency === 'TRY') return amount;
    return amount * (rates[fromCurrency] || 1);
  };

  // Helper: Convert Base to Display Currency
  const toDisplayCurrency = (amountInBase) => {
    return amountInBase / rates[currency];
  };

  // Overall Balance calculation (always all-time base currency -> converted to display)
  // V11: Exclude Future Transactions (Pending)
  const totalBalanceBase = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    return transactions.reduce((acc, tx) => {
      // Future Transaction Check
      if (tx.originalDate) {
        const txDateObj = new Date(tx.originalDate);
        txDateObj.setHours(0, 0, 0, 0);
        if (txDateObj > todayDate) return acc; // Skip future transactions (Pending)
      }

      const amtBase = toBaseCurrency(Math.abs(tx.amount), tx.currency || 'TRY');
      return acc + (tx.type === 'income' ? amtBase : -amtBase);
    }, 0);
  }, [transactions]);

  // Period / Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const todayDate = new Date(new Date().toISOString().split('T')[0]);

    return transactions.filter(tx => {
      const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || tx.type === filterType;

      let matchesTime = true;
      if (timeFilter !== 'all' && tx.originalDate) {
        const txDateObj = new Date(tx.originalDate);
        if (isNaN(txDateObj.getTime())) return false;
        const diffTime = todayDate.getTime() - txDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (timeFilter === 'day') matchesTime = diffDays === 0 || txDateObj >= todayDate;
        else if (timeFilter === 'week') matchesTime = diffDays <= 7;
        else if (timeFilter === 'month') matchesTime = diffDays <= 30;
        else if (timeFilter === 'year') matchesTime = diffDays <= 365;
      }
      return matchesSearch && matchesType && matchesTime;
    });
  }, [transactions, searchTerm, filterType, timeFilter]);

  // Period Calculations (Income, Expense, Chart)
  // V11: Exclude Future Transactions from Period Totals
  const { periodIncomeBase, periodExpenseBase, chartData } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryTotals = {};
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    filteredTransactions.forEach(tx => {
      // Future Transaction Check
      if (tx.originalDate) {
        const txDateObj = new Date(tx.originalDate);
        txDateObj.setHours(0, 0, 0, 0);
        if (txDateObj > todayDate) return; // Skip future transactions
      }

      const amtBase = toBaseCurrency(Math.abs(tx.amount), tx.currency || 'TRY');
      if (tx.type === 'income') {
        income += amtBase;
      } else {
        expense += amtBase;
        if (categoryTotals[tx.category]) {
          categoryTotals[tx.category] += amtBase;
        } else {
          categoryTotals[tx.category] = amtBase;
        }
      }
    });

    const pieData = Object.keys(categoryTotals).map(key => ({
      name: key,
      value: toDisplayCurrency(categoryTotals[key])
    }));

    return {
      periodIncomeBase: income,
      periodExpenseBase: expense,
      chartData: pieData
    };
  }, [filteredTransactions, currency]);

  // AI Insights Generation
  const aiInsights = useMemo(() => {
    const insights = [];
    const todayDate = new Date(new Date().toISOString().split('T')[0]);
    const recentExpenses = transactions.filter(t => t.type === 'expense' && toBaseCurrency(Math.abs(t.amount), t.currency) > 0);

    // Subscriptions Insight (V8: Separate Bills from Keyfi/Entertainment Subscriptions)
    // Sadece "Faturalar" (bills) dışındaki (eğlence vb.) ve Gider olan abonelikleri topla
    const totalSubsBase = subscriptions.filter(s => s.active && s.category !== 'bills' && s.type !== 'income').reduce((sum, s) => sum + s.amount, 0);
    if (totalSubsBase > 1000) {
      insights.push({ type: 'warning', text: `Aylık eğlence/keyfi abonelikleriniz yüksek seviyede (${totalSubsBase}₺). Kullanmadığınız servisleri gözden geçirin.` });
    }

    // High single expense insight
    const highExpense = recentExpenses.find(t => toBaseCurrency(Math.abs(t.amount), t.currency) > (budgetLimit * 0.2));
    if (highExpense) {
      insights.push({ type: 'alert', text: `"${highExpense.title}" harcamanız aylık bütçenizin %20'sinden fazla. Büyük harcamalara dikkat!` });
    }

    // Budget pace insight (Needs to be based ONLY on the last 30 days!)
    const currentMonthExpenses = recentExpenses.filter(tx => {
      if (!tx.originalDate) return false;
      const txDateObj = new Date(tx.originalDate);
      const diffTime = todayDate.getTime() - txDateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });

    const currentMonthExpensesBase = currentMonthExpenses.reduce((sum, t) => sum + toBaseCurrency(Math.abs(t.amount), t.currency), 0);

    if (currentMonthExpensesBase > budgetLimit * 0.8) {
      insights.push({ type: 'danger', text: `Son 30 gündeki harcamalarınız bütçenizin %80'ini aştı. Ay sonuna kadar tasarruflu ilerlemelisiniz.` });
    } else if (currentMonthExpensesBase < budgetLimit * 0.3 && currentMonthExpenses.length > 3) {
      insights.push({ type: 'success', text: `Harika gidiyorsunuz! Bu ayki harcamalarınız limitlerinizin oldukça altında, hedeflerinize para aktarabilirsiniz.` });
    }

    // Percentage Comparison Logic based on active timeFilter
    let currentPeriodExpense = 0;
    let previousPeriodExpense = 0;

    if (timeFilter !== 'all') {
      let daysInPeriod = 30; // default month
      if (timeFilter === 'day') daysInPeriod = 1;
      else if (timeFilter === 'week') daysInPeriod = 7;
      else if (timeFilter === 'year') daysInPeriod = 365;

      recentExpenses.forEach(tx => {
        if (!tx.originalDate) return;
        const txDateObj = new Date(tx.originalDate);
        const diffTime = todayDate.getTime() - txDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const amtBase = toBaseCurrency(Math.abs(tx.amount), tx.currency);

        if (diffDays >= 0 && diffDays < daysInPeriod) {
          currentPeriodExpense += amtBase; // Current Period
        } else if (diffDays >= daysInPeriod && diffDays < (daysInPeriod * 2)) {
          previousPeriodExpense += amtBase; // Previous Period
        }
      });

      if (previousPeriodExpense > 0) {
        const percentChange = ((currentPeriodExpense - previousPeriodExpense) / previousPeriodExpense) * 100;
        const formattedPercent = Math.abs(percentChange).toFixed(1);
        const periodName = timeFilter === 'day' ? 'düne' : timeFilter === 'week' ? 'geçen haftaya' : timeFilter === 'month' ? 'geçen aya' : 'geçen yıla';

        if (percentChange > 0) {
          insights.unshift({ type: 'danger', text: `Harcamalarınız ${periodName} göre %${formattedPercent} artış gösterdi. (${formatCurrency(currentPeriodExpense)})` });
        } else {
          insights.unshift({ type: 'success', text: `Tebrikler! ${periodName} göre harcamalarınızı %${formattedPercent} oranında düşürdünüz.` });
        }
      } else if (currentPeriodExpense > 0 && previousPeriodExpense === 0) {
        insights.unshift({ type: 'warning', text: `Bu periyottaki ilk harcamalarınızı yaptınız.` });
      }
    }

    if (insights.length === 0) {
      insights.push({ type: 'success', text: 'Finansal durumunuz stabil ve dengeli. Böyle devam edin!' });
    }

    return insights;
  }, [transactions, subscriptions, budgetLimit, timeFilter]);

  // Derived Debt Calculations
  const { totalOwedToUserBase, totalUserOwesBase } = useMemo(() => {
    let owedToUser = 0;
    let userOwes = 0;
    debts.forEach(d => {
      if (d.status !== 'settled') {
        if (d.type === 'they_owe') owedToUser += d.amount;
        if (d.type === 'i_owe') userOwes += d.amount;
      }
    });
    return {
      totalOwedToUserBase: owedToUser, // Assumed to be in Base Currency (TRY) for simplicity of MVP
      totalUserOwesBase: userOwes
    };
  }, [debts]);

  // Next Expected Regular Income (V12.1 - Sadece En Yakın Sıradaki Gelir)
  const nextExpectedIncome = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aktif gelirleri bul, tarihlerini al ve bugünden sonrakileri sırala
    const upcomingIncomes = subscriptions
      .filter(s => s.active && s.type === 'income' && s.nextBillingDate)
      .map(s => {
        const dateObj = new Date(s.nextBillingDate);
        dateObj.setHours(0, 0, 0, 0);
        return { ...s, dateObj };
      })
      .filter(s => s.dateObj >= today)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    if (upcomingIncomes.length === 0) return null;

    const nextIncome = upcomingIncomes[0];
    const diffTime = nextIncome.dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      amount: nextIncome.amount,
      name: nextIncome.name,
      daysLeft: diffDays
    };
  }, [subscriptions]);

  // Real Safely Spendable Balance (Güvenli Para - Zaman Çizelgesi Nakit Akışı)
  const realBalanceBase = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Tüm aktif abonelikleri ve düzenli gelirleri tarihlerine göre sırala
    const upcomingEvents = subscriptions
      .filter(s => s.active && s.nextBillingDate)
      .map(s => ({
        ...s,
        dateObj: new Date(s.nextBillingDate)
      }))
      .filter(s => s.dateObj >= today)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    // 2. Zaman Tüneli Simülasyonu
    let virtualWallet = 0;
    let maxShortfall = 0;

    upcomingEvents.forEach(event => {
      if (event.type === 'income') {
        virtualWallet += Math.abs(event.amount); // Gelir geldi, sanal cüzdan arttı
      } else {
        virtualWallet -= Math.abs(event.amount); // Gider çıktı, sanal cüzdan azaldı
      }

      // 3. Eğer sanal cüzdan o gün eksiye düştüyse, o ana kadarki EN BÜYÜK AÇIĞI (maksimum eksi miktarını) blokaj olarak kaydet
      if (virtualWallet < 0) {
        maxShortfall = Math.max(maxShortfall, Math.abs(virtualWallet));
      }
    });

    // 4. Mevcut Fiziksel Bakiye - Gelecekte İhtiyaç Duyulacak Olan Max Açık (Blokaj) - Borçlar
    return totalBalanceBase - maxShortfall - totalUserOwesBase;
  }, [totalBalanceBase, subscriptions, totalUserOwesBase]);


  // V4: Calendar Events Calculator
  const calendarEvents = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let events = {};
    for (let i = 1; i <= daysInMonth; i++) {
      events[i] = [];
    }

    // 1. Transactions matching this month
    transactions.forEach(tx => {
      if (!tx.originalDate && !tx.date) return;
      const txDate = new Date(tx.originalDate || tx.date);
      if (isNaN(txDate.getTime())) return;

      if (txDate.getFullYear() === year && txDate.getMonth() === month) {
        const day = txDate.getDate();
        events[day].push({
          id: `tx-${tx.id}`,
          type: tx.type === 'income' ? 'gelir' : 'gider',
          title: tx.title,
          amount: tx.amount,
          color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)'
        });
      }
    });

    // 2. Subscriptions matching this month
    subscriptions.filter(s => s.active).forEach(sub => {
      // V11 Fix: It was sub.date, should be sub.nextBillingDate
      if (!sub.nextBillingDate) return;
      const subDate = new Date(sub.nextBillingDate);
      if (isNaN(subDate.getTime())) return;

      let targetDay = subDate.getDate();
      // Abonelikler her ay döner
      // O ayın gün sayısını geçiyorsa son gün ödenir (Örn: 31 çeken ayda 31, 28 çeken ayda 28)
      if (targetDay > daysInMonth) targetDay = daysInMonth;

      events[targetDay].push({
        id: `sub-${sub.id}`,
        type: sub.type === 'income' ? 'gelir' : 'abonelik',
        title: `🔁 ${sub.name}`,
        amount: sub.type === 'income' ? Math.abs(sub.amount) : -Math.abs(sub.amount),
        color: sub.type === 'income' ? 'var(--success)' : 'var(--accent-primary)'
      });
    });

    // 3. Debts (Pending)
    debts.filter(d => d.status === 'pending').forEach(debt => {
      if (!debt.date) return;
      const dDate = new Date(debt.date);
      if (isNaN(dDate.getTime())) return;

      if (dDate.getFullYear() === year && dDate.getMonth() === month) {
        const day = dDate.getDate();
        events[day].push({
          id: `debt-${debt.id}`,
          type: 'borc',
          title: `🤝 ${debt.personName} (${debt.type === 'i_owe' ? 'Ödenecek' : 'Alınacak'})`,
          amount: debt.type === 'i_owe' ? -Math.abs(debt.amount) : Math.abs(debt.amount),
          color: debt.type === 'i_owe' ? 'var(--danger)' : 'var(--success)'
        });
      }
    });

    return events;
  }, [calendarDate, transactions, subscriptions, debts]);

  // Total Net Worth (Net Portföy / Servet)
  const totalNetWorthBase = useMemo(() => {
    const assetsTotal = assets.reduce((sum, a) => sum + a.value, 0);
    return totalBalanceBase + assetsTotal + totalOwedToUserBase - totalUserOwesBase;
  }, [totalBalanceBase, assets, totalOwedToUserBase, totalUserOwesBase]);

  // Transaction Handlers
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTxReceiptStr(reader.result); // Base64 string

        // --- V3: OCR (Yapay Zeka) Okuyucu Simülasyonu ---
        setTimeout(() => {
          if (!txAmount && !txTitle) {
            const mockAmounts = [350.50, 120.00, 890.99, 45.00, 1250.00];
            const randomAmount = mockAmounts[Math.floor(Math.random() * mockAmounts.length)];

            setTxAmount(randomAmount.toString());
            setTxTitle('Yapay Zeka (Fiş Tarandı)');
            setTxCategory('shopping');

            // Koyu temaya uygun native tarzı minimal bir bildirim hissi için alert
            alert('🤖 Yapay Zeka fişinizi analiz etti ve formu sizin için otomatik doldurdu!');
          }
        }, 1200); // 1.2s gecikme (Çözümleme hissi)
        // ----------------------------------------------
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!txAmount || !txTitle || !txCategory || !txDate) return;

    const amountNum = parseFloat(txAmount);
    let formattedDate = txDate;
    try {
      const parts = txDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        formattedDate = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) { }

    let finalAmount = amountNum;

    // V3: Ortak Harcama (Split) Algoritması
    if (txType === 'expense' && txIsSplit && txSplitCount > 1) {
      finalAmount = amountNum / txSplitCount;
      const othersPortion = amountNum - finalAmount;

      // Diğerlerinin payını otomatik olarak "Alacaklıyım" statüsünde borç defterine yaz
      setDebts([{
        id: Date.now() + 1, // Çakışmayı önlemek için +1
        personName: `Ortak Harcama (${txSplitCount - 1} Kişi)`,
        amount: othersPortion,
        type: 'they_owe',
        date: txDate,
        note: `${txTitle} işlemi Alman Usulü bölüştürüldü`,
        status: 'pending'
      }, ...debts]);
    }

    const newTx = {
      id: Date.now(),
      date: formattedDate,
      originalDate: txDate,
      title: txTitle,
      note: txNote,
      category: txCategory,
      amount: txType === 'expense' ? -Math.abs(finalAmount) : Math.abs(finalAmount), // Kullanıcıya düşen ana pay
      type: txType,
      currency: currency, // Set to current global currency by default
      receiptUrl: txReceiptStr
    };

    setTransactions([newTx, ...transactions]);

    // Reset Process
    setTxAmount('');
    setTxTitle('');
    setTxCategory('');
    setTxNote('');
    setTxReceiptStr(null);
    setTxIsSplit(false);
    setTxSplitCount(2);
    setTxDate(new Date().toISOString().split('T')[0]);
    setIsCategoryManual(false); // Reset auto-category flag
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = (id) => setTransactions(transactions.filter(tx => tx.id !== id));

  // Options Handlers
  const handleSaveBudget = (e) => {
    e.preventDefault();
    setBudgetLimit(parseFloat(tempBudget));
    setIsBudgetModalOpen(false);
  };

  // Goals Handlers
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalTitle || !goalTargetAmount) return;
    setGoals([...goals, {
      id: Date.now(),
      title: goalTitle,
      targetAmount: parseFloat(goalTargetAmount),
      currentAmount: 0,
      color: goalColor,
      icon: goalIcon
    }]);
    setGoalTitle('');
    setGoalTargetAmount('');
    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = (id) => setGoals(goals.filter(g => g.id !== id));

  // V16: Modern Modal Instead of Window.Prompt
  const handleOpenFundModal = (id) => {
    setFundGoalId(id);
    setFundAmount('');
    setIsFundModalOpen(true);
  };

  const handleSaveFund = (e) => {
    e.preventDefault();
    if (!fundGoalId || !fundAmount) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;

    const goal = goals.find(g => g.id === fundGoalId);
    if (!goal) return;

    setGoals(goals.map(g => g.id === fundGoalId ? { ...g, currentAmount: g.currentAmount + amount } : g));

    // Hedefe aktarılan tutarı gider olarak ana bakiyeden düş
    const newTx = {
      id: Date.now() + Math.random(),
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
      originalDate: new Date().toISOString().split('T')[0],
      title: `Hedefe Aktarım: ${goal.title}`,
      note: 'Birikim Kumbarasına Eklendi',
      category: 'other',
      amount: -Math.abs(amount),
      type: 'expense',
      currency: currency,
      receiptUrl: null
    };
    setTransactions((prevTxs) => [newTx, ...prevTxs]);

    setIsFundModalOpen(false);
  };

  const handleAddSub = (e) => {
    e.preventDefault();
    if (!subName || !subAmount || !subDate) return;
    setSubscriptions([...subscriptions, {
      id: Date.now(),
      name: subName,
      amount: parseFloat(subAmount),
      nextBillingDate: subDate,
      category: activeTab === 'incomes' ? 'income' : (activeTab === 'bills' ? 'bills' : subCategory),
      type: subType, // V12: 'income' or 'expense'
      active: true
    }]);
    setIsSubModalOpen(false);
    setSubName('');
    setSubAmount('');
    setSubType('expense');
  };

  const toggleSub = (id) => setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s));
  const deleteSub = (id) => setSubscriptions(subscriptions.filter(s => s.id !== id));

  // Debts Handlers
  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!debtPerson || !debtAmount || !debtDate) return;
    setDebts([{
      id: Date.now(),
      personName: debtPerson,
      amount: parseFloat(debtAmount),
      type: debtType,
      date: debtDate,
      note: debtNote,
      status: 'pending'
    }, ...debts]);
    setIsDebtModalOpen(false);
    setDebtPerson('');
    setDebtAmount('');
    setDebtNote('');
  };

  const handleDeleteDebt = (id) => setDebts(debts.filter(d => d.id !== id));

  const handleSettleDebt = (id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt || debt.status === 'settled') return;

    if (window.confirm(`"${debt.personName}" ile olan ${formatCurrency(debt.amount)} tutarındaki kaydı ödendi (kapatıldı) olarak işaretlemek ve kasaya yansıtmak istiyor musunuz?`)) {
      // 1. Mark as settled
      setDebts(debts.map(d => d.id === id ? { ...d, status: 'settled' } : d));

      // 2. Reflect on Transactions (Main Balance)
      const txType = debt.type === 'they_owe' ? 'income' : 'expense'; // They pay us -> income. We pay them -> expense.
      const newTx = {
        id: Date.now() + Math.random(),
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
        originalDate: new Date().toISOString().split('T')[0],
        title: `${debt.personName} - Borç Kapatma`,
        note: `Sistem: ${debtNote ? debtNote + ' - ' : ''}Ödendi olarak işaretlendi.`,
        category: 'other',
        amount: txType === 'expense' ? -Math.abs(debt.amount) : Math.abs(debt.amount),
        type: txType,
        currency: currency,
        receiptUrl: null
      };
      setTransactions((prevTxs) => [newTx, ...prevTxs]);
    }
  };

  // Assets Handlers
  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!assetName || !assetValue) return;
    setAssets([{
      id: Date.now(),
      name: assetName,
      type: assetType, // 'bank', 'crypto', 'gold', 'stock'
      value: parseFloat(assetValue)
    }, ...assets]);
    setIsAssetModalOpen(false);
    setAssetName('');
    setAssetValue('');
  };

  const handleDeleteAsset = (id) => setAssets(assets.filter(a => a.id !== id));

  const formatCurrency = (valueInBase) => {
    const displayVal = toDisplayCurrency(valueInBase);
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(displayVal);
  };

  // Static Data
  const categoryLabels = {
    food: 'Yeme & İçme',
    transport: 'Ulaşım',
    entertainment: 'Eğlence',
    shopping: 'Alışveriş',
    bills: 'Faturalar',
    income: 'Maaş / Düzenli Gelir', // V12: Added explicitly for regular incomes mapping
    other: 'Diğer'
  };

  const categoryIcons = {
    food: <Coffee size={20} />,
    transport: <CarFront size={20} />,
    entertainment: <Gamepad2 size={20} />,
    shopping: <ShoppingBag size={20} />,
    bills: <Receipt size={20} />,
    income: <Banknote size={20} />,
    other: <MoreHorizontal size={20} />
  };

  // V18: Subscription-specific categories
  const subCategoryLabels = {
    streaming: 'Dizi / Film',
    music: 'Müzik',
    social: 'Sosyal Medya',
    ai: 'Yapay Zeka',
    gaming: 'Oyun',
    cloud: 'Bulut Depolama',
    other: 'Diğer'
  };

  const subCategoryIcons = {
    streaming: <Tv2 size={20} />,
    music: <Music size={20} />,
    social: <Share2 size={20} />,
    ai: <Bot size={20} />,
    gaming: <Gamepad2 size={20} />,
    cloud: <Laptop size={20} />,
    other: <MoreHorizontal size={20} />
  };

  const billCategoryLabels = {
    electricity: 'Elektrik',
    water: 'Su',
    gas: 'Doğal Gaz',
    phone: 'Telefon / İletişim',
    other: 'Diğer'
  };

  const billCategoryIcons = {
    electricity: <Zap size={20} />,
    water: <Droplet size={20} />,
    gas: <Flame size={20} />,
    phone: <Smartphone size={20} />,
    other: <MoreHorizontal size={20} />
  };

  const assetIcons = {
    bank: <Landmark size={20} />,
    gold: <Coins size={20} />,
    stock: <TrendingUp size={20} />,
    crypto: <Bitcoin size={20} />
  };

  const assetLabels = {
    bank: 'Banka / Nakit',
    gold: 'Altın / Döviz',
    stock: 'Hisse / Borsa',
    crypto: 'Kripto Para'
  };

  const goalIconOptions = {
    Target: <Target size={20} />,
    Home: <Home size={20} />,
    CarFront: <CarFront size={20} />,
    GraduationCap: <GraduationCap size={20} />,
    Plane: <Plane size={20} />,
    Laptop: <Laptop size={20} />,
    Smartphone: <Smartphone size={20} />,
    Heart: <Heart size={20} />
  };

  const timeFilterLabels = {
    all: 'Tüm Zamanlar',
    day: 'Bugün',
    week: 'Son 7 Gün',
    month: 'Son 30 Gün',
    year: 'Son 1 Yıl'
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

  const budgetProgress = Math.min((periodExpenseBase / budgetLimit) * 100, 100);
  let progressColorClass = '';
  if (budgetProgress > 90) progressColorClass = 'danger';
  else if (budgetProgress > 75) progressColorClass = 'warning';

  // V4: Notification AI Logic
  const activeNotifications = useMemo(() => {
    let notifs = [];

    // 1. Budget Warnings
    if (budgetProgress >= 90) {
      notifs.push({
        id: 'budget-critical',
        type: 'danger',
        title: t('Bütçe Kritik Seviyede!'),
        message: t('Aylık bütçenizin') + ` %${budgetProgress.toFixed(0)} ` + t('kısmını doldurdunuz. Acil olmayan harcamaları durdurun.')
      });
    } else if (budgetProgress >= 80) {
      notifs.push({
        id: 'budget-warning',
        type: 'warning',
        title: t('Bütçe Alarmı'),
        message: t('Harika gidiyorsunuz ancak aylık bütçenizin') + ` %${budgetProgress.toFixed(0)} ` + t('sınırına ulaştınız.')
      });
    }

    // 2. Upcoming Subscriptions (3 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    subscriptions.filter(s => s.active).forEach(sub => {
      const subDate = new Date(sub.nextBillingDate);

      // Calculate day difference
      const diffTime = subDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
        notifs.push({
          id: `sub-${sub.id}`,
          type: 'info',
          title: t('Yaklaşan Abonelik Ödemesi'),
          message: `"${sub.name}" ` + t('aboneliğinizin') + ` ${formatCurrency(sub.amount)} ` + t('tutarındaki yenilemesine') + ` ${diffDays === 0 ? t('bugün') : diffDays + ' ' + t('gün')} ` + t('kaldı.')
        });
      }
    });

    return notifs;
  }, [budgetProgress, subscriptions]);

  const exportToCSV = () => {
    const headers = ['ID', 'Tarih', 'Baslik', 'Kategori', 'Tip', 'Tutar', 'Para Birimi', 'Not'];
    const csvRows = [headers.join(',')];
    transactions.forEach(tx => {
      const row = [
        tx.id, tx.originalDate, `"${tx.title.replace(/"/g, '""')}"`, `"${categoryLabels[tx.category] || tx.category}"`,
        tx.type === 'income' ? 'Gelir' : 'Gider', tx.amount, tx.currency || 'TRY', `"${(tx.note || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `NexSpend_Rapor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const formattedData = transactions.map(tx => ({
      'İşlem ID': tx.id,
      'Tarih': tx.originalDate,
      'Kategori': categoryLabels[tx.category] || tx.category,
      'İşlem Başlığı': tx.title,
      'Tür': tx.type === 'income' ? 'Gelir' : 'Gider',
      'Tutar': tx.amount,
      'Para Birimi': tx.currency || 'TRY',
      'Not / Açıklama': tx.note || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "İşlemler");
    XLSX.writeFile(workbook, `NexSpend_Excel_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="logo">
          <h2 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={24} />
            NexSpend
          </h2>
        </div>
        <nav className="nav-menu">
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <Home size={20} /> <span style={{ marginLeft: '12px' }}>{t("Dashboard")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }}>
            <PieChartIcon size={20} /> <span style={{ marginLeft: '12px' }}>{t("İstatistikler")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('goals'); }}>
            <Target size={20} /> <span style={{ marginLeft: '12px' }}>{t("Hedefler")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('calendar'); }}>
            <CalendarDays size={20} /> <span style={{ marginLeft: '12px' }}>{t("Takvim")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'debts' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('debts'); }}>
            <Users size={20} /> <span style={{ marginLeft: '12px' }}>{t("Borç Defteri")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('subscriptions'); }}>
            <Repeat size={20} /> <span style={{ marginLeft: '12px' }}>{t("Abonelikler")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'bills' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('bills'); }}>
            <Receipt size={20} /> <span style={{ marginLeft: '12px' }}>{t("Faturalar")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'incomes' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('incomes'); }}>
            <TrendingUp size={20} /> <span style={{ marginLeft: '12px' }}>{t("Düzenli Gelirler")}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('assets'); }}>
            <Landmark size={20} /> <span style={{ marginLeft: '12px' }}>{t("Varlıklarım")}</span>
          </a>
          <div style={{ margin: '20px 0', borderTop: '1px solid var(--glass-border)' }}></div>
          <a href="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>
            <Settings size={20} /> <span style={{ marginLeft: '12px' }}>{t("Ayarlar")}</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1 className="page-title">{t("Merhaba")}, {userName} <span style={{ fontSize: '1.2rem' }}>👋</span></h1>
            <p className="page-subtitle">{t("İşte finansal özetin")}</p>
          </div>

          {/* V17: Backup Reminder Banner */}
          {isBackupStale && !backupBannerDismissed && (
            <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '-8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Shield size={18} color="#f59e0b" />
                <span>{lastBackupDate ? `Son yedeğiniz ${new Date(lastBackupDate).toLocaleDateString('tr-TR')} tarihli. Verilerinizi güvende tutmak için yedekleyin.` : 'Henüz hiç yedek almadınız. Verilerinizi koruma altına alın!'}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#f59e0b' }} onClick={handleBackupData}>
                  <Download size={14} /> Şimdi Yedekle
                </button>
                <button className="icon-btn" style={{ padding: '4px', color: 'var(--text-secondary)' }} onClick={() => setBackupBannerDismissed(true)}>
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* V4: Notification Bell & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                style={{ background: 'var(--bg-tertiary)', position: 'relative' }}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={20} />
                {activeNotifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', backgroundColor: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--glass-bg)' }}></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="notification-dropdown glass-panel animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '320px', zIndex: 100, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t("Bildirim Merkezi")}</h3>
                      <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px' }}>{activeNotifications.length} {t("Uyarı")}</span>
                    </div>
                    <button
                      className="icon-btn"
                      onClick={() => setIsNotificationsOpen(false)}
                      style={{ padding: '4px', color: 'var(--text-secondary)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {activeNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.9rem' }}>
                      <CheckCheck size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      {t("Harika! Şu an için kritik bir bildiriminiz yok.")}
                    </div>
                  ) : (
                    activeNotifications.map(notif => (
                      <div key={notif.id} style={{ padding: '12px', borderRadius: '8px', background: `var(--${notif.type}-bg)`, border: `1px solid var(--${notif.type})` }}>
                        <div style={{ fontWeight: 'bold', color: `var(--${notif.type})`, fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={16} /> {notif.title}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {activeTab === 'dashboard' && (
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Yeni İşlem
              </button>
            )}
          </div>
        </header>

        <div className="content-area animate-fade-in">

          {/* Time Filter Top Bar */}
          {['dashboard', 'analytics'].includes(activeTab) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div className="time-filter-wrapper" style={{ background: 'var(--glass-bg)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                {['all', 'day', 'week', 'month', 'year'].map(period => (
                  <button
                    key={period}
                    className="btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      background: timeFilter === period ? 'var(--bg-tertiary)' : 'transparent',
                      color: timeFilter === period ? (theme === 'light' ? 'var(--accent-primary)' : 'white') : 'var(--text-secondary)',
                      boxShadow: timeFilter === period ? 'var(--shadow-sm)' : 'none',
                      fontWeight: timeFilter === period ? '600' : '400'
                    }}
                    onClick={() => setTimeFilter(period)}
                  >
                    {timeFilterLabels[period]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{t("Toplam Bakiye")} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({t("Tüm Zamanlar")})</span></h3>
                    <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                      <Wallet size={20} />
                    </div>
                  </div>
                  <p className="amount" style={{ fontSize: '2.5rem', margin: '4px 0' }}>{formatCurrency(totalBalanceBase)}</p>

                  {/* Real Safe Balance Widget */}
                  <div style={{ marginTop: '12px', padding: '12px', background: 'var(--success-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', border: '1px solid currentColor' }}>
                    <CheckCheck size={18} />
                    <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{t("Güvenli Bakiye (Abonelikler & Borçlar Düşüldü):")} <strong>{formatCurrency(realBalanceBase)}</strong></span>
                  </div>

                  {/* Next Expected Regular Income Widget (V12.1) */}
                  {nextExpectedIncome && (
                    <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', border: '1px solid currentColor' }}>
                      <TrendingUp size={18} />
                      <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                        {t("Sıradaki Gelir Beklentisi")} ({nextExpectedIncome.name}): <strong>+{formatCurrency(nextExpectedIncome.amount)}</strong>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '8px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
                          {nextExpectedIncome.daysLeft === 0 ? t('Bugün') : `${nextExpectedIncome.daysLeft} ${t("Gün Sonra")}`}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Budget Progress Bar */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>{t("Aylık Bütçe:")} {formatCurrency(budgetLimit)}</span>
                      <span>{t("Harcama")} ({timeFilterLabels[timeFilter]}): {formatCurrency(periodExpenseBase)} ({budgetProgress.toFixed(1)}%)</span>
                      <button
                        onClick={() => setIsBudgetModalOpen(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={12} /> Düzenle
                      </button>
                    </div>
                    <div className="progress-container">
                      <div className={`progress-bar ${progressColorClass}`} style={{ width: `${budgetProgress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="card glass-panel" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>{t("Gelir")} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({timeFilterLabels[timeFilter]})</span></h3>
                      <div style={{ padding: '8px', background: 'var(--success-bg)', borderRadius: '8px', color: 'var(--success)' }}>
                        <BarChart3 size={20} />
                      </div>
                    </div>
                    <p className="amount" style={{ color: 'var(--success)' }}>{formatCurrency(periodIncomeBase)}</p>
                  </div>
                  <div className="card glass-panel" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>{t("Gider")} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({timeFilterLabels[timeFilter]})</span></h3>
                      <div style={{ padding: '8px', background: 'var(--danger-bg)', borderRadius: '8px', color: 'var(--danger)' }}>
                        <PieChartIcon size={20} />
                      </div>
                    </div>
                    <p className="amount" style={{ color: 'var(--danger)' }}>{formatCurrency(periodExpenseBase)}</p>
                  </div>
                </div>
              </div>

              {/* Transactions Section */}
              <section className="transactions-section glass-panel" style={{ padding: '24px' }}>
                <div className="section-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{t("İşlem Geçmişi")} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({timeFilterLabels[timeFilter]})</span></h2>
                  </div>

                  {/* Filter Bar */}
                  <div className="filter-bar">
                    <div style={{ position: 'relative', flex: 2 }}>
                      <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        className="filter-input"
                        placeholder={t("İşlem ara...")}
                        style={{ paddingLeft: '40px', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <select
                        className="filter-input"
                        style={{ paddingLeft: '40px', width: '100%' }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="all">{t("Tümü")}</option>
                        <option value="expense">{t("Sadece Giderler")}</option>
                        <option value="income">{t("Sadece Gelirler")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="table-container">
                  {filteredTransactions.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>{t("İşlem Adı")}</th>
                          <th>{t("Kategori")}</th>
                          <th>{t("Tarih")}</th>
                          <th style={{ textAlign: 'right' }}>{t("Tutar")}</th>
                          <th style={{ textAlign: 'center', width: '60px' }}>{t("İşlem")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>
                              <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {tx.title}
                                {tx.receiptUrl && <Camera size={14} color="var(--accent-primary)" title={t("Fiş Ekli")} />}
                              </div>
                              {tx.note && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{tx.note}</div>}
                            </td>
                            <td>
                              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                {categoryLabels[tx.category] || tx.category}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CalendarDays size={14} /> {tx.date || tx.originalDate}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }} className={tx.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                              {tx.type === 'income' ? '+' : ''}
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: tx.currency || 'TRY', maximumFractionDigits: 0 }).format(Math.abs(tx.amount))}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="icon-btn"
                                style={{ color: 'var(--danger)', margin: '0 auto' }}
                                onClick={() => handleDeleteTransaction(tx.id)}
                                title={t("Sil")}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      <p>{t("Kriterlerinize uygun işlem bulunamadı.")}</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* TAB 2: ANALYTICS & INSIGHTS */}
          {activeTab === 'analytics' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* AI AI Insights */}
              <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Lightbulb color="var(--accent-primary)" size={24} /> Finansal İçgörüler
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {aiInsights.map((insight, idx) => {
                    let icon = <CheckCircle2 color="var(--success)" />;
                    if (insight.type === 'danger' || insight.type === 'alert') icon = <AlertCircle color="var(--danger)" />;
                    if (insight.type === 'warning') icon = <TrendingDown color="#f59e0b" />;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ marginTop: '2px' }}>{icon}</div>
                        <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{insight.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h2>{t("Kategori Dağılımı")}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t("Giderlerinizin seçili periyottaki dağılımı")} ({currency})</p>

                {chartData.length > 0 ? (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-secondary)"
                          tick={{ fill: 'var(--text-secondary)' }}
                          tickFormatter={(value) => categoryLabels[value] || value}
                        />
                        <YAxis
                          stroke="var(--text-secondary)"
                          tick={{ fill: 'var(--text-secondary)' }}
                          tickFormatter={(value) => new Intl.NumberFormat('tr-TR', { notation: 'compact', compactDisplay: 'short' }).format(value)}
                        />
                        <Tooltip
                          formatter={(value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)}
                          labelFormatter={(label) => categoryLabels[label] || label}
                          contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                          cursor={{ fill: 'var(--glass-bg)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    <p>{t("Gösterilecek harcama verisi bulunmuyor.")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: GOALS */}
          {activeTab === 'goals' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>{t("Birikim Hedefleri")}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{t("Gelecek planlarınız için para biriktirin.")}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsGoalModalOpen(true)}>
                  <Plus size={18} /> Yeni Hedef
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {goals.map(goal => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const isCompleted = progress >= 100;
                  return (
                    <div key={goal.id} className="card glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                      {isCompleted && (
                        <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--success)', color: '#fff', padding: '4px 12px', borderBottomLeftRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          TAMAMLANDI 🎉
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${goal.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${goal.color}44`, color: goal.color }}>
                            {goal.icon && goalIconOptions[goal.icon] ? React.cloneElement(goalIconOptions[goal.icon], { size: 20 }) : <Target size={20} />}
                          </div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{goal.title}</h3>
                        </div>
                        <button className="icon-btn" onClick={() => handleDeleteGoal(goal.id)} style={{ color: 'var(--text-secondary)' }}><Trash2 size={16} /></button>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                          <span>{t("Biriken")}: {formatCurrency(goal.currentAmount)}</span>
                          <span>{t("Hedef")}: {formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div className="progress-container" style={{ height: '10px', background: 'var(--bg-secondary)' }}>
                          <div className="progress-bar" style={{ width: `${progress}%`, background: goal.color }}></div>
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
                        onClick={() => handleOpenFundModal(goal.id)}
                        disabled={isCompleted}
                      >
                        <Plus size={16} /> {isCompleted ? 'Hedefe Ulaşıldı' : 'Para Ekle'}
                      </button>
                    </div>
                  );
                })}
                {goals.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>{t("Henüz bir hedefiniz yok.")}</p>}
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>{t("Aboneliklerim")}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{t("Düzenli harcamalarınızı ve aboneliklerinizi yönetin.")}</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setSubCategory('streaming'); setSubType('expense'); setIsSubModalOpen(true); }}>
                  <Plus size={18} /> {t("Abonelik Ekle")}
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("Servis / Abonelik")}</th>
                      <th>{t("Kategori")}</th>
                      <th>{t("Sonraki Çekim")}</th>
                      <th>{t("Tutar (Aylık)")}</th>
                      <th>{t("Durum")}</th>
                      <th style={{ textAlign: 'center' }}>{t("İşlem")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.filter(s => s.category !== 'bills' && s.type !== 'income').map(sub => (
                      <tr key={sub.id} style={{ opacity: sub.active ? 1 : 0.5 }}>
                        <td style={{ fontWeight: '500' }}>{sub.name}</td>
                        <td><span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{subCategoryLabels[sub.category] || categoryLabels[sub.category] || sub.category}</span></td>
                        <td><CalendarDays size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {sub.nextBillingDate}</td>
                        <td style={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(sub.amount)}</td>
                        <td>
                          <button
                            onClick={() => toggleSub(sub.id)}
                            style={{
                              background: sub.active ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                              color: sub.active ? 'var(--success)' : 'var(--text-secondary)',
                              border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
                            }}>
                            {sub.active ? 'Aktif' : 'Durduruldu'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="icon-btn" style={{ color: 'var(--danger)', margin: '0 auto' }} onClick={() => deleteSub(sub.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.filter(s => s.category !== 'bills' && s.type !== 'income').length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Kayıtlı abonelik yok.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: BILLS */}
          {activeTab === 'bills' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>{t("Faturalarım")}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{t("Elektrik, su, internet gibi zorunlu giderlerinizi yönetin.")}</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setSubCategory('bills'); setSubType('expense'); setIsSubModalOpen(true); }}>
                  <Plus size={18} /> {t("Fatura Ekle")}
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("Fatura Tipi")}</th>
                      <th>{t("Kategori")}</th>
                      <th>{t("Ödeme Tarihi")}</th>
                      <th>{t("Tutar (Aylık)")}</th>
                      <th>{t("Durum")}</th>
                      <th style={{ textAlign: 'center' }}>{t("İşlem")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.filter(s => s.category === 'bills' && s.type !== 'income').map(sub => (
                      <tr key={sub.id} style={{ opacity: sub.active ? 1 : 0.5 }}>
                        <td style={{ fontWeight: '500' }}>{sub.name}</td>
                        <td><span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{categoryLabels[sub.category]}</span></td>
                        <td><CalendarDays size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {sub.nextBillingDate}</td>
                        <td style={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(sub.amount)}</td>
                        <td>
                          <button
                            onClick={() => toggleSub(sub.id)}
                            style={{
                              background: sub.active ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                              color: sub.active ? 'var(--success)' : 'var(--text-secondary)',
                              border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
                            }}>
                            {sub.active ? 'Aktif' : 'Durduruldu'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="icon-btn" style={{ color: 'var(--danger)', margin: '0 auto' }} onClick={() => deleteSub(sub.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.filter(s => s.category === 'bills' && s.type !== 'income').length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>{t("Kayıtlı fatura yok.")}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INCOMES (V12) */}
          {activeTab === 'incomes' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>{t("Düzenli Gelirler")}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{t("Maaş, kira, burs gibi aylık düzenli gelirlerinizi ayarlayın.")}</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setSubCategory('income'); setSubType('income'); setIsSubModalOpen(true); }} style={{ background: 'var(--success)' }}>
                  <Plus size={18} /> {t("Gelir Ekle")}
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("Gelir Tipi")}</th>
                      <th>{t("Durum")}</th>
                      <th>{t("Sonraki Tahsilat")}</th>
                      <th>{t("Aylık Tutar")}</th>
                      <th>{t("Aktiflik")}</th>
                      <th style={{ textAlign: 'center' }}>{t("İşlem")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.filter(s => s.type === 'income').map(sub => (
                      <tr key={sub.id} style={{ opacity: sub.active ? 1 : 0.5 }}>
                        <td style={{ fontWeight: '500', color: 'var(--success)' }}>{sub.name}</td>
                        <td><span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Gelir</span></td>
                        <td><CalendarDays size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {sub.nextBillingDate}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>+{new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(sub.amount)}</td>
                        <td>
                          <button
                            onClick={() => toggleSub(sub.id)}
                            style={{
                              background: sub.active ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                              color: sub.active ? 'var(--success)' : 'var(--text-secondary)',
                              border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
                            }}>
                            {sub.active ? 'Aktif' : 'Durduruldu'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="icon-btn" style={{ color: 'var(--danger)', margin: '0 auto' }} onClick={() => deleteSub(sub.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.filter(s => s.type === 'income').length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>{t("Kayıtlı düzenli gelir yok.")}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DEBTS (Borçlar) */}
          {activeTab === 'debts' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>{t("Borç ve Alacak Defteri")}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{t("Kişilere verdiğiniz veya aldığınız borçları takip edin.")}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsDebtModalOpen(true)}>
                  <Plus size={18} /> Yeni Kayıt
                </button>
              </div>

              {/* Debt Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '12px' }}><ArrowDownRight size={24} /></div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>{t("Toplam Alacak (Bana Ödenecek)")}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(totalOwedToUserBase)}</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px' }}><ArrowUpRight size={24} /></div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>{t("Toplam Borç (Benim Ödeyeceğim)")}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{formatCurrency(totalUserOwesBase)}</div>
                  </div>
                </div>
              </div>

              {/* Debts Table */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("Kişi / Kurum")}</th>
                      <th>{t("Tür")}</th>
                      <th>{t("Veriliş Tarihi")}</th>
                      <th>{t("Tutar")}</th>
                      <th>{t("Durum")}</th>
                      <th style={{ textAlign: 'right' }}>{t("İşlem")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debts.map(debt => (
                      <tr key={debt.id} style={{ opacity: debt.status === 'settled' ? 0.5 : 1 }}>
                        <td>
                          <div style={{ fontWeight: '500' }}>{debt.personName}</div>
                          {debt.note && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{debt.note}</div>}
                        </td>
                        <td>
                          <span className={`badge ${debt.type === 'they_owe' ? 'badge-success' : 'badge-danger'}`}>
                            {debt.type === 'they_owe' ? 'Alacaklıyım' : 'Borçluyum'}
                          </span>
                        </td>
                        <td><CalendarDays size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {debt.date}</td>
                        <td style={{ fontWeight: 'bold', color: debt.type === 'they_owe' ? 'var(--success)' : 'var(--danger)' }}>
                          {formatCurrency(debt.amount)}
                        </td>
                        <td>
                          {debt.status === 'settled' ? (
                            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><CheckCheck size={16} /> Ödendi</span>
                          ) : (
                            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><Clock size={16} /> Bekliyor</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {debt.status !== 'settled' && (
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleSettleDebt(debt.id)}>
                                <CheckCheck size={14} /> Kapat
                              </button>
                            )}
                            <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteDebt(debt.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {debts.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Kayıtlı borç veya alacak bulunmuyor.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ASSETS (Varlıklar & Portföy) */}
          {activeTab === 'assets' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>Varlıklarım (Net Servet)</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Banka hesapları, nakit, altın, hisse senedi ve kripto varlıklarınızı kaydedin.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAssetModalOpen(true)}>
                  <Plus size={18} /> Varlık Ekle
                </button>
              </div>

              {/* Net Worth Dashboard Box */}
              <div className="net-worth-card" style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, #312e81 100%)', padding: '32px', borderRadius: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginBottom: '32px', color: 'white' }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={20} /> TOPLAM NET SERVET
                    </div>
                    <div className="net-worth-amount" style={{ fontSize: '3.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>{formatCurrency(totalNetWorthBase)}</div>
                  </div>
                </div>
                <div className="net-worth-stats" style={{ marginTop: '24px', display: 'flex', gap: '24px', position: 'relative', zIndex: 1, opacity: 0.8, fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span>{t("Ana Bakiye")}: {formatCurrency(totalBalanceBase)}</span>
                  <span>|</span>
                  <span>{t("Kayıtlı Varlıklar")}: {formatCurrency(assets.reduce((s, a) => s + a.value, 0))}</span>
                  <span>|</span>
                  <span>{t("Net Borç/Alacak")}: {formatCurrency(totalOwedToUserBase - totalUserOwesBase)}</span>
                </div>
              </div>

              {/* V15 Live Markets Ticker */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
                  <Activity size={20} color="var(--accent-primary)" /> Canlı Piyasa Verileri
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px' }}>Demo</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {markets.map(market => (
                    <div key={market.id} className={`glass-panel market-card ${market.flash === 'up' ? 'market-flash-up' : market.flash === 'down' ? 'market-flash-down' : ''}`} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{market.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{market.id}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{market.name}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold' }}>{market.price.toFixed(2)}</div>
                        <div style={{ fontSize: '0.8rem', color: market.isUp ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                          {market.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {Math.abs(market.change).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {assets.map(asset => {
                  let icon = <Landmark size={24} color="#8b5cf6" />;
                  if (asset.type === 'crypto') icon = <Briefcase size={24} color="#f59e0b" />;
                  if (asset.type === 'gold') icon = <Landmark size={24} color="#eab308" />;
                  if (asset.type === 'stock') icon = <TrendingUp size={24} color="#10b981" />;

                  return (
                    <div key={asset.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '12px' }}>{icon}</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{asset.name}</div>
                        </div>
                        <button className="icon-btn" style={{ color: 'var(--text-secondary)' }} onClick={() => handleDeleteAsset(asset.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {formatCurrency(asset.value)}
                      </div>
                    </div>
                  );
                })}
                {assets.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Henüz portföyünüze bir varlık eklemediniz. "Varlık Ekle" butonunu kullanarak ekleyebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CALENDAR (V4) */}
          {activeTab === 'calendar' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>Finansal Takvim</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Gelirlerinizi, giderlerinizi, aboneliklerinizi ve borç vadelerini gün gün takip edin.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button className="icon-btn" style={{ background: 'var(--bg-tertiary)' }} onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                    <ChevronLeft size={20} />
                  </button>
                  <h3 style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
                    {calendarDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button className="icon-btn" style={{ background: 'var(--bg-tertiary)' }} onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="calendar-grid">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                  <div key={day} className="calendar-header-day">{day}</div>
                ))}

                {/* Empty Days Before First Day of Month */}
                {Array.from({ length: (new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} className="calendar-day empty"></div>
                ))}

                {/* Days of Month */}
                {Object.keys(calendarEvents).map(day => {
                  const events = calendarEvents[day];
                  const isToday = new Date().getDate() === parseInt(day) && new Date().getMonth() === calendarDate.getMonth() && new Date().getFullYear() === calendarDate.getFullYear();

                  return (
                    <div
                      key={day}
                      className={`calendar-day ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-events' : ''}`}
                      onClick={() => events.length > 0 && setSelectedCalendarDay(parseInt(day))}
                    >
                      <div className="day-number">{day}</div>
                      {events.length > 0 && (
                        <div className="calendar-day-indicators">
                          {events.slice(0, 3).map((ev, i) => (
                            <div key={i} className="indicator-dot" style={{ backgroundColor: ev.color }}></div>
                          ))}
                          {events.length > 3 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                              +{events.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
              <div className="page-header">
                <div>
                  <h2>{t("Genel Ayarlar")}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{t("Hesap ve uygulama tercihlerinizi yönetin.")}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '16px' }}>{t("Profil Bilgileri")}</h3>
                  <div className="setting-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{t("İsim Soyisim")}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{userName}</div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => { setTempUserName(userName); setIsNameModalOpen(true); }}>
                      Düzenle
                    </button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '16px' }}>{t("Görünüm ve Tema")}</h3>
                  <div className="setting-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>Uygulama Dili (Language)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Türkçe veya İngilizce olarak değiştirin</div>
                    </div>
                    <select className="form-control" style={{ width: '150px' }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="tr">🇹🇷 Türkçe</option>
                      <option value="en">🇬🇧 English</option>
                    </select>
                  </div>
                  <div className="setting-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{t("Uygulama Teması")}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t("Aydınlık veya karanlık tema geçişi")}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTheme('dark')}>🌙 {t("Karanlık")}</button>
                      <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTheme('light')}>☀️ {t("Aydınlık")}</button>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Uygulama Tercihleri</h3>
                  <div className="setting-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>Uygulama Para Birimi (Base)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Panodaki tüm varlıklar bu kur üzerinden hesaplanıp gösterilecektir.</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {['TRY', 'USD', 'EUR'].map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`icon-picker-btn ${currency === c ? 'selected' : ''}`}
                        style={{ padding: '16px 8px', gap: '8px' }}
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{CURRENCY_SYMBOLS[c]}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{c === 'TRY' ? 'Türk Lirası' : c === 'USD' ? 'Dolar' : 'Euro'}</span>
                      </button>
                    ))}
                  </div>
                  <div className="setting-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>Aylık Bütçe Sınırı (TRY)</div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setIsBudgetModalOpen(true)}>Limiti Düzenle</button>
                  </div>
                  <div className="setting-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Verileri Dışa Aktar</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tüm harcama geçmişinizi dosya olarak indirin.</div>
                    </div>
                    <div className="btn-group-mobile" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" onClick={exportToCSV}>📥 CSV</button>
                      <button className="btn btn-primary" onClick={exportToExcel} style={{ background: '#10b981', color: '#fff', border: 'none' }}>
                        <FileSpreadsheet size={16} style={{ marginRight: '6px' }} /> Excel (.xlsx)
                      </button>
                    </div>
                  </div>
                </div>

                {/* V17: Backup & Restore Section */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} color="var(--accent-primary)" /> Veri Yedekleme & Geri Yükleme</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Tüm verilerinizi JSON dosyası olarak telefonunuza indirin. Tarayıcı verileri silinse bile bu dosyadan geri yükleyebilirsiniz.</p>
                  {lastBackupDate && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px' }}>
                      ⏰ Son Yedek: {new Date(lastBackupDate).toLocaleString('tr-TR')}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={handleBackupData} style={{ flex: 1, minWidth: '140px' }}>
                      <Download size={16} /> Verileri Yedekle
                    </button>
                    <button className="btn btn-secondary" onClick={() => backupFileRef.current?.click()} style={{ flex: 1, minWidth: '140px' }}>
                      <Upload size={16} /> Yedeği Geri Yükle
                    </button>
                    <input ref={backupFileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleRestoreData} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>Veri Yönetimi</h3>
                  <button
                    className="btn btn-primary"
                    style={{ background: 'var(--danger)', boxShadow: 'none' }}
                    onClick={() => setIsResetModalOpen(true)}
                  >
                    <Trash2 size={16} /> Tüm Uygulamayı Sıfırla
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main >

      {/* MODALS */}
      {/* 1. Add Transaction Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{t("Yeni İşlem Ekle")}</h2>
            <button type="button" className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
          </div>

          <form onSubmit={handleAddTransaction}>
            <div className="form-group">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button type="button" className={`btn ${txType === 'expense' ? 'btn-primary' : 'btn-secondary'}`} style={txType === 'expense' ? { background: 'var(--danger)', color: 'white' } : {}} onClick={() => setTxType('expense')}>Gider</button>
                <button type="button" className={`btn ${txType === 'income' ? 'btn-primary' : 'btn-secondary'}`} style={txType === 'income' ? { background: 'var(--success)', color: 'white' } : {}} onClick={() => setTxType('income')}>Gelir</button>
              </div>
            </div>

            <div className="form-group">
              <label>{t("Tutar")} ({CURRENCY_SYMBOLS[currency] || '₺'})</label>
              <input type="number" className="form-control" placeholder="0.00" required step="0.01" min="0.01" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
            </div>

            <div className="form-group">
              <label>{t("İşlem Başlığı")}</label>
              <input type="text" className="form-control" required value={txTitle} onChange={(e) => setTxTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginTop: '8px' }}>
                {Object.keys(categoryLabels).map(k => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => {
                      setTxCategory(k);
                      setIsCategoryManual(true);
                    }}
                    className={`icon-picker-btn ${txCategory === k ? 'selected' : ''}`}
                  >
                    {categoryIcons[k]}
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', textAlign: 'center' }}>{t(categoryLabels[k])}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Tarih</label>
              <input type="date" className="form-control" required value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </div>

            {txType === 'expense' && (
              <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: txIsSplit ? '12px' : '0' }}>
                  <input type="checkbox" checked={txIsSplit} onChange={(e) => setTxIsSplit(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
                  <span style={{ fontWeight: '500' }}>➗ Ortak Harcama (Alman Usulü Bölüştür)</span>
                </label>
                {txIsSplit && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t("Kişi Sayısı (Siz Dahil):")}</label>
                    <input type="number" className="form-control" min="2" value={txSplitCount} onChange={(e) => setTxSplitCount(parseInt(e.target.value) || 2)} style={{ width: '80px', padding: '6px 12px' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginLeft: 'auto' }}>{t("Size Düşen")}: {txAmount ? formatCurrency(txAmount / txSplitCount) : '0'}</div>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>{t("Fiş / Fatura Görseli")} (Opsiyonel OCR)</label>
              <input type="file" accept="image/*" className="form-control" onChange={handleReceiptUpload} style={{ padding: '8px' }} />
              {txReceiptStr && <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px' }}>✓ Görsel eklendi (OCR Analizi yapıldı)</div>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{t("İptal")}</button>
              <button type="submit" className="btn btn-primary">{t("Kaydet")}</button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Budget Edit Modal */}
      <div className={`modal-overlay ${isBudgetModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h2>Aylık Bütçe Sınırı (TRY)</h2>
            <button type="button" className="icon-btn" onClick={() => setIsBudgetModalOpen(false)}><X size={24} /></button>
          </div>
          <form onSubmit={handleSaveBudget}>
            <div className="form-group">
              <input type="number" className="form-control" required min="0" value={tempBudget} onChange={(e) => setTempBudget(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{t("Kaydet")}</button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Add Goal Modal */}
      <div className={`modal-overlay ${isGoalModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h2>Yeni Hedef Ekle</h2>
            <button type="button" className="icon-btn" onClick={() => setIsGoalModalOpen(false)}><X size={24} /></button>
          </div>
          <form onSubmit={handleAddGoal}>
            <div className="form-group">
              <label>Hedef Adı</label>
              <input type="text" className="form-control" required value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Hedef Tutar ({CURRENCY_SYMBOLS['TRY']})</label>
              <input type="number" className="form-control" required min="1" value={goalTargetAmount} onChange={(e) => setGoalTargetAmount(e.target.value)} />
            </div>
            <div className="form-group">
              <label>İkon Seçimi</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', marginTop: '8px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                {Object.keys(goalIconOptions).map(iconKey => (
                  <button
                    type="button"
                    key={iconKey}
                    onClick={() => setGoalIcon(iconKey)}
                    className={`icon-picker-btn ${goalIcon === iconKey ? 'selected' : ''}`}
                    style={{ height: '45px', background: goalIcon !== iconKey ? 'transparent' : '' }}
                  >
                    {goalIconOptions[iconKey]}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group form-row">
              <label>Renk Seçimi</label>
              <input type="color" className="form-control" style={{ height: '50px', padding: '4px', maxWidth: '80px' }} value={goalColor} onChange={(e) => setGoalColor(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Hedefi Oluştur</button>
            </div>
          </form>
        </div>
      </div>

      {/* 3.5 Fund Goal Modal (V16) */}
      <div className={`modal-overlay ${isFundModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h2>Hedefe Para Ekle</h2>
            <button type="button" className="icon-btn" onClick={() => setIsFundModalOpen(false)}><X size={24} /></button>
          </div>
          <form onSubmit={handleSaveFund}>
            <div className="form-group">
              <label>Eklenecek Tutar ({CURRENCY_SYMBOLS['TRY']})</label>
              <input type="number" className="form-control" required min="1" step="0.01" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="Örn: 500" />
            </div>
            <div className="form-group" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ℹ️ Eklenen tutar ana kasanızdan (Net Servet) düşülecektir.
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsFundModalOpen(false)}>İptal</button>
              <button type="submit" className="btn btn-primary">Hedefe Ekle</button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Add Subscription/Income Modal */}
      <div className={`modal-overlay ${isSubModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h2>{activeTab === 'incomes' ? t('Düzenli Gelir Ekle') : activeTab === 'bills' ? t('Fatura Ekle') : t('Abonelik Ekle')}</h2>
            <button type="button" className="icon-btn" onClick={() => setIsSubModalOpen(false)}><X size={24} /></button>
          </div>
          <form onSubmit={handleAddSub}>
            <div className="form-group">
              <label>{activeTab === 'incomes' ? t('Gelir Başlığı') : activeTab === 'bills' ? t('Fatura Adı') : t('Servis / Abonelik Adı')}</label>
              <input type="text" className="form-control" required placeholder={activeTab === 'incomes' ? t('Örn: Maaş, Kira Geliri, Burs') : activeTab === 'bills' ? t('Örn: Elektrik, Su Faturası') : t('Örn: Netflix, Spor Salonu')} value={subName} onChange={(e) => setSubName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Aylık Tutar</label>
              <input type="number" className="form-control" required min="0.01" step="0.01" value={subAmount} onChange={(e) => setSubAmount(e.target.value)} />
            </div>
            {activeTab === 'subscriptions' && (
              <div className="form-group">
                <label>Kategori</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {Object.keys(subCategoryLabels).map(k => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setSubCategory(k)}
                      className={`icon-picker-btn ${subCategory === k ? 'selected' : ''}`}
                      style={{ padding: '10px 4px', gap: '6px' }}
                    >
                      {subCategoryIcons[k]}
                      <span style={{ fontSize: '0.65rem', fontWeight: '500', textAlign: 'center', wordBreak: 'break-word', lineHeight: '1' }}>{t(subCategoryLabels[k])}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Sonraki Çekim Tarihi</label>
              <input type="date" className="form-control" required value={subDate} onChange={(e) => setSubDate(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{t("Kaydet")}</button>
            </div>
          </form>
        </div>
      </div>

      {/* 5. Add Debt Modal */}
      <div className={`modal-overlay ${isDebtModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h2>Borç / Alacak Kaydı</h2>
            <button type="button" className="icon-btn" onClick={() => setIsDebtModalOpen(false)}><X size={24} /></button>
          </div>
          <form onSubmit={handleAddDebt}>
            <div className="form-group form-row" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                className={`btn ${debtType === 'they_owe' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', ...(debtType === 'they_owe' ? { background: 'var(--success)', color: 'white', boxShadow: 'none' } : {}) }}
                onClick={() => setDebtType('they_owe')}
              >
                <ArrowUpRight size={18} /> Bana Borcu Var
              </button>
              <button
                type="button"
                className={`btn ${debtType === 'i_owe' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', ...(debtType === 'i_owe' ? { background: 'var(--danger)', color: 'white', boxShadow: 'none' } : {}) }}
                onClick={() => setDebtType('i_owe')}
              >
                <ArrowDownRight size={18} /> Benim Borcum Var
              </button>
            </div>

            <div className="form-group">
              <label>Kişi / Kurum Adı</label>
              <input type="text" className="form-control" required placeholder="Örn: Ahmet, Enpara Kredi" value={debtPerson} onChange={(e) => setDebtPerson(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t("Tutar")} ({CURRENCY_SYMBOLS['TRY']})</label>
              <input type="number" className="form-control" required min="1" step="0.01" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tarih / Vade</label>
              <input type="date" className="form-control" required value={debtDate} onChange={(e) => setDebtDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Kısa Not / Açıklama (Opsiyonel)</label>
              <input type="text" className="form-control" placeholder="Örn: Yemek ücreti" value={debtNote} onChange={(e) => setDebtNote(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{t("Kaydet")}</button>
            </div>
          </form>
        </div>
      </div>

      {/* 6. Add Asset Modal */}
      <div className={`modal-overlay ${isAssetModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h2>Portföy Varlığı Ekle</h2>
            <button type="button" className="icon-btn" onClick={() => setIsAssetModalOpen(false)}><X size={24} /></button>
          </div>
          <form onSubmit={handleAddAsset}>
            <div className="form-group">
              <label>Varlık Tipi</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                {Object.keys(assetLabels).map(k => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setAssetType(k)}
                    className={`icon-picker-btn ${assetType === k ? 'selected' : ''}`}
                    style={{ flexDirection: 'row', padding: '12px', fontWeight: '500', fontSize: '0.85rem' }}
                  >
                    {assetIcons[k]}
                    <span>{assetLabels[k]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Varlık Adı / Kurum</label>
              <input type="text" className="form-control" required placeholder="Örn: Garanti BBVA, 15 Gram Altın" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Güncel Değer ({CURRENCY_SYMBOLS['TRY']})</label>
              <input type="number" className="form-control" required min="1" step="0.01" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Not: Belirttiğiniz değer "Toplam Net Servetiniz" formülüne dahil edilecektir.
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Portföye Ekle</button>
            </div>
          </form>
        </div>
      </div>

      {/* 7. Calendar Day Details Modal */}
      <div className={`modal-overlay ${selectedCalendarDay !== null ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h2>
              {selectedCalendarDay} {calendarDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </h2>
            <button type="button" className="icon-btn" onClick={() => setSelectedCalendarDay(null)}><X size={24} /></button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Bu güne ait işlenen finansal hareketler aşağıda listelenmiştir.
          </p>
          <div className="events-container modal-events" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {selectedCalendarDay !== null && calendarEvents[selectedCalendarDay]?.map((ev, i) => (
              <div key={`${ev.id}-${i}`} className="calendar-event" style={{ borderLeftColor: ev.color, padding: '12px 16px', marginBottom: '8px' }}>
                <div className="event-title" style={{ fontSize: '1rem', marginBottom: '6px' }}>{ev.title}</div>
                <div className="event-amount" style={{ color: ev.color, fontSize: '1.15rem' }}>
                  {formatCurrency(ev.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. V9 Custom Prompt Modal (Name Input) */}
      <div className={`modal-overlay ${isNameModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div className="modal-header" style={{ justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>NexSpend'e Hoş Geldin! ✨</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Sana nasıl hitap etmemizi istersin?
          </p>
          <form onSubmit={handleSaveName}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Göktuğ"
                required
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.1rem', padding: '12px' }}
              />
            </div>
            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Kullanmaya Başla</button>
            </div>
          </form>
        </div>
      </div>

      {/* 9. V9 Custom Confirm Modal (Reset App) */}
      <div className={`modal-overlay ${isResetModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', borderTop: '4px solid var(--danger)' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'white' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ marginBottom: '16px' }}>Tüm Verileri Silmek İstediğinize Emin Misiniz?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5' }}>
            Bu işlem cihazınızdaki <strong>tüm işlemleri, hedefleri, abonelikleri ve ayarları</strong> kalıcı olarak silecektir. Bu işlem geri alınamaz!
          </p>
          <div className="form-actions form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsResetModalOpen(false)}>Vazgeç</button>
            <button className="btn btn-primary" style={{ background: 'var(--danger)', color: 'white', border: 'none' }} onClick={handleResetApp}>Evet, Her Şeyi Sil</button>
          </div>
        </div>
      </div>

    </div >
  );
}

export default App;
