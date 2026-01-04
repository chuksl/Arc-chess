
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useSearchParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Trophy, Users, User, Shield, Zap, Info, Wallet, LogOut, ChevronRight, Share2, Copy } from 'lucide-react';
import { connectWallet, payMatchFee, switchToArcNetwork } from './services/web3Service';
import { getGeminiChessMove, analyzeGamePosition } from './services/geminiService';
import { GameMode, GameState, MatchSession } from './types';
import { WAGER_AMOUNT } from './constants';

// --- Shared Components ---

const Navbar: React.FC<{ account: string | null; onConnect: () => void }> = ({ account, onConnect }) => (
  <nav className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="bg-blue-600 p-2 rounded-lg">
        <Shield className="text-white w-6 h-6" />
      </div>
      <span className="text-xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">ARC CHESS</span>
    </div>
    <div className="flex items-center gap-4">
      {account ? (
        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-slate-300">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-all shadow-lg shadow-blue-900/20"
        >
          <Wallet size={18} />
          Connect Wallet
        </button>
      )}
    </div>
  </nav>
);

// --- Pages ---

const LandingPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          <Zap size={14} /> Arc Network Testnet v1.0
        </div>
        <h1 className="text-6xl md:text-7xl font-black leading-tight text-white">
          Wager. Move.<br />
          <span className="text-blue-500">Conquer.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
          The first decentralized chess arena on Arc Network. Play against high-level AI or challenge friends with USDC wagers.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            to="/play?mode=SINGLE_PLAYER"
            className="group flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold transition-all hover:scale-105"
          >
            <User size={20} />
            Play Solo vs AI
          </Link>
          <Link
            to="/multiplayer"
            className="group flex items-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold border border-slate-700 transition-all hover:bg-slate-700"
          >
            <Users size={20} />
            Multiplayer Arena
          </Link>
        </div>
      </div>
      <div className="flex-1 w-full max-w-md bg-slate-800/50 rounded-3xl border border-slate-700 p-8 transform rotate-3 shadow-2xl">
        <div className="aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {/* Visual placeholder for chess board art */}
            <div className="grid grid-cols-4 gap-4 p-8 opacity-20">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className={`w-12 h-12 rounded ${i % 2 === 0 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                ))}
            </div>
            <Trophy className="absolute text-blue-500 w-24 h-24 drop-shadow-glow" />
        </div>
      </div>
    </div>
  );
};

const GameView: React.FC<{ account: string | null }> = ({ account }) => {
  const [params] = useSearchParams();
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState>(GameState.WAGERING);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string>('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);

  const mode = params.get('mode') as GameMode || GameMode.SINGLE_PLAYER;
  const isSinglePlayer = mode === GameMode.SINGLE_PLAYER;

  useEffect(() => {
    if (gameState === GameState.WAGERING && !isSinglePlayer) {
       // Multiplayer wagering logic would go here
    }
  }, [gameState, isSinglePlayer]);

  const handlePayment = async () => {
    if (!account) {
        alert("Please connect your wallet first.");
        return;
    }
    try {
        const hash = await payMatchFee(account, WAGER_AMOUNT);
        setTxHash(hash);
        setGameState(GameState.PLAYING);
    } catch (e) {
        alert("Transaction failed or rejected.");
    }
  };

  const makeMove = (move: any) => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory(prev => [...prev, result.san]);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (gameState !== GameState.PLAYING) return false;
    
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move && isSinglePlayer && !game.isGameOver()) {
      setIsAiThinking(true);
      // Let AI think for a bit
      setTimeout(async () => {
        try {
          const aiResponse = await getGeminiChessMove(game.fen(), moveHistory);
          makeMove(aiResponse.move);
        } catch (error) {
          // Fallback simple move if AI fails
          const moves = game.moves();
          if (moves.length > 0) makeMove(moves[0]);
        }
        setIsAiThinking(false);
      }, 500);
    }
    return move;
  };

  const analyzePos = async () => {
    const analysis = await analyzeGamePosition(game.fen());
    setLastAnalysis(analysis);
  };

  if (gameState === GameState.WAGERING) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
            <Zap className="text-blue-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">Arc Network Match Entry</h2>
          <p className="text-slate-400">To start a competitive match, a network fee of <span className="text-white font-bold">{WAGER_AMOUNT} USDC</span> is required.</p>
          <div className="p-4 bg-slate-800/50 rounded-xl text-left border border-slate-700">
             <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Network</span>
                <span className="text-white">Arc Testnet</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Entry Fee</span>
                <span className="text-green-400 font-mono">0.01 USDC</span>
             </div>
          </div>
          <button
            onClick={handlePayment}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-900/20"
          >
            Confirm & Start Match
          </button>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Powered by Arc EVM Engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <div className="aspect-square bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl relative">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation="white"
            customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
            customLightSquareStyle={{ backgroundColor: '#334155' }}
          />
          {isAiThinking && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="bg-slate-900 px-6 py-4 rounded-full flex items-center gap-3 border border-slate-700 shadow-xl">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-sm font-semibold">Gemini AI is thinking...</span>
                </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Zap className="text-blue-500 w-5 h-5" /> Match Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-sm">Opponent</span>
              <span className="font-semibold text-white">{isSinglePlayer ? 'Gemini Grandmaster' : 'Waiting for Peer...'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-sm">Wager</span>
              <span className="font-mono text-green-400">0.01 USDC</span>
            </div>
            {txHash && (
               <div className="text-[10px] font-mono text-slate-500 break-all bg-slate-800 p-2 rounded">
                 TX: {txHash}
               </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Info className="text-purple-500 w-5 h-5" /> Game Analysis
          </h3>
          <div className="space-y-4">
            <button
                onClick={analyzePos}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase rounded-lg border border-slate-700 transition-colors"
            >
                Get AI Analysis
            </button>
            <p className="text-sm text-slate-400 italic">
              {lastAnalysis || "Move pieces to begin analysis."}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-48 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Move History</h3>
          <div className="grid grid-cols-2 gap-2">
            {moveHistory.map((m, i) => (
              <div key={i} className="text-sm font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">
                {Math.floor(i / 2) + 1}. {i % 2 === 0 ? 'W' : 'B'}: {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiplayerLobby: React.FC<{ account: string | null }> = ({ account }) => {
    const [inviteCode, setInviteCode] = useState<string>('');
    const [joinedCode, setJoinedCode] = useState<string>('');

    const generateInvite = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setInviteCode(code);
    };

    const copyInviteLink = () => {
        const url = `${window.location.origin}/#/play?mode=MULTIPLAYER&room=${inviteCode}`;
        navigator.clipboard.writeText(url);
        alert("Invite link copied to clipboard!");
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="text-blue-500" /> Create Match
                    </h2>
                    <p className="text-slate-400 text-sm">Generate a secure room and invite your opponent for a 0.01 USDC wager match.</p>
                    
                    {inviteCode ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-xl text-blue-400">
                                <span>{inviteCode}</span>
                                <button onClick={copyInviteLink} className="p-2 hover:text-white transition-colors">
                                    <Copy size={18} />
                                </button>
                            </div>
                            <Link 
                                to={`/play?mode=MULTIPLAYER&room=${inviteCode}`}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 rounded-xl font-bold"
                            >
                                Enter Lobby <ChevronRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={generateInvite}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-slate-700 transition-all"
                        >
                            Generate Invite Link
                        </button>
                    )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="text-purple-500" /> Join Match
                    </h2>
                    <p className="text-slate-400 text-sm">Enter an invite code provided by your opponent to join a wagered match.</p>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="INVITE CODE (e.g. A9B2X)"
                            value={joinedCode}
                            onChange={(e) => setJoinedCode(e.target.value.toUpperCase())}
                            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl text-white font-mono placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                        <Link 
                            to={`/play?mode=MULTIPLAYER&room=${joinedCode}`}
                            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all ${joinedCode.length < 5 ? 'bg-slate-800 text-slate-600 pointer-events-none' : 'bg-purple-600 text-white'}`}
                        >
                            Join Arena <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      // Auto switch to Arc is handled in connectWallet
    } catch (e) {
      alert("Failed to connect wallet.");
    }
  };

  useEffect(() => {
    // Check if already connected
    if (window.ethereum?.selectedAddress) {
        setAccount(window.ethereum.selectedAddress);
        switchToArcNetwork();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar account={account} onConnect={handleConnect} />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/play" element={<GameView account={account} />} />
          <Route path="/multiplayer" element={<MultiplayerLobby account={account} />} />
        </Routes>

        <footer className="mt-20 border-t border-slate-800 py-10 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                    <Shield size={16} />
                    <span>© 2024 Arc Network Chess. Audited & Secure.</span>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                    <a href="#" className="hover:text-white transition-colors">Arc Explorer</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                </div>
            </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
