import { useState, useEffect } from 'react';
import Creature from './components/Creature';
import { AlertCircle, Gamepad2, Utensils, Moon, Sun, Timer, Activity } from 'lucide-react';

const Tamagotchi = () => {
  const [stage, setStage] = useState('egg');
  const [mood, setMood] = useState('normal');
  const [happiness, setHappiness] = useState(2);
  const [hunger, setHunger] = useState(2);
  const [tiredness, setTiredness] = useState(0);
  const [isLightOn, setIsLightOn] = useState(true);
  const [needsCleaning, setNeedsCleaning] = useState(false);
  const [uncleanCounter, setUncleanCounter] = useState(0);
  const [isSick, setIsSick] = useState(false);
  const [sicknessSeverity, setSicknessSeverity] = useState(0);
  const [isCritical, setIsCritical] = useState(false);
  const [criticalTimer, setCriticalTimer] = useState(0);
  const [age, setAge] = useState(0);

  // Update mood based on stats
  useEffect(() => {
    if (happiness > 3) setMood('happy');
    else if (happiness < 2) setMood('sad');
    else setMood('normal');
  }, [happiness]);
  
  // Check for death when critical
  useEffect(() => {
    if (isCritical && stage === 'hatched') {
      const deathChance = 0.1 + (criticalTimer * 0.1);
      if (Math.random() < deathChance) {
        setStage('dead');
      }
    }
  }, [isCritical, criticalTimer, stage]);

  // Status updates and tiredness reduction when sleeping
  useEffect(() => {
    if (stage === 'hatched') {
      const statusInterval = setInterval(() => {
        if (isCritical) {
          setCriticalTimer(prev => prev + 1);
        }

        if (uncleanCounter > 2 || tiredness > 3) {
          setIsSick(true);
          setSicknessSeverity(prev => Math.min(3, prev + 1));
        }

        setHunger(prev => Math.max(0, prev - 1));
        setHappiness(prev => Math.max(0, prev - 1));
        
        // Reduce tiredness when lights are off
        if (!isLightOn) {
          setTiredness(prev => Math.max(0, prev - 0.5)); // Now reduces every 0.5s
        } else {
          setTiredness(prev => Math.min(4, prev + 0.2));
        }

        setAge(prev => prev + 1);
      }, 6000);

      const cleaningInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          setNeedsCleaning(true);
          setUncleanCounter(prev => prev + 1);
        }
      }, 25000);

      return () => {
        clearInterval(statusInterval);
        clearInterval(cleaningInterval);
      };
    }
  }, [stage, uncleanCounter, tiredness, isCritical, isLightOn]);

  const FloatingEmoji = ({ emoji, x }: { emoji: string; x: number }) => (
    <div 
      className="absolute animate-[floatUp_1s_ease-out_forwards]"
      style={{ left: `${x}px` }}
    >
      {emoji}
    </div>
  );
  
  const [actionEmojis, setActionEmojis] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  let nextId = 0;

  // Update critical status based on sickness
  useEffect(() => {
    if (sicknessSeverity >= 3) {
      setIsCritical(true);
    }
  }, [sicknessSeverity]);

  // Egg hatching
  useEffect(() => {
    if (stage === 'egg') {
      const hatchTime = Math.random() * 5000;
      const timer = setTimeout(() => {
        setStage('hatched');
      }, hatchTime);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const feed = () => {
    if (stage === 'hatched') {
      setHunger(prev => Math.min(4, prev + 1));
      setTiredness(prev => Math.min(4, prev + 1));
      if (Math.random() > 0.9) {
        setIsSick(true);
        setSicknessSeverity(prev => prev + 1);
      }
      // Add floating emojis
      const newEmojis = Array(3).fill(0).map(() => ({
        id: nextId++,
        emoji: '🍖',
        x: Math.random() * 40 + 20 // Random position between 20-60px
      }));
      setActionEmojis(prev => [...prev, ...newEmojis]);
      // Clean up emojis after animation
      setTimeout(() => {
        setActionEmojis(prev => prev.filter(e => !newEmojis.includes(e)));
      }, 1000);
    }
  };

  const play = () => {
    if (stage === 'hatched') {
      setHappiness(prev => Math.min(4, prev + 1));
      setTiredness(prev => Math.min(4, prev + 1));
      // Add floating emojis
      const newEmojis = Array(3).fill(0).map(() => ({
        id: nextId++,
        emoji: '⭐',
        x: Math.random() * 40 + 20
      }));
      setActionEmojis(prev => [...prev, ...newEmojis]);
      setTimeout(() => {
        setActionEmojis(prev => prev.filter(e => !newEmojis.includes(e)));
      }, 1000);
    }
  };

  const clean = () => {
    if (stage === 'hatched') {
      setNeedsCleaning(false);
      setUncleanCounter(0);
    }
  };

  const toggleLight = () => {
    if (stage === 'hatched') {
      setIsLightOn(prev => !prev);
    }
  };

  const giveMedicine = () => {
    if (stage === 'hatched') {
      setIsSick(false);
      setSicknessSeverity(0);
      setIsCritical(false);
      setCriticalTimer(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <div className={`bg-gray-200 h-64 rounded-lg mb-6 flex flex-col items-center justify-center p-4 ${isLightOn ? 'opacity-100' : 'opacity-50'}`}>
          <div className="mb-4">
            {stage === 'egg' ? (
              <div className="text-6xl animate-bounce">🥚</div>
            ) : stage === 'dead' ? (
              <div className="text-6xl">💀</div>
            ) : (
            <div className="relative">
              {needsCleaning && <div className="absolute -top-8 left-8 text-3xl">💩</div>}
              <Creature mood={mood} sleeping={!isLightOn} />
              {isSick && <div className="absolute -top-8 right-8 text-3xl">🤒</div>}
              {isCritical && <div className="absolute top-0 right-0 text-3xl">⚠️</div>}
              {/* Floating action emojis */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {actionEmojis.map(({ id, emoji, x }) => (
                  <FloatingEmoji key={id} emoji={emoji} x={x} />
                ))}
              </div>
            </div>
            )}
          </div>
          
          <div className="flex flex-row justify-between items-center w-full px-4 gap-4 text-sm">
          <div className="w-24 flex items-center gap-1 bg-gray-300/10 px-3 py-1 rounded-md">
            {happiness === 0 ? (
              <span className="animate-[flash_1s_ease-in-out_infinite]">❤️</span>
            ) : (
              '❤️'.repeat(happiness)
            )}
          </div>
          <div className="w-24 flex items-center gap-1 bg-gray-300/10 px-3 py-1 rounded-md">
            {hunger === 0 ? (
              <span className="animate-[flash_1s_ease-in-out_infinite]">🍖</span>
            ) : (
              '🍖'.repeat(hunger)
            )}
          </div>
          <div className="w-24 flex items-center gap-1 bg-gray-300/10 px-3 py-1 rounded-md">
            {tiredness === 4 ? (
              <>
                {'😴'.repeat(3)}
                <span className="animate-[flash_1s_ease-in-out_infinite]">😴</span>
              </>
            ) : (
              '😴'.repeat(tiredness)
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={feed} 
          disabled={stage !== 'hatched'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Utensils size={16} /> Feed
        </button>
        <button 
          onClick={play}
          disabled={stage !== 'hatched'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gamepad2 size={16} /> Play
        </button>
        <button 
          onClick={toggleLight}
          disabled={stage !== 'hatched'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLightOn ? (
            <>
              <Moon size={16} /> Sleep
            </>
          ) : (
            <>
              <Sun size={16} /> Wake
            </>
          )}
        </button>
        <button 
          onClick={clean}
          disabled={stage !== 'hatched' || !needsCleaning}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AlertCircle size={16} /> Clean
        </button>
        <button 
          onClick={giveMedicine}
          disabled={stage !== 'hatched' || !isSick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Activity size={16} /> Medicine
        </button>
        <button 
          disabled 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Timer size={16} /> 
          {age} {
            age < 5 ? '👶' : 
            age < 10 ? '🧑' : 
            age < 15 ? '🧑‍🦱' :
            age < 20 ? '🧓' : '👴'
          }
        </button>
      </div>
      </div>
      </div>
    </div>
  );
};

export default Tamagotchi;