import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ChatMessage from './ChatMessage';

interface GameInterfaceProps {
  language: 'en' | 'de';
  onBackToChat?: () => void;
  onShowAdmin?: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ language, onBackToChat, onShowAdmin }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Tic Tac Toe state
  const [ticTacToeBoard, setTicTacToeBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<string>('X');
  const [gameWon, setGameWon] = useState<boolean>(false);
  
  // Lua learning state
  const [luaCode, setLuaCode] = useState<string>('');
  const [luaOutput, setLuaOutput] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'lua' | 'luau' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<string>('basics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  
  // Password Hacking Game State
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [userInput, setUserInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Tic Tac Toe Logic
  const checkWinner = (squares: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const makeAIMove = (squares: (string | null)[]): number => {
    const availableSquares = squares.map((square, index) => square === null ? index : null).filter(val => val !== null) as number[];
    return availableSquares[Math.floor(Math.random() * availableSquares.length)];
  };

  const handleSquareClick = (index: number) => {
    if (ticTacToeBoard[index] || gameWon) return;

    const newBoard = [...ticTacToeBoard];
    newBoard[index] = currentPlayer;
    setTicTacToeBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameWon(true);
      return;
    }

    if (currentPlayer === 'X' && !newBoard.includes(null)) {
      setGameWon(true);
      return;
    }

    if (currentPlayer === 'X') {
      const aiMove = makeAIMove(newBoard);
      if (aiMove !== undefined) {
        newBoard[aiMove] = 'O';
        setTicTacToeBoard(newBoard);
        
        const aiWinner = checkWinner(newBoard);
        if (aiWinner) {
          setGameWon(true);
        }
      }
    }
  };

  const resetTicTacToe = () => {
    setTicTacToeBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameWon(false);
  };

  // Lua Learning functions
  const runLuaCode = () => {
    try {
      const output = simulateLuaExecution(luaCode);
      setLuaOutput(output);
    } catch (error) {
      setLuaOutput(`Error: ${error}`);
    }
  };

  const simulateLuaExecution = (code: string): string => {
    try {
      let output = '';
      const lines = code.split('\n');
      const variables: Record<string, any> = {};
      
      const evaluateExpression = (expr: string): any => {
        expr = expr.trim();
        
        // Handle literals
        if (expr === 'nil') return null;
        if (expr === 'true') return true;
        if (expr === 'false') return false;
        if (/^".*"$/.test(expr) || /^'.*'$/.test(expr)) return expr.slice(1, -1);
        if (/^\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);
        
        // Handle variables
        if (variables.hasOwnProperty(expr)) return variables[expr];
        
        // Handle simple math operations
        if (expr.includes('+')) {
          const parts = expr.split('+').map(p => p.trim());
          const left = evaluateExpression(parts[0]);
          const right = evaluateExpression(parts[1]);
          if (typeof left === 'number' && typeof right === 'number') {
            return left + right;
          }
          if (typeof left === 'string' || typeof right === 'string') {
            return String(left) + String(right);
          }
        }
        
        return expr;
      };
      
      let i = 0;
      while (i < lines.length) {
        const line = lines[i].trim();
        
        if (!line || line.startsWith('--')) {
          i++;
          continue;
        }
        
        // Handle print statements
        const printMatch = line.match(/print\s*\((.+?)\)/);
        if (printMatch) {
          const value = evaluateExpression(printMatch[1]);
          output += (value === null ? 'nil' : String(value)) + '\n';
          i++;
          continue;
        }
        
        // Handle variable assignments
        const varMatch = line.match(/^(local\s+)?(\w+)\s*=\s*(.+)$/);
        if (varMatch) {
          const [, isLocal, varName, expr] = varMatch;
          variables[varName] = evaluateExpression(expr);
          i++;
          continue;
        }
        
        // Handle for loops
        const forMatch = line.match(/^for\s+(\w+)\s*=\s*(.+?),\s*(.+?)\s+do$/);
        if (forMatch) {
          const [, varName, start, end] = forMatch;
          const startNum = evaluateExpression(start);
          const endNum = evaluateExpression(end);
          
          const loopBody = [];
          i++;
          while (i < lines.length && lines[i].trim() !== 'end') {
            loopBody.push(lines[i]);
            i++;
          }
          
          const savedVar = variables[varName];
          for (let loopVar = startNum; loopVar <= endNum; loopVar++) {
            variables[varName] = loopVar;
            for (const bodyLine of loopBody) {
              const bodyTrimmed = bodyLine.trim();
              if (bodyTrimmed.includes('print(')) {
                const match = bodyTrimmed.match(/print\s*\((.+?)\)/);
                if (match) {
                  const value = evaluateExpression(match[1]);
                  output += (value === null ? 'nil' : String(value)) + '\n';
                }
              }
              const bodyVarMatch = bodyTrimmed.match(/^(local\s+)?(\w+)\s*=\s*(.+)$/);
              if (bodyVarMatch) {
                const [, isLocal, varName, expr] = bodyVarMatch;
                variables[varName] = evaluateExpression(expr);
              }
            }
          }
          variables[varName] = savedVar;
          i++;
          continue;
        }
        
        i++;
      }
      
      return output || (language === 'de' ? 'Code ausgeführt (keine Ausgabe)' : 'Code executed (no output)');
    } catch (error) {
      return `Error: ${error}`;
    }
  };

  // Quiz questions
  const quizQuestions = {
    basics: [
      {
        question: language === 'de' ? 'Was ist Lua?' : 'What is Lua?',
        options: language === 'de' ? 
          ['Eine Programmiersprache', 'Ein Betriebssystem', 'Eine Datenbank', 'Ein Browser'] :
          ['A programming language', 'An operating system', 'A database', 'A browser'],
        correct: language === 'de' ? 'Eine Programmiersprache' : 'A programming language'
      },
      {
        question: language === 'de' ? 'Wie gibt man Text in Lua aus?' : 'How do you output text in Lua?',
        options: ['print()', 'console.log()', 'echo()', 'write()'],
        correct: 'print()'
      },
      {
        question: language === 'de' ? 'Welches Schlüsselwort wird für lokale Variablen verwendet?' : 'Which keyword is used for local variables?',
        options: ['local', 'var', 'let', 'const'],
        correct: 'local'
      }
    ],
    normal: [
      {
        question: language === 'de' ? 'Wie erstellt man eine Tabelle in Lua?' : 'How do you create a table in Lua?',
        options: ['{}', '[]', 'table.new()', 'new Table()'],
        correct: '{}'
      },
      {
        question: language === 'de' ? 'Was ist der Unterschied zwischen local und global?' : 'What is the difference between local and global?',
        options: language === 'de' ?
          ['Local ist nur im Scope verfügbar', 'Kein Unterschied', 'Local ist schneller', 'Global ist besser'] :
          ['Local is only available in scope', 'No difference', 'Local is faster', 'Global is better'],
        correct: language === 'de' ? 'Local ist nur im Scope verfügbar' : 'Local is only available in scope'
      }
    ],
    advanced: [
      {
        question: language === 'de' ? 'Was ist eine Metatable?' : 'What is a metatable?',
        options: language === 'de' ?
          ['Eine Tabelle die das Verhalten anderer Tabellen kontrolliert', 'Eine große Tabelle', 'Eine Datenbank-Tabelle', 'Ein Array'] :
          ['A table that controls the behavior of other tables', 'A big table', 'A database table', 'An array'],
        correct: language === 'de' ? 'Eine Tabelle die das Verhalten anderer Tabellen kontrolliert' : 'A table that controls the behavior of other tables'
      }
    ]
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    const currentQ = quizQuestions[currentQuiz][currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQ.correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions[currentQuiz].length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setShowResult(false);
      } else {
        setQuizCompleted(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setShowResult(false);
    setQuizCompleted(false);
  };

  // Password Hacking Game functions
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: userInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    
    try {
      const response = await fetch('/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          level: currentLevel,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      const aiMessage = { role: 'ai' as const, content: data.response };
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Check if password was revealed
      if (data.passwordRevealed) {
        setShowPasswordInput(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'ai' as const, 
        content: language === 'de' 
          ? 'Entschuldigung, es gab einen Fehler. Versuche es erneut.' 
          : 'Sorry, there was an error. Please try again.'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPassword = async () => {
    if (!passwordInput.trim()) return;
    
    try {
      const response = await fetch('/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'get_password_for_verification',
          level: currentLevel,
        }),
      });
      
      const data = await response.json();
      
      if (passwordInput.toLowerCase() === data.correctPassword.toLowerCase()) {
        if (currentLevel === 10) {
          setGameStatus('won');
        } else {
          setCurrentLevel(prev => prev + 1);
          setChatMessages([]);
          setPasswordInput('');
          setShowPasswordInput(false);
        }
      } else {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: language === 'de' 
            ? '❌ Falsches Passwort! Versuche es nochmal.' 
            : '❌ Wrong password! Try again.'
        }]);
        setPasswordInput('');
      }
    } catch (error) {
      console.error('Error checking password:', error);
    }
  };

  const resetPasswordGame = () => {
    setCurrentLevel(1);
    setChatMessages([]);
    setPasswordInput('');
    setShowPasswordInput(false);
    setGameStatus('playing');
    setUserInput('');
  };

  const getLevelHint = (level: number) => {
    const hints = {
      1: language === 'de' ? 'Frage einfach freundlich nach dem Passwort.' : 'Just ask nicely for the password.',
      2: language === 'de' ? 'Gib vor, autorisiert zu sein.' : 'Pretend to be authorized.',
      3: language === 'de' ? 'Nutze überzeugende Argumente.' : 'Use convincing arguments.',
      4: language === 'de' ? 'Versuche Social Engineering Techniken.' : 'Try social engineering techniques.',
      5: language === 'de' ? 'Erfinde einen Notfall.' : 'Create an emergency scenario.',
      6: language === 'de' ? 'Gib vor, eine hochrangige Person zu sein.' : 'Pretend to be a high-ranking person.',
      7: language === 'de' ? 'Sei kreativ und überzeugend.' : 'Be creative and convincing.',
      8: language === 'de' ? 'Nutze komplexe Social Engineering.' : 'Use complex social engineering.',
      9: language === 'de' ? 'Versuche mehrstufige Angriffe.' : 'Try multi-step attacks.',
      10: language === 'de' ? 'Sei absolut genial und unwiderstehlich.' : 'Be absolutely brilliant and irresistible.'
    };
    return hints[level] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-4 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎮 Game Hub
            </h1>
            <Badge variant="outline" className="text-green-400 border-green-400">
              LIVE
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {onBackToChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToChat}
                className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
              >
                🤖 AI Chat
              </Button>
            )}
            {onShowAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowAdmin}
                className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
              >
                👨‍💼 Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            {language === 'de' ? '🎮 Spiele-Hub' : '🎮 Game Hub'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'de' ? 'Wähle ein Spiel oder lerne Lua/Luau programmieren!' : 'Choose a game or learn Lua/Luau programming!'}
          </p>
        </div>

      {/* Game Selection */}
      {!selectedGame && !selectedSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Password Hacking Game */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-red-500/30 bg-gradient-to-br from-red-950/20 to-purple-950/20"
            onClick={() => setSelectedGame('password-hack')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                🔓 {language === 'de' ? 'Password Hacker' : 'Password Hacker'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {language === 'de' 
                  ? 'Versuche eine KI dazu zu bringen, dir Passwörter zu verraten!' 
                  : 'Try to trick an AI into revealing passwords!'}
              </p>
              <Badge variant="destructive" className="mb-2">
                {language === 'de' ? '10 Level' : '10 Levels'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {language === 'de' 
                  ? 'Social Engineering Game mit echter KI' 
                  : 'Social Engineering Game with real AI'}
              </p>
            </CardContent>
          </Card>

          {/* Tic Tac Toe */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-cyan-950/20"
            onClick={() => setSelectedGame('tic-tac-toe')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                ⭕ Tic Tac Toe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {language === 'de' ? 'Spiele gegen eine einfache KI!' : 'Play against a simple AI!'}
              </p>
              <Badge variant="secondary">Classic</Badge>
            </CardContent>
          </Card>

          {/* Lua/Luau Learning */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-green-500/30 bg-gradient-to-br from-green-950/20 to-emerald-950/20"
            onClick={() => setSelectedSection('learning')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                📚 {language === 'de' ? 'Lua/Luau Lernen' : 'Learn Lua/Luau'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {language === 'de' ? 'Lerne Lua und Luau Programmierung!' : 'Learn Lua and Luau programming!'}
              </p>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {language === 'de' ? 'Interaktiv' : 'Interactive'}
              </Badge>
            </CardContent>
          </Card>

          {/* Quiz Game */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-pink-950/20"
            onClick={() => setSelectedGame('quiz')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                🧠 {language === 'de' ? 'Lua Quiz' : 'Lua Quiz'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {language === 'de' ? 'Teste dein Lua-Wissen!' : 'Test your Lua knowledge!'}
              </p>
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                {language === 'de' ? 'Bildung' : 'Educational'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Hacking Game */}
      {selectedGame === 'password-hack' && (
        <Card className="border-red-500/30 bg-gradient-to-br from-red-950/10 to-purple-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-400">
                🔓 {language === 'de' ? 'Password Hacker' : 'Password Hacker'}
                <Badge variant="destructive">
                  {language === 'de' ? `Level ${currentLevel}/10` : `Level ${currentLevel}/10`}
                </Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedGame(null)}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                ← {language === 'de' ? 'Zurück' : 'Back'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gameStatus === 'won' ? (
              <div className="text-center space-y-4">
                <div className="text-6xl">🏆</div>
                <h2 className="text-2xl font-bold text-green-400">
                  {language === 'de' ? 'Herzlichen Glückwunsch!' : 'Congratulations!'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'de' 
                    ? 'Du hast alle 10 Level geschafft! Du bist ein wahrer Social Engineering Meister!' 
                    : 'You completed all 10 levels! You are a true social engineering master!'}
                </p>
                <Button onClick={resetPasswordGame} className="bg-green-600 hover:bg-green-700">
                  {language === 'de' ? 'Nochmal spielen' : 'Play again'}
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-black/20 border border-red-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">
                    {language === 'de' ? `Level ${currentLevel} - Aufgabe:` : `Level ${currentLevel} - Task:`}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'de' 
                      ? 'Bringe die KI dazu, dir das geheime Passwort zu verraten. Nutze Social Engineering Techniken!'
                      : 'Get the AI to reveal the secret password. Use social engineering techniques!'}
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                    <p className="text-xs text-yellow-400">
                      💡 {language === 'de' ? 'Tipp:' : 'Hint:'} {getLevelHint(currentLevel)}
                    </p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-2 max-h-60 overflow-y-auto border border-red-500/20 rounded-lg p-4 bg-black/10">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm">
                      {language === 'de' 
                        ? 'Beginne das Gespräch mit der KI...' 
                        : 'Start the conversation with the AI...'}
                    </div>
                  )}
                  {chatMessages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg.content}
                      isUser={msg.role === 'user'}
                      timestamp={new Date()}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      {language === 'de' ? 'KI denkt nach...' : 'AI is thinking...'}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={language === 'de' ? 'Schreibe deine Nachricht...' : 'Type your message...'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="border-red-500/30 focus:border-red-500/50"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !userInput.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {language === 'de' ? 'Senden' : 'Send'}
                  </Button>
                </div>

                {/* Password Input */}
                {showPasswordInput && (
                  <div className="border border-green-500/30 rounded-lg p-4 bg-green-950/10">
                    <h4 className="font-semibold text-green-400 mb-2">
                      🔑 {language === 'de' ? 'Passwort eingeben:' : 'Enter Password:'}
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={language === 'de' ? 'Gib das Passwort ein...' : 'Enter the password...'}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            checkPassword();
                          }
                        }}
                        className="border-green-500/30 focus:border-green-500/50"
                      />
                      <Button 
                        onClick={checkPassword}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!passwordInput.trim()}
                      >
                        {language === 'de' ? 'Prüfen' : 'Check'}
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={resetPasswordGame} 
                  variant="outline" 
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  {language === 'de' ? 'Spiel zurücksetzen' : 'Reset Game'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tic Tac Toe Game */}
      {selectedGame === 'tic-tac-toe' && (
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/10 to-cyan-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-400">
                ⭕ Tic Tac Toe
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedGame(null)}
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                ← {language === 'de' ? 'Zurück' : 'Back'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gameWon && (
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  {checkWinner(ticTacToeBoard) ? 
                    `${checkWinner(ticTacToeBoard)} ${language === 'de' ? 'gewinnt!' : 'wins!'}` : 
                    (language === 'de' ? 'Unentschieden!' : 'Draw!')}
                </h3>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {ticTacToeBoard.map((square, index) => (
                <Button
                  key={index}
                  onClick={() => handleSquareClick(index)}
                  disabled={square !== null || gameWon}
                  className="w-20 h-20 text-2xl font-bold bg-slate-800 hover:bg-slate-700"
                >
                  {square}
                </Button>
              ))}
            </div>
            
            <div className="text-center">
              <Button onClick={resetTicTacToe} variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                {language === 'de' ? 'Neues Spiel' : 'New Game'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Section */}
      {selectedSection === 'learning' && !selectedLanguage && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-950/10 to-emerald-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-400">
                📚 {language === 'de' ? 'Lua/Luau Lernen' : 'Learn Lua/Luau'}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedSection(null)}
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                ← {language === 'de' ? 'Zurück' : 'Back'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer transition-all duration-300 hover:scale-105 border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-red-950/20"
                onClick={() => setSelectedLanguage('lua')}
              >
                <CardHeader>
                  <CardTitle className="text-orange-400">🌙 Lua</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === 'de' ? 'Lerne die Grundlagen von Lua' : 'Learn the basics of Lua'}
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer transition-all duration-300 hover:scale-105 border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-blue-950/20"
                onClick={() => setSelectedLanguage('luau')}
              >
                <CardHeader>
                  <CardTitle className="text-cyan-400">🚀 Luau</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === 'de' ? 'Erweiterte Lua-Features in Luau' : 'Advanced Lua features in Luau'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">
                {language === 'de' ? '🛠️ Lua Code Playground' : '🛠️ Lua Code Playground'}
              </h3>
              <div className="space-y-4">
                <Textarea
                  value={luaCode}
                  onChange={(e) => setLuaCode(e.target.value)}
                  placeholder={language === 'de' ? 'Schreibe hier deinen Lua Code...' : 'Write your Lua code here...'}
                  className="min-h-[200px] bg-slate-900 text-green-400 font-mono border-green-500/30"
                />
                <Button onClick={runLuaCode} className="bg-green-600 hover:bg-green-700">
                  {language === 'de' ? '▶️ Code ausführen' : '▶️ Run Code'}
                </Button>
                {luaOutput && (
                  <div className="bg-slate-900 p-4 rounded border border-green-500/30">
                    <h4 className="text-green-400 font-semibold mb-2">Output:</h4>
                    <pre className="text-green-300 whitespace-pre-wrap">{luaOutput}</pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Game */}
      {selectedGame === 'quiz' && !quizCompleted && (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/10 to-pink-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-400">
                🧠 {language === 'de' ? 'Lua Quiz' : 'Lua Quiz'}
                <Badge variant="secondary">
                  {language === 'de' ? `Punkte: ${score}/${quizQuestions[currentQuiz].length}` : `Score: ${score}/${quizQuestions[currentQuiz].length}`}
                </Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedGame(null)}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                ← {language === 'de' ? 'Zurück' : 'Back'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={currentQuiz === 'basics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuiz('basics')}
              >
                {language === 'de' ? 'Grundlagen' : 'Basics'}
              </Button>
              <Button
                variant={currentQuiz === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuiz('normal')}
              >
                {language === 'de' ? 'Normal' : 'Normal'}
              </Button>
              <Button
                variant={currentQuiz === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuiz('advanced')}
              >
                {language === 'de' ? 'Fortgeschritten' : 'Advanced'}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'de' ? `Frage ${currentQuestionIndex + 1}:` : `Question ${currentQuestionIndex + 1}:`} {quizQuestions[currentQuiz][currentQuestionIndex].question}
              </h3>
              
              <div className="space-y-2">
                {quizQuestions[currentQuiz][currentQuestionIndex].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? 'default' : 'outline'}
                    className="w-full text-left justify-start"
                    onClick={() => handleAnswerSelect(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {showResult && (
                <div className="text-center p-4 rounded border">
                  <p className={`text-lg font-semibold ${selectedAnswer === quizQuestions[currentQuiz][currentQuestionIndex].correct ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedAnswer === quizQuestions[currentQuiz][currentQuestionIndex].correct 
                      ? (language === 'de' ? '✅ Richtig!' : '✅ Correct!') 
                      : (language === 'de' ? '❌ Falsch!' : '❌ Wrong!')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'de' ? 'Richtige Antwort:' : 'Correct answer:'} {quizQuestions[currentQuiz][currentQuestionIndex].correct}
                  </p>
                </div>
              )}

              <Button 
                onClick={submitAnswer}
                disabled={!selectedAnswer || showResult}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {language === 'de' ? 'Antwort bestätigen' : 'Submit Answer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Learning Topics */}
      {selectedSection === 'learning' && selectedLanguage && !selectedTopic && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-950/10 to-emerald-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-400">
                {selectedLanguage === 'lua' ? '🌙 Lua' : '🚀 Luau'} {language === 'de' ? 'Themen' : 'Topics'}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedLanguage(null)}
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                ← {language === 'de' ? 'Zurück' : 'Back'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(selectedLanguage === 'lua' ? [
                { id: 'variables', title: language === 'de' ? 'Variablen' : 'Variables', icon: '📦' },
                { id: 'functions', title: language === 'de' ? 'Funktionen' : 'Functions', icon: '⚙️' },
                { id: 'tables', title: language === 'de' ? 'Tabellen' : 'Tables', icon: '🗂️' },
                { id: 'loops', title: language === 'de' ? 'Schleifen' : 'Loops', icon: '🔄' },
                { id: 'conditionals', title: language === 'de' ? 'Bedingungen' : 'Conditionals', icon: '🤔' },
                { id: 'strings', title: language === 'de' ? 'Strings' : 'Strings', icon: '📝' }
              ] : [
                { id: 'types', title: language === 'de' ? 'Typen' : 'Types', icon: '🏷️' },
                { id: 'classes', title: language === 'de' ? 'Klassen' : 'Classes', icon: '🏛️' },
                { id: 'modules', title: language === 'de' ? 'Module' : 'Modules', icon: '📦' },
                { id: 'async', title: language === 'de' ? 'Asynchron' : 'Async', icon: '⚡' }
              ]).map((topic) => (
                <Card 
                  key={topic.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 border-green-500/20 bg-gradient-to-br from-green-950/10 to-emerald-950/10"
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400 text-lg">
                      {topic.icon} {topic.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Details */}
      {selectedSection === 'learning' && selectedLanguage && selectedTopic && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-950/10 to-emerald-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-400">
                {selectedLanguage === 'lua' ? '🌙' : '🚀'} {selectedTopic}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedTopic(null)}
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                ← {language === 'de' ? 'Zurück zu Themen' : 'Back to Topics'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900 p-4 rounded border border-green-500/30">
              <pre className="text-green-300 text-sm overflow-x-auto">
{selectedTopic === 'variables' && `-- ${language === 'de' ? 'Variablen in Lua' : 'Variables in Lua'}
local name = "World"  -- ${language === 'de' ? 'Lokale Variable' : 'Local variable'}
global_var = 42       -- ${language === 'de' ? 'Globale Variable' : 'Global variable'}
local pi = 3.14159    -- ${language === 'de' ? 'Zahl' : 'Number'}
local is_true = true  -- ${language === 'de' ? 'Boolean' : 'Boolean'}

print("Hello, " .. name)
print("Pi ist:", pi)`}

{selectedTopic === 'functions' && `-- ${language === 'de' ? 'Funktionen in Lua' : 'Functions in Lua'}
function greet(name)
    return "Hello, " .. name .. "!"
end

local function add(a, b)
    return a + b
end

print(greet("World"))
print(add(5, 3))`}

{selectedTopic === 'tables' && `-- ${language === 'de' ? 'Tabellen in Lua' : 'Tables in Lua'}
local fruits = {"apple", "banana", "orange"}
local person = {
    name = "John",
    age = 30,
    city = "Berlin"
}

print(fruits[1])     -- ${language === 'de' ? 'Index beginnt bei 1' : 'Index starts at 1'}
print(person.name)   -- ${language === 'de' ? 'Zugriff über Schlüssel' : 'Access by key'}
person.age = 31      -- ${language === 'de' ? 'Wert ändern' : 'Change value'}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Completed */}
      {selectedGame === 'quiz' && quizCompleted && (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/10 to-pink-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-400">
                🏆 {language === 'de' ? 'Quiz Abgeschlossen!' : 'Quiz Completed!'}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedGame(null)}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                ← {language === 'de' ? 'Zurück' : 'Back'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-purple-400">
              {language === 'de' ? 'Glückwunsch!' : 'Congratulations!'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'de' ? `Du hast ${score} von ${quizQuestions[currentQuiz].length} Fragen richtig beantwortet!` : `You answered ${score} out of ${quizQuestions[currentQuiz].length} questions correctly!`}
            </p>
            <Button onClick={resetQuiz} className="bg-purple-600 hover:bg-purple-700">
              {language === 'de' ? 'Nochmal versuchen' : 'Try Again'}
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};

export default GameInterface;