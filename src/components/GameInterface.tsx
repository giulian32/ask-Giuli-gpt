import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface GameInterfaceProps {
  language: 'en' | 'de';
}

const GameInterface: React.FC<GameInterfaceProps> = ({ language }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [ticTacToeBoard, setTicTacToeBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<string>('X');
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [luaCode, setLuaCode] = useState<string>('');
  const [luaOutput, setLuaOutput] = useState<string>('');
  const [currentQuiz, setCurrentQuiz] = useState<string>('basics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Tic Tac Toe Logic
  const checkWinner = (squares: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
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
      
      // Evaluate a Lua expression
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
        
        if (expr.includes('-')) {
          const parts = expr.split('-').map(p => p.trim());
          const left = evaluateExpression(parts[0]);
          const right = evaluateExpression(parts[1]);
          if (typeof left === 'number' && typeof right === 'number') {
            return left - right;
          }
        }
        
        if (expr.includes('*')) {
          const parts = expr.split('*').map(p => p.trim());
          const left = evaluateExpression(parts[0]);
          const right = evaluateExpression(parts[1]);
          if (typeof left === 'number' && typeof right === 'number') {
            return left * right;
          }
        }
        
        if (expr.includes('/')) {
          const parts = expr.split('/').map(p => p.trim());
          const left = evaluateExpression(parts[0]);
          const right = evaluateExpression(parts[1]);
          if (typeof left === 'number' && typeof right === 'number') {
            return left / right;
          }
        }
        
        // Handle comparison operators
        if (expr.includes('==')) {
          const parts = expr.split('==').map(p => p.trim());
          return evaluateExpression(parts[0]) === evaluateExpression(parts[1]);
        }
        
        if (expr.includes('<=')) {
          const parts = expr.split('<=').map(p => p.trim());
          return evaluateExpression(parts[0]) <= evaluateExpression(parts[1]);
        }
        
        if (expr.includes('>=')) {
          const parts = expr.split('>=').map(p => p.trim());
          return evaluateExpression(parts[0]) >= evaluateExpression(parts[1]);
        }
        
        if (expr.includes('<')) {
          const parts = expr.split('<').map(p => p.trim());
          return evaluateExpression(parts[0]) < evaluateExpression(parts[1]);
        }
        
        if (expr.includes('>')) {
          const parts = expr.split('>').map(p => p.trim());
          return evaluateExpression(parts[0]) > evaluateExpression(parts[1]);
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
        
        // Handle while loops
        const whileMatch = line.match(/^while\s+(.+?)\s+do$/);
        if (whileMatch) {
          const condition = whileMatch[1];
          const loopBody = [];
          i++;
          while (i < lines.length && lines[i].trim() !== 'end') {
            loopBody.push(lines[i]);
            i++;
          }
          
          let iterations = 0;
          while (evaluateExpression(condition) && iterations < 1000) {
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
            iterations++;
          }
          i++;
          continue;
        }
        
        // Handle if statements
        const ifMatch = line.match(/^if\s+(.+?)\s+then$/);
        if (ifMatch) {
          const condition = ifMatch[1];
          const ifBody = [];
          i++;
          while (i < lines.length && !['end', 'else'].includes(lines[i].trim())) {
            ifBody.push(lines[i]);
            i++;
          }
          
          let elseBody = [];
          if (i < lines.length && lines[i].trim() === 'else') {
            i++;
            while (i < lines.length && lines[i].trim() !== 'end') {
              elseBody.push(lines[i]);
              i++;
            }
          }
          
          const bodyToExecute = evaluateExpression(condition) ? ifBody : elseBody;
          for (const bodyLine of bodyToExecute) {
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
          i++;
          continue;
        }
        
        // Handle function definitions
        const funcMatch = line.match(/^function\s+(\w+)\s*\(/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          const funcBody = [];
          i++;
          while (i < lines.length && lines[i].trim() !== 'end') {
            funcBody.push(lines[i]);
            i++;
          }
          
          variables[funcName] = () => {
            let funcOutput = '';
            for (const bodyLine of funcBody) {
              const bodyTrimmed = bodyLine.trim();
              if (bodyTrimmed.includes('print(')) {
                const match = bodyTrimmed.match(/print\s*\((.+?)\)/);
                if (match) {
                  const value = evaluateExpression(match[1]);
                  funcOutput += (value === null ? 'nil' : String(value)) + '\n';
                }
              }
            }
            return funcOutput;
          };
          i++;
          continue;
        }
        
        // Handle function calls
        const funcCallMatch = line.match(/^(\w+)\s*\(\s*\)$/);
        if (funcCallMatch) {
          const funcName = funcCallMatch[1];
          if (variables[funcName] && typeof variables[funcName] === 'function') {
            output += variables[funcName]();
          }
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
      },
      {
        question: language === 'de' ? 'Wie startet man eine for-Schleife in Lua?' : 'How do you start a for loop in Lua?',
        options: ['for i=1,10 do', 'for(i=1;i<=10;i++)', 'for i in 1..10', 'repeat i=1 until 10'],
        correct: 'for i=1,10 do'
      },
      {
        question: language === 'de' ? 'Was ist nil in Lua?' : 'What is nil in Lua?',
        options: language === 'de' ?
          ['Ein Nullwert', 'Eine Zahl', 'Ein String', 'Ein Boolean'] :
          ['A null value', 'A number', 'A string', 'A boolean'],
        correct: language === 'de' ? 'Ein Nullwert' : 'A null value'
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
      },
      {
        question: language === 'de' ? 'Wie definiert man eine Funktion?' : 'How do you define a function?',
        options: ['function name() end', 'def name():', 'function name {}', 'func name()'],
        correct: 'function name() end'
      }
    ],
    advanced: [
      {
        question: language === 'de' ? 'Was ist eine Metatable?' : 'What is a metatable?',
        options: language === 'de' ?
          ['Eine Tabelle die das Verhalten anderer Tabellen kontrolliert', 'Eine große Tabelle', 'Eine Datenbank-Tabelle', 'Ein Array'] :
          ['A table that controls the behavior of other tables', 'A big table', 'A database table', 'An array'],
        correct: language === 'de' ? 'Eine Tabelle die das Verhalten anderer Tabellen kontrolliert' : 'A table that controls the behavior of other tables'
      },
      {
        question: language === 'de' ? 'Was macht pairs()?' : 'What does pairs() do?',
        options: language === 'de' ?
          ['Iteriert über alle Schlüssel-Wert-Paare', 'Erstellt Paare', 'Löscht Paare', 'Sortiert Paare'] :
          ['Iterates over all key-value pairs', 'Creates pairs', 'Deletes pairs', 'Sorts pairs'],
        correct: language === 'de' ? 'Iteriert über alle Schlüssel-Wert-Paare' : 'Iterates over all key-value pairs'
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
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setShowResult(false);
    setQuizCompleted(false);
  };

  const gameOptions = [
    { id: 'tic-tac-toe', name: language === 'de' ? 'Tic-Tac-Toe' : 'Tic-Tac-Toe' },
    { id: 'lua-learning', name: language === 'de' ? 'Lua/Luau Lernen' : 'Lua/Luau Learning' }
  ];

  const luaLearningOptions = [
    { id: 'how-it-works', name: language === 'de' ? 'Wie es funktioniert' : 'How it works' },
    { id: 'tutorial', name: language === 'de' ? 'Tutorial' : 'Tutorial' },
    { id: 'quiz', name: language === 'de' ? 'Quiz' : 'Quiz' },
    { id: 'compiler', name: language === 'de' ? 'Lua Compiler' : 'Lua Compiler' }
  ];

  if (!selectedGame) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          {language === 'de' ? 'Wähle ein Spiel' : 'Choose a Game'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameOptions.map((game) => (
            <Card key={game.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedGame(game.id)}>
              <CardHeader>
                <CardTitle className="text-center">{game.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (selectedGame === 'tic-tac-toe') {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => setSelectedGame(null)}>
            {language === 'de' ? 'Zurück' : 'Back'}
          </Button>
          <h1 className="text-3xl font-bold">Tic-Tac-Toe</h1>
          <Button onClick={resetTicTacToe}>
            {language === 'de' ? 'Neues Spiel' : 'New Game'}
          </Button>
        </div>
        
        {gameWon && (
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">
              {checkWinner(ticTacToeBoard) === 'X' 
                ? (language === 'de' ? 'Du hast gewonnen!' : 'You won!')
                : checkWinner(ticTacToeBoard) === 'O'
                ? (language === 'de' ? 'KI hat gewonnen!' : 'AI won!')
                : (language === 'de' ? 'Unentschieden!' : 'Draw!')
              }
            </h2>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 w-64 mx-auto">
          {ticTacToeBoard.map((square, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 w-20 text-2xl font-bold"
              onClick={() => handleSquareClick(index)}
              disabled={square !== null || gameWon}
            >
              {square}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (selectedGame === 'lua-learning') {
    if (!selectedSection) {
      return (
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => setSelectedGame(null)}>
              {language === 'de' ? 'Zurück' : 'Back'}
            </Button>
            <h1 className="text-3xl font-bold">
              {language === 'de' ? 'Lua/Luau Lernen' : 'Lua/Luau Learning'}
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {luaLearningOptions.map((option) => (
              <Card key={option.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedSection(option.id)}>
                <CardHeader>
                  <CardTitle className="text-center">{option.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (selectedSection === 'compiler') {
      return (
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => setSelectedSection(null)}>
              {language === 'de' ? 'Zurück' : 'Back'}
            </Button>
            <h1 className="text-3xl font-bold">
              {language === 'de' ? 'Lua Compiler' : 'Lua Compiler'}
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'de' ? 'Lua Code' : 'Lua Code'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={luaCode}
                  onChange={(e) => setLuaCode(e.target.value)}
                  placeholder={language === 'de' ? 'Gib deinen Lua Code hier ein...' : 'Enter your Lua code here...'}
                  className="min-h-[300px] font-mono"
                />
                <Button onClick={runLuaCode} className="mt-4 w-full">
                  {language === 'de' ? 'Code ausführen' : 'Run Code'}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{language === 'de' ? 'Ausgabe' : 'Output'}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded min-h-[300px] font-mono text-sm whitespace-pre-wrap">
                  {luaOutput || (language === 'de' ? 'Keine Ausgabe' : 'No output')}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (selectedSection === 'quiz') {
      if (quizCompleted) {
        return (
          <div className="w-full max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" onClick={() => setSelectedSection(null)}>
                {language === 'de' ? 'Zurück' : 'Back'}
              </Button>
              <h1 className="text-3xl font-bold">Quiz</h1>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  {language === 'de' ? 'Quiz Abgeschlossen!' : 'Quiz Completed!'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl mb-4">
                  {language === 'de' ? 'Dein Ergebnis:' : 'Your Score:'} {score}/{quizQuestions[currentQuiz].length}
                </p>
                <div className="space-x-4">
                  <Button onClick={resetQuiz}>
                    {language === 'de' ? 'Nochmal versuchen' : 'Try Again'}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedSection(null)}>
                    {language === 'de' ? 'Zurück zum Menü' : 'Back to Menu'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      const currentQuestion = quizQuestions[currentQuiz][currentQuestionIndex];

      return (
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => setSelectedSection(null)}>
              {language === 'de' ? 'Zurück' : 'Back'}
            </Button>
            <h1 className="text-3xl font-bold">Quiz</h1>
            <div className="flex space-x-2">
              <Button 
                variant={currentQuiz === 'basics' ? 'default' : 'outline'}
                onClick={() => { setCurrentQuiz('basics'); resetQuiz(); }}
              >
                {language === 'de' ? 'Basics' : 'Basics'}
              </Button>
              <Button 
                variant={currentQuiz === 'normal' ? 'default' : 'outline'}
                onClick={() => { setCurrentQuiz('normal'); resetQuiz(); }}
              >
                {language === 'de' ? 'Normal' : 'Normal'}
              </Button>
              <Button 
                variant={currentQuiz === 'advanced' ? 'default' : 'outline'}
                onClick={() => { setCurrentQuiz('advanced'); resetQuiz(); }}
              >
                {language === 'de' ? 'Schwer' : 'Advanced'}
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {language === 'de' ? 'Frage' : 'Question'} {currentQuestionIndex + 1} / {quizQuestions[currentQuiz].length}
                </CardTitle>
                <Badge variant="secondary">
                  {language === 'de' ? 'Punkte:' : 'Score:'} {score}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl mb-6">{currentQuestion.question}</h3>
              
              {!showResult && (
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? 'default' : 'outline'}
                      className="w-full text-left justify-start"
                      onClick={() => handleAnswerSelect(option)}
                    >
                      {option}
                    </Button>
                  ))}
                  
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!selectedAnswer}
                    className="w-full mt-6"
                  >
                    {language === 'de' ? 'Antwort bestätigen' : 'Submit Answer'}
                  </Button>
                </div>
              )}
              
              {showResult && (
                <div className="text-center">
                  <p className={`text-2xl font-bold mb-4 ${selectedAnswer === currentQuestion.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAnswer === currentQuestion.correct 
                      ? (language === 'de' ? 'Richtig!' : 'Correct!') 
                      : (language === 'de' ? 'Falsch!' : 'Wrong!')
                    }
                  </p>
                  {selectedAnswer !== currentQuestion.correct && (
                    <p className="text-lg">
                      {language === 'de' ? 'Richtige Antwort:' : 'Correct answer:'} {currentQuestion.correct}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // How it works and Tutorial sections would go here
    // For brevity, I'll just show a placeholder
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => setSelectedSection(null)}>
            {language === 'de' ? 'Zurück' : 'Back'}
          </Button>
          <h1 className="text-3xl font-bold">
            {selectedSection === 'how-it-works' 
              ? (language === 'de' ? 'Wie es funktioniert' : 'How it works')
              : (language === 'de' ? 'Tutorial' : 'Tutorial')
            }
          </h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-lg">
              {language === 'de' 
                ? 'Dieser Bereich wird bald verfügbar sein.' 
                : 'This section will be available soon.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default GameInterface;