import { useState, useEffect } from 'react';
import Creature from './components/Creature';
import { Toilet, Gamepad2, Utensils, Moon, Sun, Timer, Activity } from 'lucide-react';

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
  const [age, setAge] = useState(12);
  const [isAnimating, setIsAnimating] = useState(false);
  const [careHistory, setCareHistory] = useState({ good: 0, bad: 0 });
  const [evolution, setEvolution] = useState<'good' | 'evil' | null>(null);
  const [feedCooldown, setFeedCooldown] = useState(false);
  const [playCooldown, setPlayCooldown] = useState(false);


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

  useEffect(() => {
    if (stage === 'hatched' && !evolution) {
      const interval = setInterval(() => {
        // More balanced conditions:
        const isGoodCare = 
          happiness >= 2 &&    // At least half happy
          hunger >= 2 &&      // At least half fed
          tiredness <= 2 &&   // Not too tired
          !isSick && 
          !needsCleaning;
        
        setCareHistory(prev => {
          const newHistory = {
            good: prev.good + (isGoodCare ? 1 : 0),
            bad: prev.bad + (isGoodCare ? 0 : 1)
          };
          return newHistory;
        });
      }, 500);
  
      return () => clearInterval(interval);
    }
  }, [stage, happiness, hunger, tiredness, isSick, needsCleaning, evolution]);
  
  // Add evolution check
  useEffect(() => {
    if (stage === 'hatched' && age === 14 && !evolution) {      
      const totalCare = careHistory.good + careHistory.bad;
      
      // Handle case where we have no care history
      if (totalCare === 0) {
        // Either set a default or use current stats to make the decision
        const currentStateGood = happiness > 2 && hunger > 1 && tiredness < 3 && !isSick && !needsCleaning;
        const randomFactor = Math.random() * 0.2;
        const finalScore = (currentStateGood ? 0.8 : 0.3) + randomFactor;
        
        const willBeGood = finalScore > 0.6;
        setEvolution(willBeGood ? 'good' : 'evil');
      } else {
        const goodRatio = careHistory.good / totalCare;
        const randomFactor = Math.random() * 0.2;
        const finalScore = goodRatio + randomFactor;
        
        const willBeGood = finalScore > 0.6;
        setEvolution(willBeGood ? 'good' : 'evil');
      }
    }
  }, [age, stage, careHistory, evolution, happiness, hunger, tiredness, isSick, needsCleaning]);

  // Modify how we pass type to Creature
  const getDisplayType = () => {
    if (!evolution) return 'baby';
    return evolution === 'good' ? `good` : `evil`;
  };

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
        
        // Faster tiredness reduction when sleeping
        if (!isLightOn) {
          setTiredness(prev => Math.max(0, prev - 2));
        } else {
          setTiredness(prev => Math.min(4, prev + 0.1));
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
      style={{ 
        left: `${x}px`,
        bottom: '-40px', // Start from bottom instead of middle
        fontSize: '2rem',
      }}
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
      const hatchTime = Math.random() * 1;
      const timer = setTimeout(() => {
        setStage('hatched');
      }, hatchTime);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const feed = () => {
    if (stage === 'hatched' && !isAnimating) {
      setIsAnimating(true);
      setFeedCooldown(true);
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
        setIsAnimating(false);
        setFeedCooldown(false);
      }, 1000);
    }
  };

  const play = () => {
    if (stage === 'hatched' && !isAnimating) {
      setIsAnimating(true);
      setPlayCooldown(true);
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
        setIsAnimating(false);
        setPlayCooldown(false);
      }, 500);
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

  const buttonDisabled = stage !== 'hatched' || !isLightOn

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-[3rem] max-w-md w-full aspect-[4/5] flex flex-col">
        <div className={`relative bg-gray-200 h-64 rounded-lg mb-6 flex flex-col items-center justify-center p-4 ${isLightOn ? 'opacity-100' : 'opacity-50'}`}>
          {/* Indicators in top left corner */}
          {/* <div className="absolute -top-4 -left-4 flex gap-2"> */}
          <div className="absolute top-1 left-2 flex flex-row gap-2 pointer-events-none z-10">
          {/* <div className="absolute top-4 flex flex-row gap-2" style={{ left: '-11rem' }}> */}

            {needsCleaning && <div className="text-2xl animate-[flash_2s_ease-in-out_infinite]">💩</div>}
            {isSick && <div className="text-2xl animate-[flash_2s_ease-in-out_infinite]">🤒</div>}
            {isCritical && <div className="text-2xl animate-[flash_2s_ease-in-out_infinite]">☠️</div>}
          </div>
          <div className="mb-4">
            {stage === 'egg' ? (
              <div className="text-6xl animate-bounce">🥚</div>
            ) : stage === 'dead' ? (
              <div className="text-6xl">💀</div>
            ) : (
              <div className="relative flex flex-col items-center overflow-visible h-full">
                <Creature mood={mood} type={getDisplayType()} sleeping={!isLightOn} />
                {/* Floating action emojis */}
                <div className="absolute inset-0 overflow-visible pointer-events-none">
                  {actionEmojis.map(({ id, emoji }) => (
                    <FloatingEmoji 
                      key={id} 
                      emoji={emoji} 
                      x={Math.random() * 200 - 100}
                    />
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
          onClick={play}
          disabled={buttonDisabled || playCooldown}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gamepad2 size={16} /> Play
        </button>
        <button 
          onClick={feed} 
          disabled={buttonDisabled || feedCooldown}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Utensils size={16} /> Feed
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
          disabled={buttonDisabled || !needsCleaning}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Toilet size={16} /> Clean
        </button>
        <button 
          onClick={giveMedicine}
          disabled={buttonDisabled || !isSick}
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